// server/routes/runs.js
const express = require('express');
const RunService = require('../services/runService');
const { authenticateUser, requireAuth, checkResourceAccess, extractUserId } = require('../middleware/auth');

const router = express.Router();
const runService = new RunService();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// GET /api/runs - Get all runs (filtered by authenticated user)
router.get('/', extractUserId, async (req, res) => {
  try {
    const { projectId, status, limit = 50, offset = 0 } = req.query;
    const userId = req.userId; // From authentication middleware
    
    let runs = await runService.getAllRuns();
    
    // Filter by authenticated user (security: users can only see their own runs)
    runs = runs.filter(run => run.userId === userId);
    
    // Filter by project
    if (projectId) {
      runs = runs.filter(run => run.projectId === projectId);
    }
    
    // Filter by status
    if (status) {
      runs = runs.filter(run => run.status === status);
    }
    
    // Sort by creation date (newest first)
    runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = runs.length;
    const paginatedRuns = runs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedRuns,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error getting runs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/runs/:id - Get specific run (user must own it)
router.get('/:id', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

    // Security: User can only access their own runs
    if (run.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own runs'
      });
    }

    res.json({
      success: true,
      data: run
    });
  } catch (error) {
    console.error('Error getting run:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/runs/:id/status - Get run status (user must own it)
router.get('/:id/status', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

    // Security: User can only access their own runs
    if (run.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own runs'
      });
    }

    const status = await runService.getRunStatus(id);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting run status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/runs - Create new run (user ID from auth)
router.post('/', extractUserId, async (req, res) => {
  try {
    const { testSuite, projectId } = req.body;
    const userId = req.userId; // From authentication middleware
    
    // Validate required fields
    if (!testSuite || !projectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: testSuite, projectId' 
      });
    }

    // Validate test suite structure
    if (!testSuite.name || !testSuite.steps || testSuite.steps.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid test suite: must have name and at least one step' 
      });
    }

    const run = await runService.createRun(testSuite, projectId, userId);
    
    res.status(201).json({
      success: true,
      message: 'Test run created successfully',
      data: run
    });
  } catch (error) {
    console.error('Error creating run:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/runs/:id/stop - Stop running test (user must own it)
router.post('/:id/stop', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

    // Security: User can only stop their own runs
    if (run.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only stop your own runs'
      });
    }

    const stoppedRun = await runService.stopRun(id);
    
    res.json({
      success: true,
      message: 'Test run stopped successfully',
      data: stoppedRun
    });
  } catch (error) {
    console.error('Error stopping run:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// GET /api/runs/project/:projectId - Get runs by project (user must own them)
router.get('/project/:projectId', extractUserId, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let runs = await runService.getRunsByProject(projectId);
    
    // Security: Filter to only user's runs
    runs = runs.filter(run => run.userId === userId);
    
    // Filter by status
    if (status) {
      runs = runs.filter(run => run.status === status);
    }
    
    // Sort by creation date (newest first)
    runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = runs.length;
    const paginatedRuns = runs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedRuns,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error getting runs by project:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/runs/user/:userId - Get runs by user (with access control)
router.get('/user/:userId', checkResourceAccess('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let runs = await runService.getRunsByUser(userId);
    
    // Filter by status
    if (status) {
      runs = runs.filter(run => run.status === status);
    }
    
    // Sort by creation date (newest first)
    runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = runs.length;
    const paginatedRuns = runs.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedRuns,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error getting runs by user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/runs/:id/artifacts - Get run artifacts (user must own it)
router.get('/:id/artifacts', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

    // Security: User can only access their own runs
    if (run.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own runs'
      });
    }

    res.json({
      success: true,
      data: {
        artifacts: run.artifacts,
        logs: run.logs
      }
    });
  } catch (error) {
    console.error('Error getting run artifacts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/runs/:id/logs - Get run logs (user must own it)
router.get('/:id/logs', extractUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

    // Security: User can only access their own runs
    if (run.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only access your own runs'
      });
    }

    res.json({
      success: true,
      data: run.logs
    });
  } catch (error) {
    console.error('Error getting run logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
