// server/index-real.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');

// Import real test executor
const RealTestExecutor = require('./realTestExecutor');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time test execution updates
const wss = new WebSocket.Server({ server });

// Store active test executors
const activeExecutors = new Map();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('🔌 WebSocket client connected');
  
  // Generate unique connection ID
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create test executor for this connection
  const executor = new RealTestExecutor(ws);
  activeExecutors.set(connectionId, executor);
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection_established',
    connectionId,
    timestamp: new Date().toISOString(),
    message: 'Connected to test execution server'
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'execute_test_suite':
          console.log('🚀 [WEBSOCKET] Received test suite execution request');
          const executor = activeExecutors.get(connectionId);
          if (executor) {
            try {
              const result = await executor.executeTestSuite(data.testSuite);
              ws.send(JSON.stringify({
                type: 'execution_complete',
                result,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: 'execution_error',
                error: error.message,
                timestamp: new Date().toISOString()
              }));
            }
          }
          break;
          
        case 'stop_execution':
          console.log('⏹️ [WEBSOCKET] Received stop execution request');
          const executorToStop = activeExecutors.get(connectionId);
          if (executorToStop) {
            executorToStop.isRunning = false;
            ws.send(JSON.stringify({
              type: 'execution_stopped',
              timestamp: new Date().toISOString(),
              message: 'Test execution stopped'
            }));
          }
          break;
      }
    } catch (error) {
      console.error('❌ [WEBSOCKET] Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    const executor = activeExecutors.get(connectionId);
    if (executor) {
      executor.isRunning = false;
      activeExecutors.delete(connectionId);
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ [WEBSOCKET] Connection error:', error);
    activeExecutors.delete(connectionId);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeExecutions: activeExecutors.size,
    version: 'real-execution-v1.0'
  });
});

// API endpoint to execute a complete test suite (WebSocket-based)
app.post('/api/execute-test-suite', async (req, res) => {
  try {
    const { testSuite } = req.body;
    
    console.log('🚀 [SERVER] Received test suite execution request');
    console.log('📋 Test Suite Details:', {
      name: testSuite.name,
      type: testSuite.testType,
      tool: testSuite.toolId,
      steps: testSuite.steps?.length || 0,
      baseUrl: testSuite.baseUrl
    });
    
    // Enhanced validation
    if (!testSuite || !testSuite.name || !testSuite.testType) {
      console.error('❌ [SERVER] Invalid test suite data received');
      return res.status(400).json({
        success: false,
        message: 'Invalid test suite data: name and testType are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate test type
    const validTestTypes = ['API', 'Functional', 'Performance'];
    if (!validTestTypes.includes(testSuite.testType)) {
      console.error('❌ [SERVER] Invalid test type:', testSuite.testType);
      return res.status(400).json({
        success: false,
        message: `Invalid test type: ${testSuite.testType}. Valid types are: ${validTestTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Validate tool ID
    const validTools = ['inbuilt', 'axios', 'puppeteer', 'k6', 'cypress', 'playwright'];
    if (testSuite.toolId && !validTools.includes(testSuite.toolId)) {
      console.error('❌ [SERVER] Invalid tool ID:', testSuite.toolId);
      return res.status(400).json({
        success: false,
        message: `Invalid tool ID: ${testSuite.toolId}. Valid tools are: ${validTools.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Validate base URL format
    if (testSuite.baseUrl) {
      try {
        new URL(testSuite.baseUrl);
      } catch (error) {
        console.error('❌ [SERVER] Invalid base URL:', testSuite.baseUrl);
        return res.status(400).json({
          success: false,
          message: `Invalid base URL: ${testSuite.baseUrl}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Validate steps
    if (!testSuite.steps || !Array.isArray(testSuite.steps) || testSuite.steps.length === 0) {
      console.error('❌ [SERVER] Invalid or empty steps array');
      return res.status(400).json({
        success: false,
        message: 'Test suite must have at least one step',
        timestamp: new Date().toISOString()
      });
    }

    // Create a temporary executor for HTTP API calls (fallback)
    const tempExecutor = new RealTestExecutor(null);
    
    try {
      console.log('🚀 [SERVER] Starting real test execution...');
      const result = await tempExecutor.executeTestSuite(testSuite);
      
      console.log('✅ [SERVER] Test execution completed:', {
        success: result.success,
        totalSteps: result.totalSteps,
        passedSteps: result.passedSteps,
        failedSteps: result.failedSteps,
        totalTime: result.totalTime
      });

      return res.json({
        success: result.success,
        totalSteps: result.totalSteps,
        passedSteps: result.passedSteps,
        failedSteps: result.failedSteps,
        totalTime: result.totalTime,
        results: result.results,
        timestamp: result.timestamp,
        message: `Test suite completed: ${result.passedSteps}/${result.totalSteps} steps passed`
      });

    } catch (executionError) {
      console.error('❌ [SERVER] Test execution failed:', executionError.message);
      return res.status(500).json({
        success: false,
        message: `Test execution failed: ${executionError.message}`,
        error: executionError.message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ [SERVER] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Real test execution server running on port', PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🧪 Test execution: http://localhost:' + PORT + '/api/execute-test-suite');
  console.log('🔌 WebSocket server ready for real-time updates');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
