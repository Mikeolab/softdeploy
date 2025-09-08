// server/routes/invitations.js
const express = require('express');
const { authenticateUser, requireAuth, checkResourceAccess, extractUserId } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Data file paths
const INVITATIONS_FILE = path.join(__dirname, '../data/invitations.json');
const PROJECTS_FILE = path.join(__dirname, '../data/projects.json');
const MEMBERSHIPS_FILE = path.join(__dirname, '../data/memberships.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
  const dataDir = path.dirname(INVITATIONS_FILE);
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

// Generate invitation token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/invites - Send invite to email
router.post('/', extractUserId, async (req, res) => {
  try {
    const { projectId, email, role = 'member' } = req.body;
    const inviterId = req.userId;

    // Validate required fields
    if (!projectId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, email'
      });
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: owner, admin, member'
      });
    }

    // Check if project exists and user has permission to invite
    const projects = await readData(PROJECTS_FILE);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is project owner or admin
    const memberships = await readData(MEMBERSHIPS_FILE);
    const membership = memberships.find(m => m.projectId === projectId && m.userId === inviterId);
    
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only project owners and admins can send invitations'
      });
    }

    // Check if user is already a member
    const existingMembership = memberships.find(m => m.projectId === projectId && m.userEmail === email);
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this project'
      });
    }

    // Check for existing pending invitation
    const invitations = await readData(INVITATIONS_FILE);
    const existingInvite = invitations.find(i => i.projectId === projectId && i.email === email && i.status === 'pending');
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        error: 'Invitation already sent to this email'
      });
    }

    // Create invitation
    const invitation = {
      id: `invite_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      projectId,
      projectName: project.name,
      email,
      role,
      inviterId,
      inviterEmail: req.user?.email || 'unknown@example.com',
      token: generateToken(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    invitations.push(invitation);
    await writeData(INVITATIONS_FILE, invitations);

    // In a real application, you would send an email here
    // For now, we'll just return the invitation with the token
    console.log(`📧 Invitation sent to ${email} for project ${project.name}`);
    console.log(`🔗 Invitation link: /accept-invitation/${invitation.token}`);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: invitation.id,
        email: invitation.email,
        projectName: invitation.projectName,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        // In development, include the token for testing
        ...(process.env.NODE_ENV === 'development' && { token: invitation.token })
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/invites/:token/accept - Accept invitation
router.post('/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { userId, userEmail } = req.body;

    // Validate required fields
    if (!userId || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, userEmail'
      });
    }

    // Find invitation
    const invitations = await readData(INVITATIONS_FILE);
    const invitation = invitations.find(i => i.token === token && i.status === 'pending');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired invitation'
      });
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation has expired'
      });
    }

    // Check if user is already a member
    const memberships = await readData(MEMBERSHIPS_FILE);
    const existingMembership = memberships.find(m => m.projectId === invitation.projectId && m.userId === userId);
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this project'
      });
    }

    // Create membership
    const membership = {
      id: `membership_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      projectId: invitation.projectId,
      userId,
      userEmail,
      role: invitation.role,
      joinedAt: new Date().toISOString()
    };

    memberships.push(membership);
    await writeData(MEMBERSHIPS_FILE, memberships);

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date().toISOString();
    invitation.acceptedBy = userId;
    await writeData(INVITATIONS_FILE, invitations);

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        projectId: invitation.projectId,
        projectName: invitation.projectName,
        role: invitation.role,
        joinedAt: membership.joinedAt
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/invites - Get user's invitations
router.get('/', extractUserId, async (req, res) => {
  try {
    const userId = req.userId;
    const userEmail = req.user?.email || '';

    const invitations = await readData(INVITATIONS_FILE);
    const userInvitations = invitations.filter(i => 
      i.email === userEmail && i.status === 'pending'
    );

    res.json({
      success: true,
      data: userInvitations.map(invitation => ({
        id: invitation.id,
        projectId: invitation.projectId,
        projectName: invitation.projectName,
        role: invitation.role,
        inviterEmail: invitation.inviterEmail,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt
      }))
    });
  } catch (error) {
    console.error('Error getting invitations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/invites/:token - Get invitation details
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitations = await readData(INVITATIONS_FILE);
    const invitation = invitations.find(i => i.token === token);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invitation has already been processed'
      });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation has expired'
      });
    }

    res.json({
      success: true,
      data: {
        id: invitation.id,
        projectId: invitation.projectId,
        projectName: invitation.projectName,
        role: invitation.role,
        inviterEmail: invitation.inviterEmail,
        email: invitation.email,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Error getting invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/invites/:id - Cancel invitation
router.delete('/:id', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const invitations = await readData(INVITATIONS_FILE);
    const invitationIndex = invitations.findIndex(i => i.id === id);

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    const invitation = invitations[invitationIndex];

    // Check if user has permission to cancel (inviter or project admin)
    const memberships = await readData(MEMBERSHIPS_FILE);
    const membership = memberships.find(m => m.projectId === invitation.projectId && m.userId === userId);
    
    if (invitation.inviterId !== userId && (!membership || !['owner', 'admin'].includes(membership.role))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Only the inviter or project admins can cancel invitations'
      });
    }

    // Remove invitation
    invitations.splice(invitationIndex, 1);
    await writeData(INVITATIONS_FILE, invitations);

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
