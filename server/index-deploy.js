// server/index-deploy.js - Deployment version without WebSocket
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios');

// Import Cypress integration functions directly
const { executeCypressTest, generateCypressScript } = require('./cypressIntegration');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting SoftDeploy server (deployment version)...');
console.log('📦 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

app.use(cors());
app.use(express.json());

// Store active browser instances
const activeBrowsers = new Map();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API endpoint to execute a complete test suite
app.post('/api/execute-test-suite', async (req, res) => {
  try {
    const { testSuite } = req.body;
    
    console.log('📋 Received test suite execution request:', {
      name: testSuite.name,
      testType: testSuite.testType,
      tool: testSuite.toolId || testSuite.tool,
      steps: testSuite.steps?.length || 0
    });
    
    // Validate test suite
    if (!testSuite.name || !testSuite.testType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and testType are required'
      });
    }
    
    const validTestTypes = ['API', 'Functional', 'Performance'];
    if (!validTestTypes.includes(testSuite.testType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid testType: ${testSuite.testType}. Must be one of: ${validTestTypes.join(', ')}`
      });
    }
    
    const validTools = ['inbuilt', 'axios', 'puppeteer', 'k6', 'cypress', 'playwright'];
    if (!validTools.includes(testSuite.toolId || testSuite.tool)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tool ID: ${testSuite.toolId || testSuite.tool}. Must be one of: ${validTools.join(', ')}`
      });
    }
    
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🚀 Starting test suite execution: ${executionId}`);
    
    // Execute test suite
    const result = await executeTestSuite(testSuite, executionId);
    
    res.json({
      success: true,
      executionId,
      message: 'Test suite execution completed',
      result: result,
      finalResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test suite execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Execute test suite
async function executeTestSuite(testSuite, executionId) {
  const startTime = Date.now();
  let totalSteps = testSuite.steps?.length || 0;
  let passedSteps = 0;
  let failedSteps = 0;
  const results = [];
  
  console.log(`🧪 Starting test suite execution: ${testSuite.name}`);
  console.log(`📊 Test type: ${testSuite.testType}, Tool: ${testSuite.toolId || testSuite.tool}`);
  console.log(`📋 Total steps: ${totalSteps}`);
  
  try {
    for (let i = 0; i < testSuite.steps.length; i++) {
      const step = testSuite.steps[i];
      console.log(`🔄 Executing step ${i + 1}/${totalSteps}: ${step.name}`);
      
      let stepResult;
      
      if (testSuite.testType === 'API') {
        stepResult = await executeApiStep(step, testSuite);
      } else if (testSuite.testType === 'Functional') {
        stepResult = await executeFunctionalStep(step);
      } else if (testSuite.testType === 'Performance') {
        stepResult = await executePerformanceStep(step, testSuite);
      }
      
      // Ensure stepResult has the required properties
      if (!stepResult) {
        stepResult = {
          success: false,
          duration: 0,
          message: 'Step execution returned no result'
        };
      }
      
      if (!stepResult.duration) {
        stepResult.duration = 0;
      }
      
      if (!stepResult.message) {
        stepResult.message = stepResult.success ? 'Step completed successfully' : 'Step failed';
      }
      
      results.push({
        stepName: step.name,
        success: stepResult.success,
        duration: stepResult.duration,
        message: stepResult.message,
        error: stepResult.error || null
      });
      
      if (stepResult.success) {
        passedSteps++;
        console.log(`✅ Step ${i + 1} passed: ${step.name}`);
      } else {
        failedSteps++;
        console.log(`❌ Step ${i + 1} failed: ${step.name} - ${stepResult.message}`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const success = failedSteps === 0;
    
    const finalResult = {
      success,
      totalSteps,
      passedSteps,
      failedSteps,
      totalTime,
      results
    };
    
    console.log(`🏁 Test suite execution completed: ${testSuite.name}`);
    console.log(`📊 Results: ${passedSteps}/${totalSteps} passed, ${failedSteps} failed`);
    console.log(`⏱️ Total time: ${totalTime}ms`);
    
    return finalResult;
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    throw error;
  }
}

// Execute API test step
async function executeApiStep(step, testSuite) {
  const startTime = Date.now();
  
  try {
    const stepUrl = step.url || step.config?.url;
    if (!stepUrl) {
      throw new Error('URL is required for API step');
    }
    
    const baseUrl = testSuite.baseUrl || 'https://jsonplaceholder.typicode.com';
    const fullUrl = stepUrl.startsWith('http') ? stepUrl : `${baseUrl}${stepUrl}`;
    
    const method = step.method || step.config?.method || 'GET';
    const headers = step.headers || step.config?.headers || {};
    const body = step.body || step.config?.body;
    
    console.log(`🌐 Making ${method} request to: ${fullUrl}`);
    
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      headers,
      data: body,
      timeout: 10000
    });
    
    const duration = Date.now() - startTime;
    
    // Validate response
    const validation = step.validation || step.config?.validation || {};
    const expectedStatus = validation.statusCode || 200;
    const maxResponseTime = validation.responseTime || 5000;
    
    const success = response.status === expectedStatus && duration <= maxResponseTime;
    
    return {
      success,
      duration,
      message: success ? 'API call successful' : `API call failed: status ${response.status}, expected ${expectedStatus}`,
      status: response.status,
      responseTime: duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      duration,
      message: `API call failed: ${error.message}`,
      error: error.message
    };
  }
}

// Execute functional test step
async function executeFunctionalStep(step) {
  const startTime = Date.now();
  
  try {
    let browser = activeBrowsers.get('default');
    
    if (!browser) {
      console.log('🌐 Launching browser for functional tests...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      activeBrowsers.set('default', browser);
    }
    
    const page = await browser.newPage();
    
    try {
      if (step.type === 'navigation') {
        const url = step.url || step.config?.url;
        if (!url) {
          throw new Error('URL is required for navigation step');
        }
        
        console.log(`🌐 Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
      } else if (step.type === 'interaction') {
        const selector = step.selector || step.config?.selector;
        const action = step.action || step.config?.action;
        const value = step.value || step.config?.value;
        
        if (!selector || !action) {
          throw new Error('Selector and action are required for interaction step');
        }
        
        console.log(`🖱️ ${action} on selector: ${selector}`);
        
        // Handle multiple selectors
        const selectors = selector.split(',').map(s => s.trim());
        let foundSelector = null;
        
        for (const sel of selectors) {
          try {
            await page.waitForSelector(sel, { timeout: 2000 });
            foundSelector = sel;
            break;
          } catch (e) {
            console.log(`Selector ${sel} not found, trying next...`);
          }
        }
        
        if (!foundSelector) {
          throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
        }
        
        if (action === 'click') {
          await page.click(foundSelector);
        } else if (action === 'type') {
          await page.type(foundSelector, value || '');
        }
        
      } else if (step.type === 'assertion') {
        const selector = step.selector || step.config?.selector;
        const assertion = step.assertion || step.config?.assertion;
        const expectedValue = step.expectedValue || step.config?.expectedValue;
        
        if (!selector || !assertion) {
          throw new Error('Selector and assertion are required for assertion step');
        }
        
        console.log(`✅ Asserting ${assertion} on selector: ${selector}`);
        
        if (assertion === 'visible') {
          await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        } else if (assertion === 'contains') {
          const element = await page.$(selector);
          if (!element) {
            throw new Error(`Element not found: ${selector}`);
          }
          const text = await element.textContent();
          if (!text.includes(expectedValue)) {
            throw new Error(`Expected "${expectedValue}" but found "${text}"`);
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration,
        message: 'Functional step completed successfully'
      };
      
    } finally {
      await page.close();
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      duration,
      message: `Functional step failed: ${error.message}`,
      error: error.message
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
      
      return {
        success: totalErrors === 0,
        duration: testDuration,
        message: `Load test completed: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        metrics: {
          totalRequests,
          totalErrors,
          avgResponseTime,
          requestsPerSecond: totalRequests / (testDuration)
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
      
      return {
        success: totalErrors === 0,
        duration: testDuration,
        message: `Stress test completed: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        metrics: {
          totalRequests,
          totalErrors,
          avgResponseTime,
          requestsPerSecond: totalRequests / (testDuration)
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
      duration,
      message: `Performance step failed: ${error.message}`,
      error: error.message
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
    activeExecutions: activeBrowsers.size,
    version: 'deployment-v1.0'
  });
});

// Execution status endpoint
app.get('/api/execution-status/:executionId', (req, res) => {
  const { executionId } = req.params;
  
  // For deployment version, return a simple status
  res.json({
    executionId,
    status: 'completed',
    message: 'Execution completed (deployment version)'
  });
});

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 SoftDeploy server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test execution: http://localhost:${PORT}/api/execute-test-suite`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
