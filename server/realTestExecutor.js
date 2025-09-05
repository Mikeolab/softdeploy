// server/realTestExecutor.js
const puppeteer = require('puppeteer');
const axios = require('axios');
const WebSocket = require('ws');

class RealTestExecutor {
  constructor(wsConnection) {
    this.ws = wsConnection;
    this.browser = null;
    this.page = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.results = [];
    this.isRunning = false;
  }

  // Send real-time update to client
  async sendUpdate(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        ...data
      }));
    }
  }

  // Initialize browser for functional tests
  async initializeBrowser() {
    try {
      await this.sendUpdate('browser_init', { message: 'Initializing browser...' });
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
      
      await this.sendUpdate('browser_ready', { message: 'Browser initialized successfully' });
      return true;
    } catch (error) {
      await this.sendUpdate('browser_error', { 
        message: 'Failed to initialize browser',
        error: error.message 
      });
      return false;
    }
  }

  // Execute API test step
  async executeApiStep(step, baseUrl) {
    const startTime = Date.now();
    
    try {
      await this.sendUpdate('step_start', {
        stepNumber: this.currentStep + 1,
        stepName: step.name,
        stepType: 'API',
        message: `Executing: ${step.description}`
      });

      const config = step.config;
      const url = config.url.startsWith('http') ? config.url : `${baseUrl}${config.url}`;
      
      // Prepare request options
      const requestOptions = {
        method: config.method || 'GET',
        url,
        timeout: config.timeout || 10000,
        validateStatus: () => true // Don't throw on HTTP error status
      };

      // Add headers
      if (config.headers) {
        requestOptions.headers = config.headers;
      }

      // Add body for POST/PUT/PATCH
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        requestOptions.data = config.body;
      }

      // Execute the API call
      await this.sendUpdate('step_progress', {
        stepNumber: this.currentStep + 1,
        message: `Making ${config.method} request to ${url}`
      });

      const response = await axios(requestOptions);
      const responseTime = Date.now() - startTime;

      // Validate response
      const validation = config.validation || {};
      let isValid = true;
      let validationMessage = '';

      // Check status code
      if (validation.statusCode && response.status !== validation.statusCode) {
        isValid = false;
        validationMessage += `Expected status ${validation.statusCode}, got ${response.status}. `;
      }

      // Check response time
      if (validation.responseTime && responseTime > validation.responseTime) {
        isValid = false;
        validationMessage += `Response time ${responseTime}ms exceeds limit ${validation.responseTime}ms. `;
      }

      // Check response body if specified
      if (validation.responseBody) {
        const responseData = typeof response.data === 'string' ? 
          JSON.parse(response.data) : response.data;
        
        for (const [key, expectedValue] of Object.entries(validation.responseBody)) {
          if (responseData[key] !== expectedValue) {
            isValid = false;
            validationMessage += `Expected ${key} to be ${expectedValue}, got ${responseData[key]}. `;
          }
        }
      }

      const result = {
        stepName: step.name,
        success: isValid,
        message: isValid ? 'API call successful' : validationMessage,
        responseTime,
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('step_complete', {
        stepNumber: this.currentStep + 1,
        result,
        message: isValid ? 'Step completed successfully' : `Step failed: ${validationMessage}`
      });

      return result;

    } catch (error) {
      const result = {
        stepName: step.name,
        success: false,
        message: `API call failed: ${error.message}`,
        responseTime: Date.now() - startTime,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('step_error', {
        stepNumber: this.currentStep + 1,
        result,
        message: `Step failed: ${error.message}`
      });

      return result;
    }
  }

  // Execute functional test step
  async executeFunctionalStep(step, baseUrl) {
    try {
      await this.sendUpdate('step_start', {
        stepNumber: this.currentStep + 1,
        stepName: step.name,
        stepType: 'Functional',
        message: `Executing: ${step.description}`
      });

      const config = step.config;
      let result;

      switch (step.type) {
        case 'navigation':
          await this.sendUpdate('step_progress', {
            stepNumber: this.currentStep + 1,
            message: `Navigating to ${config.url}`
          });

          await this.page.goto(config.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });

          result = {
            stepName: step.name,
            success: true,
            message: 'Navigation completed successfully',
            url: config.url,
            timestamp: new Date().toISOString()
          };
          break;

        case 'interaction':
          await this.sendUpdate('step_progress', {
            stepNumber: this.currentStep + 1,
            message: `Performing ${config.action} on ${config.selector}`
          });

          const element = await this.page.$(config.selector);
          if (!element) {
            throw new Error(`Element not found: ${config.selector}`);
          }

          switch (config.action) {
            case 'click':
              await element.click();
              break;
            case 'type':
              await element.type(config.value);
              break;
            case 'select':
              await element.select(config.value);
              break;
            default:
              throw new Error(`Unknown action: ${config.action}`);
          }

          result = {
            stepName: step.name,
            success: true,
            message: `Interaction completed: ${config.action}`,
            selector: config.selector,
            timestamp: new Date().toISOString()
          };
          break;

        case 'assertion':
          await this.sendUpdate('step_progress', {
            stepNumber: this.currentStep + 1,
            message: `Checking ${config.assertion} for ${config.selector}`
          });

          const assertionElement = await this.page.$(config.selector);
          let assertionResult = false;

          switch (config.assertion) {
            case 'visible':
              assertionResult = assertionElement !== null;
              break;
            case 'hidden':
              assertionResult = assertionElement === null;
              break;
            case 'text':
              if (assertionElement) {
                const text = await assertionElement.textContent();
                assertionResult = text.includes(config.expectedText);
              }
              break;
            case 'count':
              const elements = await this.page.$$(config.selector);
              assertionResult = elements.length === config.expectedCount;
              break;
          }

          result = {
            stepName: step.name,
            success: assertionResult,
            message: assertionResult ? 
              `Assertion passed: ${config.assertion}` : 
              `Assertion failed: ${config.assertion}`,
            selector: config.selector,
            assertion: config.assertion,
            timestamp: new Date().toISOString()
          };
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      await this.sendUpdate('step_complete', {
        stepNumber: this.currentStep + 1,
        result,
        message: result.success ? 'Step completed successfully' : 'Step failed'
      });

      return result;

    } catch (error) {
      const result = {
        stepName: step.name,
        success: false,
        message: `Functional step failed: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('step_error', {
        stepNumber: this.currentStep + 1,
        result,
        message: `Step failed: ${error.message}`
      });

      return result;
    }
  }

  // Execute performance test step
  async executePerformanceStep(step, baseUrl) {
    try {
      await this.sendUpdate('step_start', {
        stepNumber: this.currentStep + 1,
        stepName: step.name,
        stepType: 'Performance',
        message: `Executing: ${step.description}`
      });

      const config = step.config;
      const url = config.url.startsWith('http') ? config.url : `${baseUrl}${config.url}`;
      
      await this.sendUpdate('step_progress', {
        stepNumber: this.currentStep + 1,
        message: `Starting load test: ${config.users} users for ${config.duration}`
      });

      const startTime = Date.now();
      const requests = [];
      const errors = [];
      
      // Simulate load testing
      const duration = parseInt(config.duration.replace('s', '')) * 1000;
      const users = parseInt(config.users);
      const rampUpTime = parseInt(config.rampUpTime) * 1000;
      
      const requestsPerSecond = users / (rampUpTime / 1000);
      const totalRequests = Math.floor(duration / 1000) * requestsPerSecond;
      
      let completedRequests = 0;
      
      // Execute requests with ramp-up
      for (let i = 0; i < totalRequests; i++) {
        setTimeout(async () => {
          try {
            const requestStart = Date.now();
            const response = await axios({
              method: config.method || 'GET',
              url,
              timeout: 5000
            });
            const requestTime = Date.now() - requestStart;
            
            requests.push({
              responseTime: requestTime,
              statusCode: response.status,
              timestamp: Date.now()
            });
            
            completedRequests++;
            
            // Send progress update every 10 requests
            if (completedRequests % 10 === 0) {
              await this.sendUpdate('step_progress', {
                stepNumber: this.currentStep + 1,
                message: `Completed ${completedRequests}/${totalRequests} requests`
              });
            }
            
          } catch (error) {
            errors.push({
              error: error.message,
              timestamp: Date.now()
            });
            completedRequests++;
          }
        }, (i / requestsPerSecond) * 1000);
      }

      // Wait for test completion
      await new Promise(resolve => setTimeout(resolve, duration + 1000));

      const totalTime = Date.now() - startTime;
      const avgResponseTime = requests.length > 0 ? 
        requests.reduce((sum, req) => sum + req.responseTime, 0) / requests.length : 0;
      const actualRequestsPerSecond = requests.length / (totalTime / 1000);

      const result = {
        stepName: step.name,
        success: errors.length === 0,
        message: `Load test completed: ${requests.length} requests, ${errors.length} errors, avg ${avgResponseTime.toFixed(2)}ms`,
        totalRequests: requests.length,
        totalErrors: errors.length,
        averageResponseTime: avgResponseTime,
        requestsPerSecond: actualRequestsPerSecond,
        totalTime: totalTime,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('step_complete', {
        stepNumber: this.currentStep + 1,
        result,
        message: result.success ? 'Performance test completed successfully' : 'Performance test completed with errors'
      });

      return result;

    } catch (error) {
      const result = {
        stepName: step.name,
        success: false,
        message: `Performance test failed: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('step_error', {
        stepNumber: this.currentStep + 1,
        result,
        message: `Step failed: ${error.message}`
      });

      return result;
    }
  }

  // Execute complete test suite step by step
  async executeTestSuite(testSuite) {
    if (this.isRunning) {
      throw new Error('Test execution already in progress');
    }

    this.isRunning = true;
    this.currentStep = 0;
    this.totalSteps = testSuite.steps.length;
    this.results = [];

    try {
      await this.sendUpdate('suite_start', {
        suiteName: testSuite.name,
        totalSteps: this.totalSteps,
        testType: testSuite.testType,
        message: `Starting test suite: ${testSuite.name}`
      });

      // Initialize browser for functional tests
      if (testSuite.testType === 'Functional') {
        const browserReady = await this.initializeBrowser();
        if (!browserReady) {
          throw new Error('Failed to initialize browser');
        }
      }

      // Execute each step sequentially
      for (let i = 0; i < testSuite.steps.length; i++) {
        this.currentStep = i;
        const step = testSuite.steps[i];
        
        await this.sendUpdate('step_prepare', {
          stepNumber: i + 1,
          stepName: step.name,
          message: `Preparing step ${i + 1}/${this.totalSteps}: ${step.name}`
        });

        let stepResult;

        switch (testSuite.testType) {
          case 'API':
            stepResult = await this.executeApiStep(step, testSuite.baseUrl);
            break;
          case 'Functional':
            stepResult = await this.executeFunctionalStep(step, testSuite.baseUrl);
            break;
          case 'Performance':
            stepResult = await this.executePerformanceStep(step, testSuite.baseUrl);
            break;
          default:
            throw new Error(`Unknown test type: ${testSuite.testType}`);
        }

        this.results.push(stepResult);

        // If step failed and we should stop on failure, break
        if (!stepResult.success && testSuite.stopOnFailure !== false) {
          await this.sendUpdate('suite_stopped', {
            message: `Test suite stopped due to step failure: ${step.name}`,
            failedStep: i + 1
          });
          break;
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Calculate final results
      const passedSteps = this.results.filter(r => r.success).length;
      const failedSteps = this.results.filter(r => !r.success).length;
      const totalTime = this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0);

      const finalResult = {
        success: failedSteps === 0,
        totalSteps: this.totalSteps,
        passedSteps,
        failedSteps,
        totalTime,
        results: this.results,
        timestamp: new Date().toISOString()
      };

      await this.sendUpdate('suite_complete', {
        result: finalResult,
        message: `Test suite completed: ${passedSteps}/${this.totalSteps} steps passed`
      });

      return finalResult;

    } catch (error) {
      await this.sendUpdate('suite_error', {
        error: error.message,
        message: `Test suite failed: ${error.message}`
      });
      throw error;
    } finally {
      this.isRunning = false;
      
      // Clean up browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    }
  }
}

module.exports = RealTestExecutor;
