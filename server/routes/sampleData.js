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

// GET /api/sample-data/:type - Get sample data by type
router.get('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const sampleData = loadSampleData();
    
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    const validTypes = ['users', 'projects', 'testSuites', 'testRuns', 'localStorage'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    res.json({
      success: true,
      data: sampleData[type] || []
    });
  } catch (error) {
    console.error('Error getting sample data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// PUT /api/sample-data/:type - Update sample data by type
router.put('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const { data: newData } = req.body;
    
    const validTypes = ['users', 'projects', 'testSuites', 'testRuns', 'localStorage'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    if (!Array.isArray(newData)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Data must be an array' 
      });
    }

    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    // Update the specific type
    sampleData[type] = newData;

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save sample data' 
      });
    }

    res.json({
      success: true,
      message: `Successfully updated ${type}`,
      data: newData
    });
  } catch (error) {
    console.error('Error updating sample data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/sample-data/:type - Add new item to sample data
router.post('/:type', (req, res) => {
  try {
    const { type } = req.params;
    const newItem = req.body;
    
    const validTypes = ['users', 'projects', 'testSuites', 'testRuns'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    // Generate ID if not provided
    if (!newItem.id) {
      newItem.id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add timestamps if not provided
    if (!newItem.created_at) {
      newItem.created_at = new Date().toISOString();
    }
    if (!newItem.updated_at) {
      newItem.updated_at = new Date().toISOString();
    }

    // Add to the specific type
    sampleData[type].push(newItem);

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save sample data' 
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully added new ${type}`,
      data: newItem
    });
  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// DELETE /api/sample-data/:type/:id - Delete item from sample data
router.delete('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    
    const validTypes = ['users', 'projects', 'testSuites', 'testRuns'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    const sampleData = loadSampleData();
    if (!sampleData) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load sample data' 
      });
    }

    // Find and remove the item
    const index = sampleData[type].findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        error: `${type} with id ${id} not found` 
      });
    }

    const deletedItem = sampleData[type].splice(index, 1)[0];

    // Save back to file
    const saved = saveSampleData(sampleData);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save sample data' 
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${type} with id ${id}`,
      data: deletedItem
    });
  } catch (error) {
    console.error('Error deleting sample data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
