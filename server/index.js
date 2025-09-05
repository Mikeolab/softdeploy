// server/index.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const WebSocket = require('ws');

// Import Cypress integration functions directly
const { executeCypressTest, generateCypressScript } = require('./cypressIntegration');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// WebSocket server for real-time test execution updates
const wss = new WebSocket.Server({ noServer: true });

// Store active browser instances
const activeBrowsers = new Map();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// API endpoint to execute a complete test suite
app.post('/api/execute-test-suite', async (req, res) => {
  try {
    const { testSuite } = req.body;
    
    console.log('🚀 [SERVER] Received test suite execution request');
    console.log('📋 Test Suite Details:', {
      name: testSuite.name,
      type: testSuite.testType,
      tool: testSuite.toolId || testSuite.tool,
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
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🆔 [SERVER] Generated execution ID: ${executionId}`);
    
    // Start execution in background
    executeTestSuite(testSuite, executionId);
    
    console.log('✅ [SERVER] Test suite execution started successfully');
    res.json({
      success: true,
      executionId,
      message: 'Test suite execution started',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [SERVER] Error starting test suite:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      message: `Execution error: ${error.message}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to get execution status
app.get('/api/execution-status/:executionId', (req, res) => {
  const { executionId } = req.params;
  const status = executionStatus.get(executionId);
  
  if (status) {
    res.json(status);
  } else {
    res.status(404).json({ message: 'Execution not found' });
  }
});

// API endpoint to stop execution
app.post('/api/stop-execution/:executionId', (req, res) => {
  const { executionId } = req.params;
  
  if (activeBrowsers.has(executionId)) {
    const browser = activeBrowsers.get(executionId);
    browser.close();
    activeBrowsers.delete(executionId);
  }
  
  res.json({ success: true, message: 'Execution stopped' });
});

// Store execution status
const executionStatus = new Map();

// Execute complete test suite with real browser automation
async function executeTestSuite(testSuite, executionId) {
  const startTime = Date.now();
  const results = [];
  let browser = null;
  
  console.log(`🧪 [SERVER] Starting test suite execution: ${testSuite.name}`);
  console.log(`📊 [SERVER] Execution details:`, {
    executionId,
    testType: testSuite.testType,
    tool: testSuite.toolId || testSuite.tool,
    stepsCount: testSuite.steps?.length || 0,
    baseUrl: testSuite.baseUrl
  });
  
  try {
    // Initialize status
    executionStatus.set(executionId, {
      status: 'running',
      progress: 0,
      currentStep: '',
      results: [],
      startTime: new Date().toISOString()
    });
    
    broadcast({
      type: 'execution_started',
      executionId,
      testSuite: testSuite.name
    });
    
    // Initialize browser for functional tests
    if (testSuite.testType === 'Functional') {
      console.log('🌐 [SERVER] Initializing browser for functional tests...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      activeBrowsers.set(executionId, browser);
      
      console.log('✅ [SERVER] Browser initialized successfully');
      broadcast({
        type: 'browser_initialized',
        executionId
      });
    }
    
    // Execute each step
    for (let i = 0; i < testSuite.steps.length; i++) {
      const step = testSuite.steps[i];
      const stepIndex = i + 1;
      
      // Update status
      const progress = (stepIndex / testSuite.steps.length) * 100;
      executionStatus.set(executionId, {
        ...executionStatus.get(executionId),
        progress,
        currentStep: step.name
      });
      
      broadcast({
        type: 'step_started',
        executionId,
        stepIndex,
        stepName: step.name,
        progress
      });
      
      let stepResult;
      
      if (testSuite.testType === 'API') {
        stepResult = await executeApiStep(step, testSuite);
      } else if (testSuite.testType === 'Functional') {
        if ((testSuite.toolId || testSuite.tool) === 'Cypress') {
          // Execute entire test suite with Cypress
          const cypressResult = await executeCypressTest(testSuite, executionId);
          return cypressResult; // Return early for Cypress
        } else {
          stepResult = await executeFunctionalStep(step, browser);
        }
      } else if (testSuite.testType === 'Performance') {
        stepResult = await executePerformanceStep(step, testSuite);
      }
      
      // Ensure stepResult has the required properties
      if (!stepResult) {
        stepResult = {
          success: false,
          duration: 0,
          message: 'Step execution failed - no result returned'
        };
      }
      
      results.push({
        stepIndex,
        stepName: step.name,
        ...stepResult
      });
      
      // Update status with step result
      executionStatus.set(executionId, {
        ...executionStatus.get(executionId),
        results: [...results]
      });
      
      broadcast({
        type: 'step_completed',
        executionId,
        stepIndex,
        stepName: step.name,
        success: stepResult.success,
        duration: stepResult.duration,
        message: stepResult.message
      });
      
      // Stop on failure if configured
      if (!stepResult.success && testSuite.stopOnFailure) {
        broadcast({
          type: 'execution_stopped',
          executionId,
          reason: 'Step failure'
        });
        break;
      }
    }
    
    const totalTime = Date.now() - startTime;
    const passedSteps = results.filter(r => r.success).length;
    const totalSteps = results.length;
    
    const finalResult = {
      success: passedSteps === totalSteps,
      totalSteps,
      passedSteps,
      failedSteps: totalSteps - passedSteps,
      totalTime,
      results,
      executionId
    };
    
    // Update final status
    executionStatus.set(executionId, {
      ...executionStatus.get(executionId),
      status: 'completed',
      progress: 100,
      currentStep: '',
      finalResult
    });
    
    broadcast({
      type: 'execution_completed',
      executionId,
      finalResult
    });
    
  } catch (error) {
    console.error('Test suite execution error:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      executionId
    };
    
    executionStatus.set(executionId, {
      ...executionStatus.get(executionId),
      status: 'failed',
      error: error.message
    });
    
    broadcast({
      type: 'execution_failed',
      executionId,
      error: error.message
    });
  } finally {
    // Clean up browser
    if (browser) {
      await browser.close();
      activeBrowsers.delete(executionId);
    }
  }
}

// Execute API test step with real HTTP requests
async function executeApiStep(step, testSuite) {
  const startTime = Date.now();
  
  try {
    console.log('🔧 [SERVER] Executing API step:', step);
    
    // Handle both step.url and step.config.url formats
    const stepUrl = step.url || step.config?.url;
    const stepMethod = step.action || step.config?.method || 'GET';
    const stepHeaders = step.headers || step.config?.headers || {};
    const stepParams = step.params || step.config?.params || {};
    const stepBody = step.body || step.config?.body;
    const stepAuth = step.auth || step.config?.auth;
    
    if (!stepUrl) {
      throw new Error('No URL provided for API step');
    }
    
    // Construct full URL with base URL if needed
    let fullUrl = stepUrl;
    if (!stepUrl.startsWith('http')) {
      // Use the testSuite baseUrl if available, otherwise default
      const baseUrl = testSuite.baseUrl || 'https://jsonplaceholder.typicode.com';
      fullUrl = `${baseUrl}${stepUrl}`;
    }
    
    const url = new URL(fullUrl);
    
    // Add query parameters
    if (stepParams) {
      Object.entries(stepParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Prepare headers
    const headers = { 'Content-Type': 'application/json' };
    if (stepHeaders) {
      Object.assign(headers, stepHeaders);
    }
    
    // Prepare request body
    let body = null;
    if (stepBody && ['POST', 'PUT', 'PATCH'].includes(stepMethod)) {
      body = JSON.stringify(stepBody);
    }
    
    // Add authentication
    if (stepAuth) {
      if (stepAuth.type === 'bearer') {
        headers['Authorization'] = `Bearer ${stepAuth.token}`;
      } else if (stepAuth.type === 'basic') {
        const credentials = Buffer.from(`${stepAuth.username}:${stepAuth.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
    }
    
    console.log('🌐 [SERVER] Making API request:', {
      method: stepMethod,
      url: url.toString(),
      headers
    });
    
    // Make real HTTP request
    const response = await axios({
      method: stepMethod,
      url: url.toString(),
      headers,
      data: body,
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    // Validate response
    let validationResults = [];
    const validation = step.validation || step.config?.validation;
    
    // Check expected status code
    const expectedStatus = step.expectedStatus || validation?.statusCode;
    if (expectedStatus && response.status !== expectedStatus) {
      validationResults.push(`Status code mismatch: expected ${expectedStatus}, got ${response.status}`);
    }
    
    // Check response time
    const expectedResponseTime = validation?.responseTime;
    if (expectedResponseTime && duration > expectedResponseTime) {
      validationResults.push(`Response time too slow: ${duration}ms > ${expectedResponseTime}ms`);
    }
    
    // Check expected response data
    const expectedResponse = step.expectedResponse || validation?.responseData;
    if (expectedResponse) {
      try {
        const responseData = response.data;
        for (const [key, expectedValue] of Object.entries(expectedResponse)) {
          if (responseData[key] !== expectedValue) {
            validationResults.push(`Response data mismatch for '${key}': expected ${expectedValue}, got ${responseData[key]}`);
          }
        }
      } catch (error) {
        validationResults.push(`Response validation error: ${error.message}`);
      }
    }
    
    const isSuccess = validationResults.length === 0;
    
    console.log('✅ [SERVER] API step completed:', {
      success: isSuccess,
      status: response.status,
      duration: `${duration}ms`,
      validationResults
    });
    
    return {
      success: isSuccess,
      status: response.status,
      duration,
      responseData: response.data,
      validationResults,
      message: isSuccess ? 'API call successful' : `API call failed: ${validationResults.join(', ')}`
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('❌ [SERVER] API step failed:', {
      error: error.message,
      duration: `${duration}ms`,
      step: step
    });
    
    return {
      success: false,
      error: error.message,
      duration,
      message: `API call failed: ${error.message}`
    };
  }
}

// Execute functional test step with real browser automation
async function executeFunctionalStep(step, browser) {
  const startTime = Date.now();
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    let result;
    
    if (step.type === 'navigation') {
      await page.goto(step.config.url, { waitUntil: 'networkidle2' });
      result = {
        success: true,
        message: `Successfully navigated to ${step.config.url}`
      };
    } else if (step.type === 'interaction') {
      // Handle multiple selectors (comma-separated)
      const selectors = step.config.selector.split(',').map(s => s.trim());
      let foundSelector = null;
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          foundSelector = selector;
          break;
        } catch (e) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!foundSelector) {
        throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
      }
      
      if (step.config.action === 'click') {
        await page.click(foundSelector);
        result = {
          success: true,
          message: `Successfully clicked ${foundSelector}`
        };
      } else if (step.config.action === 'type') {
        await page.type(foundSelector, step.config.value || '');
        result = {
          success: true,
          message: `Successfully typed into ${foundSelector}`
        };
      } else if (step.config.action === 'select') {
        await page.select(foundSelector, step.config.value);
        result = {
          success: true,
          message: `Successfully selected option in ${foundSelector}`
        };
      }
    } else if (step.type === 'assertion') {
      await page.waitForSelector(step.config.selector, { timeout: 5000 });
      
      if (step.config.type === 'elementExists') {
        const element = await page.$(step.config.selector);
        result = {
          success: !!element,
          message: element ? `Element ${step.config.selector} exists` : `Element ${step.config.selector} not found`
        };
      } else if (step.config.type === 'textContains') {
        const text = await page.textContent(step.config.selector);
        const contains = text.includes(step.config.expectedValue);
        result = {
          success: contains,
          message: contains ? `Text contains "${step.config.expectedValue}"` : `Text does not contain "${step.config.expectedValue}"`
        };
      } else if (step.config.type === 'visible') {
        const isVisible = await page.isVisible(step.config.selector);
        result = {
          success: isVisible,
          message: isVisible ? `Element ${step.config.selector} is visible` : `Element ${step.config.selector} is not visible`
        };
      }
    }
    
    // Ensure result is defined
    if (!result) {
      result = {
        success: false,
        message: `Unknown step type: ${step.type}`
      };
    }
    
    await page.close();
    
    const duration = Date.now() - startTime;
    
    return {
      ...result,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      duration,
      message: `Functional step failed: ${error.message}`
    };
  }
}

// Execute performance test step
async function executePerformanceStep(step, testSuite) {
  const startTime = Date.now();
  
  try {
    if (step.type === 'loadTest' || step.type === 'load') {
      const { url, duration, users, rampUpTime, vus } = step.config;
      
      // Simulate load test with multiple concurrent requests
      const promises = [];
      const userCount = users || vus || 5; // Use vus if users not provided
      const testDuration = typeof duration === 'string' ? parseInt(duration.replace('s', '')) : duration || 10;
      
      // Construct full URL
      const baseUrl = testSuite.baseUrl || 'https://jsonplaceholder.typicode.com';
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      for (let i = 0; i < userCount; i++) {
        const delay = (rampUpTime * 1000 * i) / userCount;
        promises.push(simulateUser(fullUrl, testDuration, i, delay));
      }
      
      const results = await Promise.all(promises);
      const totalRequests = results.reduce((sum, r) => sum + r.requests, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
      const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
      
      const totalTime = Date.now() - startTime;
      
      return {
        success: totalErrors === 0,
        duration: testDuration,
        message: `Load test completed: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        metrics: {
          totalRequests,
          totalErrors,
          avgResponseTime,
          requestsPerSecond: totalRequests / (totalTime / 1000)
        }
      };
    } else if (step.type === 'stressTest' || step.type === 'stress') {
      const { url, duration, users, rampUpTime, vus } = step.config;
      
      // Simulate stress test with higher load
      const promises = [];
      const userCount = (users || vus || 5) * 2; // Double the load for stress test
      const testDuration = typeof duration === 'string' ? parseInt(duration.replace('s', '')) : duration || 10;
      
      // Construct full URL
      const baseUrl = testSuite.baseUrl || 'https://jsonplaceholder.typicode.com';
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      for (let i = 0; i < userCount; i++) {
        const delay = (rampUpTime * 1000 * i) / userCount;
        promises.push(simulateUser(fullUrl, testDuration, i, delay));
      }
      
      const results = await Promise.all(promises);
      const totalRequests = results.reduce((sum, r) => sum + r.requests, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
      const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
      
      const totalTime = Date.now() - startTime;
      
      return {
        success: totalErrors < totalRequests * 0.1, // Allow up to 10% error rate for stress test
        duration: testDuration,
        message: `Stress test completed: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        metrics: {
          totalRequests,
          totalErrors,
          avgResponseTime,
          requestsPerSecond: totalRequests / (totalTime / 1000)
        }
      };
    }
    
    // Default return for unknown performance step types
    return {
      success: false,
      duration: Date.now() - startTime,
      message: `Unknown performance step type: ${step.type}`
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      duration,
      message: `Performance step failed: ${error.message}`
    };
  }
}

// Simulate a user making requests
async function simulateUser(url, duration, userId, delay = 0) {
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  let requests = 0;
  let errors = 0;
  let totalResponseTime = 0;
  
  while (Date.now() < endTime) {
    try {
      const requestStart = Date.now();
      const response = await axios.get(url, { timeout: 5000 });
      const requestDuration = Date.now() - requestStart;
      
      totalResponseTime += requestDuration;
      requests++;
      
      if (!response.data) {
        errors++;
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      errors++;
      totalResponseTime += 5000; // Assume 5s timeout for failed requests
    }
  }
  
  return {
    requests,
    errors,
    avgResponseTime: requests > 0 ? totalResponseTime / requests : 0
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeExecutions: activeBrowsers.size
  });
});

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Real test execution server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test execution: http://localhost:${PORT}/api/execute-test-suite`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
});

// Attach WebSocket server to HTTP server
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
