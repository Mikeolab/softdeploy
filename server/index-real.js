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

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('🔌 WebSocket client connected');
  
  // Generate unique connection ID
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check if connection already exists and close it
  if (activeExecutors.has(connectionId)) {
    console.log('⚠️ [WEBSOCKET] Duplicate connection detected, closing previous');
    const existingExecutor = activeExecutors.get(connectionId);
    if (existingExecutor && existingExecutor.ws) {
      existingExecutor.ws.close();
    }
  }
  
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

// API endpoint for Quick Test execution
app.post('/api/execute-quick-test', async (req, res) => {
  try {
    const { toolId, script, language, fileExtension } = req.body;
    
    console.log('🚀 [QUICK TEST] Received quick test execution request');
    console.log('📋 Quick Test Details:', {
      toolId,
      language,
      fileExtension,
      scriptLength: script?.length || 0
    });
    
    // Validate input
    if (!toolId || !script) {
      return res.status(400).json({
        success: false,
        message: 'Tool ID and script are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate tool
    const validTools = ['cypress', 'k6', 'playwright'];
    if (!validTools.includes(toolId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid tool: ${toolId}. Valid tools are: ${validTools.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Execute based on tool
    let result;
    const startTime = Date.now();

    try {
      switch (toolId) {
        case 'cypress':
          result = await executeCypressQuickTest(script);
          break;
        case 'k6':
          result = await executeK6QuickTest(script);
          break;
        case 'playwright':
          result = await executePlaywrightQuickTest(script);
          break;
        default:
          throw new Error(`Unsupported tool: ${toolId}`);
      }

      const duration = Date.now() - startTime;

      console.log('✅ [QUICK TEST] Execution completed:', {
        toolId,
        success: result.success,
        duration
      });

      return res.json({
        success: result.success,
        summary: result.summary,
        duration: `${duration}ms`,
        tests: result.tests,
        output: result.output,
        timestamp: new Date().toISOString()
      });

    } catch (executionError) {
      console.error('❌ [QUICK TEST] Execution failed:', executionError.message);
      
      return res.status(500).json({
        success: false,
        error: executionError.message,
        output: executionError.output || '',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ [QUICK TEST] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Execute Cypress Quick Test
async function executeCypressQuickTest(script) {
  const fs = require('fs').promises;
  const path = require('path');
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    // Create temporary directory for Cypress test
    const tempDir = path.join(__dirname, 'temp', `cypress_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create cypress.json config
    const cypressConfig = {
      "baseUrl": "https://example.com",
      "viewportWidth": 1280,
      "viewportHeight": 720,
      "defaultCommandTimeout": 10000,
      "requestTimeout": 10000,
      "responseTimeout": 10000
    };
    
    await fs.writeFile(
      path.join(tempDir, 'cypress.json'),
      JSON.stringify(cypressConfig, null, 2)
    );
    
    // Create test file
    const testFile = path.join(tempDir, 'quick-test.cy.js');
    await fs.writeFile(testFile, script);
    
    // Execute Cypress test
    console.log('🧪 [CYPRESS] Executing test...');
    const { stdout, stderr } = await execAsync(
      `npx cypress run --spec "${testFile}" --headless --browser chrome`,
      { 
        cwd: tempDir,
        timeout: 60000,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }
    );
    
    // Parse results
    const output = stdout + stderr;
    const success = !output.includes('failing') && !output.includes('failed') && output.includes('passing');
    
    // Extract test results
    const testMatch = output.match(/(\d+) passing|(\d+) failing/);
    const tests = {
      total: 0,
      passed: 0,
      failed: 0
    };
    
    if (testMatch) {
      tests.passed = parseInt(testMatch[1]) || 0;
      tests.failed = parseInt(testMatch[2]) || 0;
      tests.total = tests.passed + tests.failed;
    }
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return {
      success,
      summary: success ? 'Cypress test executed successfully' : 'Cypress test failed',
      tests,
      output: output.substring(0, 2000) // Limit output size
    };
    
  } catch (error) {
    console.error('❌ [CYPRESS] Quick test failed:', error.message);
    return {
      success: false,
      summary: `Cypress test failed: ${error.message}`,
      tests: { total: 0, passed: 0, failed: 1 },
      output: error.message
    };
  }
}

// Execute k6 Quick Test
async function executeK6QuickTest(script) {
  const fs = require('fs').promises;
  const path = require('path');
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    // Create temporary directory for k6 test
    const tempDir = path.join(__dirname, 'temp', `k6_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create test file
    const testFile = path.join(tempDir, 'quick-test.js');
    await fs.writeFile(testFile, script);
    
    // Execute k6 test
    console.log('🧪 [K6] Executing load test...');
    const { stdout, stderr } = await execAsync(
      `k6 run "${testFile}"`,
      { 
        cwd: tempDir,
        timeout: 120000, // 2 minutes for load tests
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }
    );
    
    // Parse results
    const output = stdout + stderr;
    const success = !output.includes('error') && output.includes('checks');
    
    // Extract metrics
    const checksMatch = output.match(/checks\s*:\s*(\d+)%?\s*(\d+)\/(\d+)/);
    const tests = {
      total: 0,
      passed: 0,
      failed: 0
    };
    
    if (checksMatch) {
      tests.passed = parseInt(checksMatch[2]) || 0;
      tests.total = parseInt(checksMatch[3]) || 0;
      tests.failed = tests.total - tests.passed;
    }
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return {
      success,
      summary: success ? 'k6 load test executed successfully' : 'k6 load test failed',
      tests,
      output: output.substring(0, 2000) // Limit output size
    };
    
  } catch (error) {
    console.error('❌ [K6] Quick test failed:', error.message);
    return {
      success: false,
      summary: `k6 test failed: ${error.message}`,
      tests: { total: 0, passed: 0, failed: 1 },
      output: error.message
    };
  }
}

// Execute Playwright Quick Test
async function executePlaywrightQuickTest(script) {
  const fs = require('fs').promises;
  const path = require('path');
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    // Create temporary directory for Playwright test
    const tempDir = path.join(__dirname, 'temp', `playwright_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Create test file
    const testFile = path.join(tempDir, 'quick-test.spec.js');
    await fs.writeFile(testFile, script);
    
    // Execute Playwright test
    console.log('🧪 [PLAYWRIGHT] Executing test...');
    const { stdout, stderr } = await execAsync(
      `npx playwright test "${testFile}" --reporter=line`,
      { 
        cwd: tempDir,
        timeout: 60000,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }
    );
    
    // Parse results
    const output = stdout + stderr;
    const success = !output.includes('failed') && !output.includes('error') && output.includes('passed');
    
    // Extract test results
    const testMatch = output.match(/(\d+) passed|(\d+) failed/);
    const tests = {
      total: 0,
      passed: 0,
      failed: 0
    };
    
    if (testMatch) {
      tests.passed = parseInt(testMatch[1]) || 0;
      tests.failed = parseInt(testMatch[2]) || 0;
      tests.total = tests.passed + tests.failed;
    }
    
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return {
      success,
      summary: success ? 'Playwright test executed successfully' : 'Playwright test failed',
      tests,
      output: output.substring(0, 2000) // Limit output size
    };
    
  } catch (error) {
    console.error('❌ [PLAYWRIGHT] Quick test failed:', error.message);
    return {
      success: false,
      summary: `Playwright test failed: ${error.message}`,
      tests: { total: 0, passed: 0, failed: 1 },
      output: error.message
    };
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'SoftDeploy Test Execution Server is running'
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

// Serve static files from the React app (AFTER API routes)
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA catch-all route - MUST be after API routes and static files
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Handle WebSocket upgrade with proper error handling
server.on('upgrade', (request, socket, head) => {
  try {
    // Check if socket is already handled
    if (socket.destroyed) {
      console.log('⚠️ [WEBSOCKET] Socket already destroyed, skipping upgrade');
      return;
    }
    
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } catch (error) {
    console.error('❌ [WEBSOCKET] Upgrade error:', error.message);
    socket.destroy();
  }
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
