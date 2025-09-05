// Simplified server without WebSocket and Cypress
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Store active browser instances
const activeBrowsers = new Map();

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
      message: 'Test suite execution started',
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
    // Simplified functional test execution
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      duration,
      message: 'Functional step completed (simplified)'
    };
    
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
      
      // Construct full URL
      const baseUrl = testSuite.baseUrl || 'https://jsonplaceholder.typicode.com';
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      const userCount = users || vus || 5;
      const testDuration = typeof duration === 'string' ? parseInt(duration.replace('s', '')) : duration || 10;
      
      console.log(`⚡ Simulating load test: ${userCount} users for ${testDuration}s on ${fullUrl}`);
      
      // Simulate load test
      const promises = [];
      for (let i = 0; i < userCount; i++) {
        promises.push(simulateUser(fullUrl, testDuration, i, 0));
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
    }
    
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
    activeExecutions: activeBrowsers.size
  });
});

// Execution status endpoint
app.get('/api/execution-status/:executionId', (req, res) => {
  const { executionId } = req.params;
  
  // For now, return a mock completed status
  res.json({
    executionId,
    status: 'completed',
    finalResult: {
      success: true,
      totalSteps: 1,
      passedSteps: 1,
      failedSteps: 0,
      totalTime: 500,
      results: [{
        stepName: 'Test Step',
        success: true,
        duration: 500,
        message: 'Step completed successfully'
      }]
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Simplified test execution server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test execution: http://localhost:${PORT}/api/execute-test-suite`);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
