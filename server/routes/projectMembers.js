// server/routes/projectMembers.js
const express = require('express');
const { authenticateUser, requireAuth, checkResourceAccess, extractUserId } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Data file paths
const MEMBERSHIPS_FILE = path.join(__dirname, '../data/memberships.json');
const PROJECTS_FILE = path.join(__dirname, '../data/projects.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(MEMBERSHIPS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Read data from file
const readData = async (filePath, defaultValue = []) => {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeData(filePath, defaultValue);
      return defaultValue;
    }
    throw error;
  }
};

// Write data to file
const writeData = async (filePath, data) => {
  await ensureDataDirectory();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Middleware to check project membership and role
const checkProjectAccess = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.userId;

      // Check if project exists
      const projects = await readData(PROJECTS_FILE);
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Check membership
      const memberships = await readData(MEMBERSHIPS_FILE);
      const membership = memberships.find(m => m.projectId === projectId && m.userId === userId);
      
      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not a member of this project'
        });
      }

      // Check role if required
      if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied: Requires ${requiredRoles.join(' or ')} role. Your role: ${membership.role}`
        });
      }

      // Attach membership info to request
      req.membership = membership;
      req.project = project;
      next();
    } catch (error) {
      console.error('Error checking project access:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

// GET /api/projects/:id/members - Get project members
router.get('/:projectId/members', checkProjectAccess(), async (req, res) => {
  try {
    const { projectId } = req.params;

    const memberships = await readData(MEMBERSHIPS_FILE);
    const projectMembers = memberships.filter(m => m.projectId === projectId);

    // Sort by role (owner first, then admin, then member) and join date
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    projectMembers.sort((a, b) => {
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return roleOrder[a.role] - roleOrder[b.role];
      }
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    res.json({
      success: true,
      data: projectMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        userEmail: member.userEmail,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    });
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/projects/:id/members/:userId - Update member role
router.put('/:projectId/members/:userId', checkProjectAccess(['owner', 'admin']), async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.userId;

    // Validate role
    const validRoles = ['owner', 'admin', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: owner, admin, member'
      });
    }

    // Prevent users from changing their own role
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot change your own role'
      });
    }

    // Prevent non-owners from promoting to owner
    if (role === 'owner' && req.membership.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only owners can promote users to owner role'
      });
    }

    const memberships = await readData(MEMBERSHIPS_FILE);
    const memberIndex = memberships.findIndex(m => m.projectId === projectId && m.userId === userId);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    const member = memberships[memberIndex];

    // Prevent demoting the last owner
    if (member.role === 'owner' && role !== 'owner') {
      const ownerCount = memberships.filter(m => m.projectId === projectId && m.role === 'owner').length;
      if (ownerCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot demote the last owner of the project'
        });
      }
    }

    // Update role
    memberships[memberIndex].role = role;
    memberships[memberIndex].updatedAt = new Date().toISOString();

    await writeData(MEMBERSHIPS_FILE, memberships);

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: {
        userId: member.userId,
        userEmail: member.userEmail,
        role: role,
        updatedAt: memberships[memberIndex].updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member from project
router.delete('/:projectId/members/:userId', checkProjectAccess(['owner', 'admin']), async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const currentUserId = req.userId;

    // Prevent users from removing themselves
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot remove yourself from the project'
      });
    }

    const memberships = await readData(MEMBERSHIPS_FILE);
    const memberIndex = memberships.findIndex(m => m.projectId === projectId && m.userId === userId);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    const member = memberships[memberIndex];

    // Prevent removing the last owner
    if (member.role === 'owner') {
      const ownerCount = memberships.filter(m => m.projectId === projectId && m.role === 'owner').length;
      if (ownerCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove the last owner of the project'
        });
      }
    }

    // Remove member
    memberships.splice(memberIndex, 1);
    await writeData(MEMBERSHIPS_FILE, memberships);

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: {
        userId: member.userId,
        userEmail: member.userEmail,
        role: member.role
      }
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/projects/personal - Get user's personal projects
router.get('/personal', extractUserId, async (req, res) => {
  try {
    const userId = req.userId;

    const projects = await readData(PROJECTS_FILE);
    const personalProjects = projects.filter(p => p.userId === userId);

    res.json({
      success: true,
      data: personalProjects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        environment: project.environment,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }))
    });
  } catch (error) {
    console.error('Error getting personal projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/projects/invited - Get projects user is invited to
router.get('/invited', extractUserId, async (req, res) => {
  try {
    const userId = req.userId;

    const memberships = await readData(MEMBERSHIPS_FILE);
    const userMemberships = memberships.filter(m => m.userId === userId);

    const projects = await readData(PROJECTS_FILE);
    const invitedProjects = userMemberships.map(membership => {
      const project = projects.find(p => p.id === membership.projectId);
      return project ? {
        id: project.id,
        name: project.name,
        description: project.description,
        environment: project.environment,
        status: project.status,
        role: membership.role,
        joinedAt: membership.joinedAt,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      } : null;
    }).filter(Boolean);

    res.json({
      success: true,
      data: invitedProjects
    });
  } catch (error) {
    console.error('Error getting invited projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
