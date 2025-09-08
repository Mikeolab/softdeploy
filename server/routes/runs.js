// server/routes/runs.js
const express = require('express');
const RunService = require('../services/runService');

const router = express.Router();
const runService = new RunService();

// GET /api/runs - Get all runs
router.get('/', async (req, res) => {
  try {
    const { projectId, userId, status, limit = 50, offset = 0 } = req.query;
    
    let runs = await runService.getAllRuns();
    
    // Filter by project
    if (projectId) {
      runs = runs.filter(run => run.projectId === projectId);
    }
    
    // Filter by user
    if (userId) {
      runs = runs.filter(run => run.userId === userId);
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

// GET /api/runs/:id - Get specific run
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
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

// GET /api/runs/:id/status - Get run status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await runService.getRunStatus(id);
    
    if (!status) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
      });
    }

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

// POST /api/runs - Create new run
router.post('/', async (req, res) => {
  try {
    const { testSuite, projectId, userId } = req.body;
    
    // Validate required fields
    if (!testSuite || !projectId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: testSuite, projectId, userId' 
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

// POST /api/runs/:id/stop - Stop running test
router.post('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const run = await runService.stopRun(id);
    
    res.json({
      success: true,
      message: 'Test run stopped successfully',
      data: run
    });
  } catch (error) {
    console.error('Error stopping run:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// GET /api/runs/project/:projectId - Get runs by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;
    
    let runs = await runService.getRunsByProject(projectId);
    
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

// GET /api/runs/user/:userId - Get runs by user
router.get('/user/:userId', async (req, res) => {
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

// GET /api/runs/:id/artifacts - Get run artifacts
router.get('/:id/artifacts', async (req, res) => {
  try {
    const { id } = req.params;
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
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

// GET /api/runs/:id/logs - Get run logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const run = await runService.getRun(id);
    
    if (!run) {
      return res.status(404).json({ 
        success: false, 
        error: 'Run not found' 
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
