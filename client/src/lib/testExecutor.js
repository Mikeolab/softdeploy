

class TestExecutor {
  constructor() {
    this.isRunning = false;
    this.currentExecution = null;
    this.variables = {};
    this.serverUrl = 'http://localhost:3001';
    this.ws = null;
    this.executionId = null;
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket('ws://localhost:3001');
    
    this.ws.onopen = () => {
      console.log('Connected to test execution server');
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleServerMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from test execution server');
    };
  }

  // Handle messages from server
  handleServerMessage(message) {
    // This will be handled by the component that uses testExecutor
    if (this.onMessageCallback) {
      this.onMessageCallback(message);
    }
  }

  // Set callback for server messages
  setMessageCallback(callback) {
    this.onMessageCallback = callback;
  }

  async executeTestSuite(testSuite, onProgress) {
    if (this.isRunning) {
      throw new Error('Test execution already in progress');
    }

    this.isRunning = true;
    this.variables = {};
    this.executionId = null;

    try {
      // Connect to WebSocket for real-time updates
      this.connectWebSocket();
      
      // Set up message handling
      this.setMessageCallback((message) => {
        if (message.executionId === this.executionId) {
          this.handleExecutionMessage(message, onProgress);
        }
      });

      onProgress(`Starting test suite: ${testSuite.name}`, 'info');
      onProgress(`Test type: ${testSuite.testType}, Tool: ${testSuite.tool}`, 'info');

      // Send test suite to server for execution
      const response = await fetch(`${this.serverUrl}/api/execute-test-suite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testSuite })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      this.executionId = result.executionId;
      onProgress(`Test execution started with ID: ${this.executionId}`, 'info');

      // Poll for completion
      return await this.pollExecutionStatus(onProgress);

    } catch (error) {
      onProgress(`Test suite failed: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isRunning = false;
      this.executionId = null;
    }
  }

  // Handle real-time messages from server
  handleExecutionMessage(message, onProgress) {
    switch (message.type) {
      case 'execution_started':
        onProgress(`Test execution started: ${message.testSuite}`, 'info');
        break;
        
      case 'browser_initialized':
        onProgress('Browser initialized for functional testing', 'info');
        break;
        
      case 'cypress_output':
        onProgress(`📝 Cypress: ${message.message}`, 'info');
        break;
        
      case 'cypress_error':
        onProgress(`❌ Cypress Error: ${message.message}`, 'error');
        break;
        
      case 'cypress_complete':
        if (message.result.success) {
          onProgress(`✅ Cypress test completed successfully!`, 'success');
        } else {
          onProgress(`❌ Cypress test failed with exit code: ${message.result.exitCode}`, 'error');
        }
        onProgress(`📊 Output: ${message.result.output}`, 'info');
        if (message.result.errorOutput) {
          onProgress(`⚠️ Errors: ${message.result.errorOutput}`, 'warning');
        }
        break;
        
      case 'step_started':
        onProgress(`Executing step ${message.stepIndex}: ${message.stepName}`, 'info');
        break;
        
      case 'step_completed':
        const status = message.success ? 'PASS' : 'FAIL';
        onProgress(`Step ${message.stepIndex} completed: ${status} (${message.duration}ms)`, 
                  message.success ? 'success' : 'error');
        if (message.message) {
          onProgress(`  ${message.message}`, message.success ? 'info' : 'error');
        }
        break;
        
      case 'execution_completed':
        const result = message.finalResult;
        onProgress(`Test suite completed: ${result.passedSteps}/${result.totalSteps} steps passed in ${result.totalTime}ms`, 
                  result.success ? 'success' : 'error');
        break;
        
      case 'execution_failed':
        onProgress(`Test execution failed: ${message.error}`, 'error');
        break;
        
      case 'execution_stopped':
        onProgress(`Test execution stopped: ${message.reason}`, 'warning');
        break;
    }
  }

  // Poll for execution completion
  async pollExecutionStatus(onProgress) {
    if (!this.executionId) {
      throw new Error('No execution ID available');
    }

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${this.serverUrl}/api/execution-status/${this.executionId}`);
          
          if (!response.ok) {
            clearInterval(pollInterval);
            reject(new Error(`Failed to get execution status: ${response.status}`));
            return;
          }

          const status = await response.json();
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            resolve(status.finalResult);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error(status.error || 'Execution failed'));
          }
          // Continue polling if still running
          
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 1000); // Poll every second

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Execution timeout'));
      }, 300000);
    });
  }

  stopExecution() {
    if (this.executionId) {
      fetch(`${this.serverUrl}/api/stop-execution/${this.executionId}`, {
        method: 'POST'
      }).catch(error => {
        console.error('Failed to stop execution:', error);
      });
    }
    this.isRunning = false;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      executionId: this.executionId,
      variables: this.variables
    };
  }

  // Fallback methods for when server is not available
  async executeApiStep(step, onProgress) {
    try {
      onProgress(`Executing API step: ${step.name}`, 'info');
      
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
          const credentials = btoa(`${step.config.auth.username}:${step.config.auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
      }

      const startTime = Date.now();
      const response = await fetch(url.toString(), {
        method: step.config.method,
        headers,
        body
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Extract response data
      const responseText = await response.text();
      let responseData = null;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Not JSON, use text
      }

      // Validate response
      let validationResults = [];
      if (step.config.validation) {
        if (step.config.validation.statusCode && response.status !== step.config.validation.statusCode) {
          validationResults.push(`Status code mismatch: expected ${step.config.validation.statusCode}, got ${response.status}`);
        }
        
        if (step.config.validation.responseTime && responseTime > step.config.validation.responseTime) {
          validationResults.push(`Response time too slow: ${responseTime}ms > ${step.config.validation.responseTime}ms`);
        }

        if (step.config.validation.jsonPath && responseData) {
          const value = this.extractValueFromJsonPath(responseData, step.config.validation.jsonPath);
          if (value !== step.config.validation.expectedValue) {
            validationResults.push(`JSON path validation failed: expected ${step.config.validation.expectedValue}, got ${value}`);
          }
        }
      }

      // Extract variables
      if (step.config.extractVariables && responseData) {
        Object.entries(step.config.extractVariables).forEach(([varName, jsonPath]) => {
          const value = this.extractValueFromJsonPath(responseData, jsonPath);
          this.variables[varName] = value;
          onProgress(`Extracted variable ${varName}: ${value}`, 'info');
        });
      }

      const isSuccess = validationResults.length === 0;
      onProgress(`API step completed: ${isSuccess ? 'PASS' : 'FAIL'} (${responseTime}ms)`, isSuccess ? 'success' : 'error');
      
      if (validationResults.length > 0) {
        validationResults.forEach(result => onProgress(`  - ${result}`, 'error'));
      }

      return {
        success: isSuccess,
        status: response.status,
        responseTime,
        responseData,
        validationResults
      };

    } catch (error) {
      onProgress(`API step failed: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractValueFromJsonPath(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
}

const testExecutor = new TestExecutor();
export default testExecutor;
