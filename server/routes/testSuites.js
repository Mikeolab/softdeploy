const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Load sample data
const loadSampleData = () => {
  try {
    const dataPath = path.join(__dirname, '../scripts/data/sample-data.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sample data:', error);
    return null;
  }
};

// Save sample data
const saveSampleData = (data) => {
  try {
    const dataPath = path.join(__dirname, '../scripts/data/sample-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving sample data:', error);
    return false;
  }
};

// GET /api/suites - Get all test suites
router.get('/', (req, res) => {
  try {
    const sampleData = loadSampleData();
    
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    res.json({
      success: true,
      data: sampleData.testSuites || []
    });
  } catch (error) {
    console.error('Error getting test suites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/suites/:id - Get specific test suite
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sampleData = loadSampleData();
    
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    const testSuite = sampleData.testSuites.find(suite => suite.id === id);
    
    if (!testSuite) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test suite not found' 
      });
    }

    res.json({
      success: true,
      data: testSuite
    });
  } catch (error) {
    console.error('Error getting test suite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/suites - Create new test suite
router.post('/', (req, res) => {
  try {
    const testSuiteData = req.body;
    
    // Validate required fields
    if (!testSuiteData.name || !testSuiteData.projectId || !testSuiteData.baseUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, projectId, baseUrl' 
      });
    }

    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    // Generate ID and timestamps
    const newTestSuite = {
      id: `suite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: testSuiteData.name,
      description: testSuiteData.description || '',
      project_id: testSuiteData.projectId,
      test_type: testSuiteData.testType || 'API',
      tool_id: testSuiteData.toolId || 'axios',
      base_url: testSuiteData.baseUrl,
      environment: testSuiteData.environment || 'development',
      steps: testSuiteData.steps || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to test suites
    sampleData.testSuites.push(newTestSuite);

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save test suite' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test suite created successfully',
      data: newTestSuite
    });
  } catch (error) {
    console.error('Error creating test suite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// PUT /api/suites/:id - Update test suite
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    const testSuiteIndex = sampleData.testSuites.findIndex(suite => suite.id === id);
    
    if (testSuiteIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test suite not found' 
      });
    }

    // Update the test suite
    sampleData.testSuites[testSuiteIndex] = {
      ...sampleData.testSuites[testSuiteIndex],
      ...updateData,
      id: id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save test suite' 
      });
    }

    res.json({
      success: true,
      message: 'Test suite updated successfully',
      data: sampleData.testSuites[testSuiteIndex]
    });
  } catch (error) {
    console.error('Error updating test suite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// DELETE /api/suites/:id - Delete test suite
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    const testSuiteIndex = sampleData.testSuites.findIndex(suite => suite.id === id);
    
    if (testSuiteIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test suite not found' 
      });
    }

    const deletedTestSuite = sampleData.testSuites.splice(testSuiteIndex, 1)[0];

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save test suite' 
      });
    }

    res.json({
      success: true,
      message: 'Test suite deleted successfully',
      data: deletedTestSuite
    });
  } catch (error) {
    console.error('Error deleting test suite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
