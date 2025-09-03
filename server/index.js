// server/index.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');
const WebSocket = require('ws');

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
    
    console.log(`Executing test suite: ${testSuite.name}`);
    console.log(`Test type: ${testSuite.testType}, Tool: ${testSuite.tool}`);
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start execution in background
    executeTestSuite(testSuite, executionId);
    
    res.json({
      success: true,
      executionId,
      message: 'Test suite execution started',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error starting test suite:', error);
    res.status(500).json({
      success: false,
      message: `Execution error: ${error.message}`,
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
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      activeBrowsers.set(executionId, browser);
      
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
        stepResult = await executeApiStep(step);
      } else if (testSuite.testType === 'Functional') {
        stepResult = await executeFunctionalStep(step, browser);
      } else if (testSuite.testType === 'Performance') {
        stepResult = await executePerformanceStep(step);
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
async function executeApiStep(step) {
  const startTime = Date.now();
  
  try {
    const url = new URL(step.config.url);
    
    // Add query parameters
    if (step.config.params) {
      Object.entries(step.config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Prepare headers
    const headers = { 'Content-Type': 'application/json' };
    if (step.config.headers) {
      Object.assign(headers, step.config.headers);
    }
    
    // Prepare request body
    let body = null;
    if (step.config.body && ['POST', 'PUT', 'PATCH'].includes(step.config.method)) {
      body = JSON.stringify(step.config.body);
    }
    
    // Add authentication
    if (step.config.auth) {
      if (step.config.auth.type === 'bearer') {
        headers['Authorization'] = `Bearer ${step.config.auth.token}`;
      } else if (step.config.auth.type === 'basic') {
        const credentials = Buffer.from(`${step.config.auth.username}:${step.config.auth.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
    }
    
    // Make real HTTP request
    const response = await axios({
      method: step.config.method,
      url: url.toString(),
      headers,
      data: body,
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    // Validate response
    let validationResults = [];
    if (step.config.validation) {
      if (step.config.validation.statusCode && response.status !== step.config.validation.statusCode) {
        validationResults.push(`Status code mismatch: expected ${step.config.validation.statusCode}, got ${response.status}`);
      }
      
      if (step.config.validation.responseTime && duration > step.config.validation.responseTime) {
        validationResults.push(`Response time too slow: ${duration}ms > ${step.config.validation.responseTime}ms`);
      }
    }
    
    const isSuccess = validationResults.length === 0;
    
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
      await page.waitForSelector(step.config.selector, { timeout: 5000 });
      
      if (step.config.action === 'click') {
        await page.click(step.config.selector);
        result = {
          success: true,
          message: `Successfully clicked ${step.config.selector}`
        };
      } else if (step.config.action === 'type') {
        await page.type(step.config.selector, step.config.value || '');
        result = {
          success: true,
          message: `Successfully typed into ${step.config.selector}`
        };
      } else if (step.config.action === 'select') {
        await page.select(step.config.selector, step.config.value);
        result = {
          success: true,
          message: `Successfully selected option in ${step.config.selector}`
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
async function executePerformanceStep(step) {
  const startTime = Date.now();
  
  try {
    if (step.type === 'loadTest') {
      const { url, duration, users, rampUpTime } = step.config;
      
      // Simulate load test with multiple concurrent requests
      const promises = [];
      for (let i = 0; i < users; i++) {
        const delay = (rampUpTime * 1000 * i) / users;
        promises.push(simulateUser(url, duration, i, delay));
      }
      
      const results = await Promise.all(promises);
      const totalRequests = results.reduce((sum, r) => sum + r.requests, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
      const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;
      
      const totalTime = Date.now() - startTime;
      
      return {
        success: totalErrors === 0,
        duration,
        message: `Load test completed: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        metrics: {
          totalRequests,
          totalErrors,
          avgResponseTime,
          requestsPerSecond: totalRequests / (totalTime / 1000)
        }
      };
    }
    
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
