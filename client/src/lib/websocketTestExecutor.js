// client/src/lib/websocketTestExecutor.js
class WebSocketTestExecutor {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isRunning = false;
    this.currentExecutionId = null;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  // Connect to WebSocket server
  connect() {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '5000');
        const wsUrl = `${protocol}//${host}:${port}`;
        
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnected = true;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
          this.isRunning = false;
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  // Handle incoming WebSocket messages
  handleMessage(data) {
    console.log('📨 WebSocket message received:', data.type);
    
    switch (data.type) {
      case 'connection_established':
        console.log('✅ Connection established:', data.message);
        break;
        
      case 'suite_start':
        this.isRunning = true;
        if (this.onProgress) {
          this.onProgress(`Starting test suite: ${data.suiteName}`, 'info');
          this.onProgress(`Total steps: ${data.totalSteps}`, 'info');
        }
        break;
        
      case 'step_prepare':
        if (this.onProgress) {
          this.onProgress(`Preparing step ${data.stepNumber}/${data.totalSteps}: ${data.stepName}`, 'info');
        }
        break;
        
      case 'step_start':
        if (this.onProgress) {
          this.onProgress(`Executing step ${data.stepNumber}: ${data.stepName} (${data.stepType})`, 'info');
          this.onProgress(data.message, 'info');
        }
        break;
        
      case 'step_progress':
        if (this.onProgress) {
          this.onProgress(data.message, 'info');
        }
        break;
        
      case 'step_complete':
        if (this.onProgress) {
          const status = data.result.success ? '✅ PASS' : '❌ FAIL';
          this.onProgress(`Step ${data.stepNumber} completed: ${status}`, data.result.success ? 'success' : 'error');
          this.onProgress(data.message, data.result.success ? 'success' : 'error');
        }
        break;
        
      case 'step_error':
        if (this.onProgress) {
          this.onProgress(`Step ${data.stepNumber} failed: ${data.message}`, 'error');
        }
        break;
        
      case 'suite_complete':
        this.isRunning = false;
        if (this.onProgress) {
          this.onProgress(`Test suite completed: ${data.result.passedSteps}/${data.result.totalSteps} steps passed`, 
            data.result.success ? 'success' : 'error');
        }
        if (this.onComplete) {
          this.onComplete(data.result);
        }
        break;
        
      case 'suite_error':
        this.isRunning = false;
        if (this.onProgress) {
          this.onProgress(`Test suite failed: ${data.message}`, 'error');
        }
        if (this.onError) {
          this.onError(new Error(data.message));
        }
        break;
        
      case 'execution_complete':
        this.isRunning = false;
        if (this.onComplete) {
          this.onComplete(data.result);
        }
        break;
        
      case 'execution_error':
        this.isRunning = false;
        if (this.onError) {
          this.onError(new Error(data.error));
        }
        break;
        
      case 'execution_stopped':
        this.isRunning = false;
        if (this.onProgress) {
          this.onProgress('Test execution stopped', 'warning');
        }
        break;
        
      case 'browser_init':
        if (this.onProgress) {
          this.onProgress(data.message, 'info');
        }
        break;
        
      case 'browser_ready':
        if (this.onProgress) {
          this.onProgress(data.message, 'success');
        }
        break;
        
      case 'browser_error':
        if (this.onProgress) {
          this.onProgress(data.message, 'error');
        }
        break;
        
      default:
        console.log('📨 Unknown message type:', data.type);
    }
  }

  // Execute test suite with real-time updates
  async executeTestSuite(testSuite, onProgress, onComplete, onError) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    if (!this.isConnected) {
      throw new Error('Failed to connect to test execution server');
    }
    
    this.isRunning = true;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;
    
    try {
      // Send test suite execution request
      this.ws.send(JSON.stringify({
        type: 'execute_test_suite',
        testSuite: testSuite
      }));
      
      console.log('🚀 Test suite execution request sent');
      
      // Return a promise that resolves when execution completes
      return new Promise((resolve, reject) => {
        this.onComplete = (result) => {
          resolve(result);
        };
        this.onError = (error) => {
          reject(error);
        };
      });
      
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  // Stop current execution
  stopExecution() {
    if (this.isConnected && this.isRunning) {
      this.ws.send(JSON.stringify({
        type: 'stop_execution'
      }));
      console.log('⏹️ Stop execution request sent');
    }
    this.isRunning = false;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isRunning = false;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isRunning: this.isRunning,
      currentExecutionId: this.currentExecutionId
    };
  }
}

// Create singleton instance
const websocketTestExecutor = new WebSocketTestExecutor();

export default websocketTestExecutor;
