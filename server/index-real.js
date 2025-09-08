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

// Import real test executor and AI service
const RealTestExecutor = require('./realTestExecutor');
const AIService = require('./aiService');

// Import project isolation middleware
const {
  loadProject,
  assertMembership,
  validateResourceProject,
  enforceProjectId,
  validateWebSocketProject,
  logProjectOperation
} = require('./middleware/projectIsolation');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AI service
const aiService = new AIService();

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time test execution updates
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  verifyClient: async (info) => {
    console.log('🔌 [WS] New WebSocket connection attempt');
    
    // Validate project access
    const isValid = await validateWebSocketProject(null, info.req);
    if (!isValid) {
      console.log('❌ [WS] WebSocket connection rejected: Invalid project access');
      return false;
    }
    
    return true;
  }
});

// Store active test executors
const activeExecutors = new Map();

// WebSocket connection handler
wss.on('connection', async (ws, req) => {
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Validate project access for the connection
  const isValid = await validateWebSocketProject(ws, req);
  if (!isValid) {
    return; // Connection already closed by middleware
  }
  
  console.log(`🔌 [WS] Client connected: ${connectionId} (Project: ${ws.projectId}, User: ${ws.userId})`);
  
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
  
  // Log project-scoped connection
  logProjectOperation('WebSocket Connected', ws.projectId, ws.userId, {
    connectionId,
    userRole: ws.userRole
  });
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection_established',
    connectionId,
    projectId: ws.projectId,
    userRole: ws.userRole,
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
    console.log(`🔌 [WS] Client disconnected: ${connectionId} (Project: ${ws.projectId})`);
    
    // Log project-scoped disconnection
    logProjectOperation('WebSocket Disconnected', ws.projectId, ws.userId, {
      connectionId
    });
    
    const executor = activeExecutors.get(connectionId);
    if (executor) {
      executor.isRunning = false;
    }
    activeExecutors.delete(connectionId);
  });
  
  ws.on('error', (error) => {
    console.error(`❌ [WS] WebSocket error for ${connectionId} (Project: ${ws.projectId}):`, error);
    activeExecutors.delete(connectionId);
  });
});

// ===== AI ENDPOINTS =====

