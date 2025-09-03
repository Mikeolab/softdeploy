// src/lib/testExecutor.js
// Advanced test executor using Puppeteer for real browser automation

class TestExecutor {
  constructor() {
    this.isRunning = false;
    this.currentTest = null;
    this.results = [];
    this.variables = {};
  }

  // Initialize Puppeteer browser
  async initializeBrowser() {
    try {
      // Dynamic import to avoid SSR issues
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      return browser;
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw new Error('Browser initialization failed');
    }
  }

  // Execute API test step
  async executeApiStep(step, onProgress) {
    const startTime = Date.now();
    
    try {
      onProgress(`Executing API step: ${step.name}`, 'info');
      
      const { method = 'GET', url, headers = {}, params = {}, body } = step.config;
      
      // Build URL with query parameters
      let fullUrl = url;
      if (Object.keys(params).length > 0) {
        const urlParams = new URLSearchParams(params);
        fullUrl += `?${urlParams.toString()}`;
      }

      // Prepare request options
      const requestOptions = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      // Add body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(fullUrl, requestOptions);
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const duration = Date.now() - startTime;
      
      // Validate response
      const validation = step.config.validation;
      let success = true;
      let message = `API call successful: ${response.status}`;

      if (validation) {
        if (validation.statusCode && response.status !== parseInt(validation.statusCode)) {
          success = false;
          message = `Status code mismatch: expected ${validation.statusCode}, got ${response.status}`;
        }
        
        if (validation.responseTime && duration > validation.responseTime) {
          success = false;
          message = `Response time exceeded: ${duration}ms > ${validation.responseTime}ms`;
        }
      }

      // Extract variables if specified
      if (step.config.extraction) {
        const { variableName, jsonPath } = step.config.extraction;
        if (variableName && jsonPath && responseData) {
          const value = this.extractValueFromJsonPath(responseData, jsonPath);
          this.variables[variableName] = value;
          onProgress(`Extracted variable ${variableName}: ${value}`, 'info');
        }
      }

      onProgress(`API step completed: ${message}`, success ? 'success' : 'error');
      
      return {
        success,
        message,
        duration,
        response: {
          status: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      onProgress(`API step failed: ${error.message}`, 'error');
      
      return {
        success: false,
        message: error.message,
        duration,
        error: error.toString()
      };
    }
  }

  // Execute functional test step using Puppeteer
  async executeFunctionalStep(step, browser, onProgress) {
    const startTime = Date.now();
    
    try {
      onProgress(`Executing functional step: ${step.name}`, 'info');
      
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      const { type, config } = step;
      
      switch (type) {
        case 'navigation':
          await page.goto(config.url, { waitUntil: 'networkidle2' });
          onProgress(`Navigated to: ${config.url}`, 'success');
          break;
          
        case 'interaction':
          await this.performInteraction(page, config, onProgress);
          break;
          
        case 'assertion':
          await this.performAssertion(page, config, onProgress);
          break;
          
        default:
          throw new Error(`Unknown step type: ${type}`);
      }
      
      await page.close();
      
      const duration = Date.now() - startTime;
      onProgress(`Functional step completed successfully`, 'success');
      
      return {
        success: true,
        message: `Step executed successfully`,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      onProgress(`Functional step failed: ${error.message}`, 'error');
      
      return {
        success: false,
        message: error.message,
        duration,
        error: error.toString()
      };
    }
  }

  // Perform browser interactions
  async performInteraction(page, config, onProgress) {
    const { action, selector, value, options = {} } = config;
    
    // Wait for element to be available
    await page.waitForSelector(selector, { timeout: options.timeout || 5000 });
    
    switch (action) {
      case 'click':
        await page.click(selector);
        onProgress(`Clicked element: ${selector}`, 'info');
        break;
        
      case 'type':
        await page.type(selector, value || '');
        onProgress(`Typed into element: ${selector}`, 'info');
        break;
        
      case 'select':
        await page.select(selector, value);
        onProgress(`Selected option in: ${selector}`, 'info');
        break;
        
      case 'check':
        await page.check(selector);
        onProgress(`Checked element: ${selector}`, 'info');
        break;
        
      case 'uncheck':
        await page.uncheck(selector);
        onProgress(`Unchecked element: ${selector}`, 'info');
        break;
        
      case 'hover':
        await page.hover(selector);
        onProgress(`Hovered over element: ${selector}`, 'info');
        break;
        
      case 'scroll':
        await page.evaluate((sel) => {
          document.querySelector(sel).scrollIntoView();
        }, selector);
        onProgress(`Scrolled to element: ${selector}`, 'info');
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  // Perform browser assertions
  async performAssertion(page, config, onProgress) {
    const { assertion, selector, expectedValue, timeout = 5000 } = config;
    
    // Wait for element to be available
    await page.waitForSelector(selector, { timeout });
    
    switch (assertion) {
      case 'visible':
        const isVisible = await page.isVisible(selector);
        if (!isVisible) {
          throw new Error(`Element ${selector} is not visible`);
        }
        onProgress(`Element is visible: ${selector}`, 'info');
        break;
        
      case 'exists':
        const exists = await page.$(selector);
        if (!exists) {
          throw new Error(`Element ${selector} does not exist`);
        }
        onProgress(`Element exists: ${selector}`, 'info');
        break;
        
      case 'contains':
        const text = await page.textContent(selector);
        if (!text.includes(expectedValue)) {
          throw new Error(`Element ${selector} does not contain "${expectedValue}"`);
        }
        onProgress(`Element contains text: ${selector}`, 'info');
        break;
        
      case 'has_class':
        const hasClass = await page.evaluate((sel, cls) => {
          return document.querySelector(sel).classList.contains(cls);
        }, selector, expectedValue);
        if (!hasClass) {
          throw new Error(`Element ${selector} does not have class "${expectedValue}"`);
        }
        onProgress(`Element has class: ${selector}`, 'info');
        break;
        
      case 'has_value':
        const inputValue = await page.inputValue(selector);
        if (inputValue !== expectedValue) {
          throw new Error(`Element ${selector} value is "${inputValue}", expected "${expectedValue}"`);
        }
        onProgress(`Element has value: ${selector}`, 'info');
        break;
        
      default:
        throw new Error(`Unknown assertion: ${assertion}`);
    }
  }

  // Execute performance test step
  async executePerformanceStep(step, onProgress) {
    const startTime = Date.now();
    
    try {
      onProgress(`Executing performance step: ${step.name}`, 'info');
      
      const { type, config } = step;
      
      switch (type) {
        case 'loadTest':
          return await this.executeLoadTest(config, onProgress);
          
        case 'stressTest':
          return await this.executeStressTest(config, onProgress);
          
        default:
          throw new Error(`Unknown performance test type: ${type}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      onProgress(`Performance step failed: ${error.message}`, 'error');
      
      return {
        success: false,
        message: error.message,
        duration,
        error: error.toString()
      };
    }
  }

  // Execute load test
  async executeLoadTest(config, onProgress) {
    const { virtualUsers = 10, duration = 60, targetUrl } = config;
    const startTime = Date.now();
    
    onProgress(`Starting load test: ${virtualUsers} users for ${duration}s`, 'info');
    
    const results = [];
    const promises = [];
    
    // Simulate concurrent users
    for (let i = 0; i < virtualUsers; i++) {
      const promise = this.simulateUser(targetUrl, duration, i, onProgress);
      promises.push(promise);
    }
    
    // Wait for all users to complete
    const userResults = await Promise.all(promises);
    
    // Calculate metrics
    const totalRequests = userResults.reduce((sum, r) => sum + r.requests, 0);
    const totalErrors = userResults.reduce((sum, r) => sum + r.errors, 0);
    const avgResponseTime = userResults.reduce((sum, r) => sum + r.avgResponseTime, 0) / userResults.length;
    
    const testDuration = Date.now() - startTime;
    
    onProgress(`Load test completed: ${totalRequests} requests, ${totalErrors} errors`, 'success');
    
    return {
      success: totalErrors === 0,
      message: `Load test: ${totalRequests} requests, ${totalErrors} errors, avg ${avgResponseTime.toFixed(2)}ms`,
      duration: testDuration,
      metrics: {
        totalRequests,
        totalErrors,
        avgResponseTime,
        requestsPerSecond: totalRequests / (duration / 1000)
      }
    };
  }

  // Simulate a single user
  async simulateUser(url, duration, userId, onProgress) {
    const startTime = Date.now();
    let requests = 0;
    let errors = 0;
    let totalResponseTime = 0;
    
    while (Date.now() - startTime < duration * 1000) {
      try {
        const requestStart = Date.now();
        const response = await fetch(url);
        const requestDuration = Date.now() - requestStart;
        
        totalResponseTime += requestDuration;
        requests++;
        
        if (!response.ok) {
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

  // Execute stress test
  async executeStressTest(config, onProgress) {
    const { maxUsers = 100, stepSize = 10, stepDuration = 30, targetUrl } = config;
    const startTime = Date.now();
    
    onProgress(`Starting stress test: up to ${maxUsers} users`, 'info');
    
    const results = [];
    
    for (let users = stepSize; users <= maxUsers; users += stepSize) {
      onProgress(`Stress test step: ${users} users`, 'info');
      
      const stepResult = await this.executeLoadTest({
        virtualUsers: users,
        duration: stepDuration,
        targetUrl
      }, onProgress);
      
      results.push({
        users,
        ...stepResult.metrics
      });
      
      // Check if we should stop due to high error rate
      if (stepResult.metrics.totalErrors / stepResult.metrics.totalRequests > 0.1) {
        onProgress(`Stopping stress test: error rate too high`, 'warning');
        break;
      }
    }
    
    const testDuration = Date.now() - startTime;
    
    return {
      success: true,
      message: `Stress test completed: tested up to ${results.length * stepSize} users`,
      duration: testDuration,
      results
    };
  }

  // Extract value from JSON using path
  extractValueFromJsonPath(obj, path) {
    try {
      const keys = path.replace(/^\$\./, '').split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return null;
        }
      }
      
      return result;
    } catch (error) {
      console.error('JSON path extraction failed:', error);
      return null;
    }
  }

  // Execute complete test suite
  async executeTestSuite(testSuite, onProgress) {
    if (this.isRunning) {
      throw new Error('Test execution already in progress');
    }

    this.isRunning = true;
    this.currentTest = testSuite;
    this.results = [];
    this.variables = {};

    try {
      onProgress(`Starting test suite: ${testSuite.name}`, 'info');
      
      let browser = null;
      if (testSuite.testType === 'functional') {
        browser = await this.initializeBrowser();
      }

      const startTime = Date.now();
      let totalSteps = testSuite.steps.length;
      let passedSteps = 0;
      let failedSteps = 0;

      for (let i = 0; i < testSuite.steps.length; i++) {
        const step = testSuite.steps[i];
        
        onProgress(`Executing step ${i + 1}/${totalSteps}: ${step.name}`, 'info');
        
        let result;
        
        switch (testSuite.testType) {
          case 'api':
            result = await this.executeApiStep(step, onProgress);
            break;
            
          case 'functional':
            result = await this.executeFunctionalStep(step, browser, onProgress);
            break;
            
          case 'performance':
            result = await this.executePerformanceStep(step, onProgress);
            break;
            
          default:
            throw new Error(`Unknown test type: ${testSuite.testType}`);
        }

        result.stepNumber = i + 1;
        result.stepName = step.name;
        this.results.push(result);

        if (result.success) {
          passedSteps++;
        } else {
          failedSteps++;
          // Optionally stop on first failure
          if (testSuite.stopOnFailure) {
            onProgress(`Stopping on first failure`, 'warning');
            break;
          }
        }
      }

      if (browser) {
        await browser.close();
      }

      const totalDuration = Date.now() - startTime;
      const success = failedSteps === 0;

      const finalResult = {
        success,
        testSuite: testSuite.name,
        summary: {
          total: totalSteps,
          passed: passedSteps,
          failed: failedSteps,
          duration: totalDuration
        },
        steps: this.results,
        variables: this.variables
      };

      onProgress(`Test suite completed: ${passedSteps}/${totalSteps} passed`, success ? 'success' : 'error');
      
      return finalResult;

    } catch (error) {
      onProgress(`Test suite failed: ${error.message}`, 'error');
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTest = null;
    }
  }

  // Stop current execution
  stopExecution() {
    this.isRunning = false;
    if (this.currentTest) {
      this.currentTest = null;
    }
  }

  // Get execution status
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTest: this.currentTest?.name || null,
      results: this.results
    };
  }
}

// Create singleton instance
const testExecutor = new TestExecutor();

export default testExecutor;