// Health check for AI service
app.get('/api/ai/health', (req, res) => {
  try {
    const stats = aiService.getUsageStats();
    res.json({
      success: true,
      available: stats.available,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get AI usage statistics
app.get('/api/ai/usage', (req, res) => {
  try {
    const stats = aiService.getUsageStats();
    res.json({
      success: true,
      usage: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate test script using AI
app.post('/api/ai/generate-test', async (req, res) => {
  try {
    const { prompt, testType = 'API', projectContext = {} } = req.body;
    
    console.log('🤖 [AI] Received test generation request');
    console.log('📋 AI Request Details:', {
      testType,
      projectName: projectContext.name,
      promptLength: prompt?.length || 0
    });
    
    // Validate input
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for AI generation',
        timestamp: new Date().toISOString()
      });
    }

    // Check if AI service is available
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI service not available. Please set GEMINI_API_KEY environment variable.',
        timestamp: new Date().toISOString()
      });
    }

    // Generate test script
    const result = await aiService.generateTestScript(prompt, testType, projectContext);
    
    if (result.success) {
      console.log('✅ [AI] Test script generated successfully');
      res.json(result);
    } else {
      console.error('❌ [AI] Test generation failed:', result.error);
      
      // Check if it's a rate limit error
      if (result.error.includes('limit reached') || result.error.includes('Rate limit exceeded')) {
        res.status(429).json({
          success: false,
          error: result.error,
          message: result.error,
          timestamp: new Date().toISOString(),
          usageStats: aiService.getUsageStats()
        });
      } else {
        res.status(500).json(result);
      }
    }
  } catch (error) {
    console.error('❌ [AI] Test generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate test suggestions for a project
app.post('/api/ai/suggest-tests', async (req, res) => {
  try {
    const { projectContext } = req.body;
    
    console.log('🤖 [AI] Received test suggestions request');
    console.log('📋 Project Context:', {
      name: projectContext.name,
      description: projectContext.description
    });
    
    // Check if AI service is available
    if (!aiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI service not available. Please set GEMINI_API_KEY environment variable.',
        timestamp: new Date().toISOString()
      });
    }

    // Generate suggestions
    const result = await aiService.generateTestSuggestions(projectContext);
    
    if (result.success) {
      console.log('✅ [AI] Test suggestions generated successfully');
      res.json(result);
    } else {
      console.error('❌ [AI] Suggestions generation failed:', result.error);
      
      // Check if it's a rate limit error
      if (result.error.includes('limit reached') || result.error.includes('Rate limit exceeded')) {
        res.status(429).json({
          success: false,
          error: result.error,
          message: result.error,
          timestamp: new Date().toISOString(),
          usageStats: aiService.getUsageStats()
        });
      } else {
        res.status(500).json(result);
      }
    }
  } catch (error) {
    console.error('❌ [AI] Suggestions generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// Import sample data routes
const sampleDataRoutes = require('./routes/sampleData');

// Import test suites routes
const testSuitesRoutes = require('./routes/testSuites');

// Import runs routes
const runsRoutes = require('./routes/runs');

// Import invitations routes
const invitationsRoutes = require('./routes/invitations');

// Import project members routes
const projectMembersRoutes = require('./routes/projectMembers');

// Sample data API routes
app.use('/api/sample-data', sampleDataRoutes);

// Test suites API routes
app.use('/api/suites', testSuitesRoutes);

// Runs API routes
app.use('/api/runs', runsRoutes);

// Invitations API routes
app.use('/api/invites', invitationsRoutes);

// Project members API routes
app.use('/api/projects', projectMembersRoutes);

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
app.post('/api/projects/:projectId/execute-test-suite', 
  loadProject, 
  assertMembership('editor'), 
  enforceProjectId,
  async (req, res) => {
  try {
    const { testSuite } = req.body;
    const projectId = req.project.id;
    const userId = req.user.id;
    
    console.log(`🚀 [SERVER] Received test suite execution request for project ${projectId}`);
    console.log('📋 Test Suite Details:', {
      name: testSuite.name,
      type: testSuite.testType,
      tool: testSuite.toolId,
      steps: testSuite.steps?.length || 0,
      baseUrl: testSuite.baseUrl,
      projectId: projectId,
      userId: userId
    });
    
    // Log project-scoped operation
    logProjectOperation('Test Suite Execution Started', projectId, userId, {
      testSuiteName: testSuite.name,
      testType: testSuite.testType,
      toolId: testSuite.toolId
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

    // Ensure project_id is set in test suite
    testSuite.project_id = projectId;
    testSuite.user_id = userId;

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
        totalTime: result.totalTime,
        projectId: projectId
      });

      // Log project-scoped completion
      logProjectOperation('Test Suite Execution Completed', projectId, userId, {
        testSuiteName: testSuite.name,
        success: result.success,
        totalSteps: result.totalSteps,
        passedSteps: result.passedSteps,
        failedSteps: result.failedSteps
      });

      return res.json({
        success: result.success,
        totalSteps: result.totalSteps,
        passedSteps: result.passedSteps,
        failedSteps: result.failedSteps,
        totalTime: result.totalTime,
        results: result.results,
        timestamp: result.timestamp,
        projectId: projectId,
        message: `Test suite completed: ${result.passedSteps}/${result.totalSteps} steps passed`
      });

    } catch (executionError) {
      console.error('❌ [SERVER] Test execution failed:', executionError.message);
      
      // Log project-scoped failure
      logProjectOperation('Test Suite Execution Failed', projectId, userId, {
        testSuiteName: testSuite.name,
        error: executionError.message
      });
      
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

// ===== PROJECT-SCOPED API ROUTES =====

// Get test runs for a project
app.get('/api/projects/:projectId/test-runs', 
  loadProject, 
  assertMembership('viewer'),
  async (req, res) => {
    try {
      const projectId = req.project.id;
      const userId = req.user.id;
      
      console.log(`📊 [API] Fetching test runs for project ${projectId}`);
      
      // Log project-scoped operation
      logProjectOperation('Test Runs Fetched', projectId, userId, {});
      
      // In a real implementation, this would query the database
      // For now, return mock data
      const testRuns = [
        {
          id: 'run_1',
          project_id: projectId,
          user_id: userId,
          test_suite_name: 'API Test Suite',
          test_type: 'API',
          tool_id: 'axios',
          status: 'completed',
          total_steps: 3,
          passed_steps: 3,
          failed_steps: 0,
          total_time: 1250,
          created_at: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        testRuns: testRuns,
        projectId: projectId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [API] Error fetching test runs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch test runs',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get test plans for a project
app.get('/api/projects/:projectId/test-plans', 
  loadProject, 
  assertMembership('viewer'),
  async (req, res) => {
    try {
      const projectId = req.project.id;
      const userId = req.user.id;
      
      console.log(`📋 [API] Fetching test plans for project ${projectId}`);
      
      // Log project-scoped operation
      logProjectOperation('Test Plans Fetched', projectId, userId, {});
      
      // In a real implementation, this would query the database
      const testPlans = [
        {
          id: 'plan_1',
          project_id: projectId,
          user_id: userId,
          title: 'API Test Plan',
          description: 'Comprehensive API testing plan',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        testPlans: testPlans,
        projectId: projectId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [API] Error fetching test plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch test plans',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Create test plan for a project
app.post('/api/projects/:projectId/test-plans', 
  loadProject, 
  assertMembership('editor'), 
  enforceProjectId,
  async (req, res) => {
    try {
      const projectId = req.project.id;
      const userId = req.user.id;
      const { title, description, testSuites } = req.body;
      
      console.log(`➕ [API] Creating test plan for project ${projectId}`);
      
      // Log project-scoped operation
      logProjectOperation('Test Plan Created', projectId, userId, {
        title: title,
        description: description
      });
      
      // In a real implementation, this would save to database
      const newTestPlan = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        project_id: projectId,
        user_id: userId,
        title: title,
        description: description,
        test_suites: testSuites || [],
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        testPlan: newTestPlan,
        projectId: projectId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [API] Error creating test plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test plan',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Get project members
app.get('/api/projects/:projectId/members', 
  loadProject, 
  assertMembership('viewer'),
  async (req, res) => {
    try {
      const projectId = req.project.id;
      const userId = req.user.id;
      
      console.log(`👥 [API] Fetching members for project ${projectId}`);
      
      // Log project-scoped operation
      logProjectOperation('Project Members Fetched', projectId, userId, {});
      
      // In a real implementation, this would query the project_memberships table
      const members = [
        {
          id: userId,
          email: req.user.email,
          role: req.userRole,
          joined_at: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        members: members,
        projectId: projectId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [API] Error fetching project members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project members',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

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
  console.log('🧪 Test execution: http://localhost:' + PORT + '/api/projects/:projectId/execute-test-suite');
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
