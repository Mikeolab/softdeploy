// REAL-TIME UPDATES AND WEBSOCKET TESTING
// This tests all real-time functionality

console.log('⚡ REAL-TIME UPDATES AND WEBSOCKET TESTING STARTING...');

// Test 1: WebSocket Connection
console.log('\n📋 TEST 1: WebSocket Connection');
const testWebSocketConnection = () => {
  return new Promise((resolve) => {
    const wsUrl = 'ws://localhost:5000';
    let wsConnection = null;
    let connectionEstablished = false;
    
    try {
      wsConnection = new WebSocket(wsUrl);
      
      wsConnection.onopen = function(event) {
        console.log('✅ WebSocket connected successfully');
        connectionEstablished = true;
        resolve({ success: true, connection: wsConnection });
      };
      
      wsConnection.onerror = function(error) {
        console.log('❌ WebSocket connection error:', error);
        resolve({ success: false, error: error });
      };
      
      wsConnection.onclose = function(event) {
        console.log('✅ WebSocket closed:', event.code, event.reason);
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!connectionEstablished) {
          console.log('❌ WebSocket connection timeout');
          resolve({ success: false, error: 'Connection timeout' });
        }
      }, 5000);
      
    } catch (error) {
      console.log('❌ WebSocket creation failed:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
};

// Test 2: Real-time Test Execution
console.log('\n📋 TEST 2: Real-time Test Execution');
const testRealtimeExecution = (wsConnection) => {
  if (!wsConnection) {
    console.log('❌ No WebSocket connection - cannot test real-time execution');
    return;
  }
  
  const testExecutionMessages = [
    {
      type: 'test_execution_start',
      projectId: 'test-project-1',
      testSuite: 'API Tests',
      timestamp: Date.now()
    },
    {
      type: 'test_execution_progress',
      projectId: 'test-project-1',
      testSuite: 'API Tests',
      progress: 25,
      currentStep: 'Testing authentication endpoint',
      timestamp: Date.now()
    },
    {
      type: 'test_execution_progress',
      projectId: 'test-project-1',
      testSuite: 'API Tests',
      progress: 50,
      currentStep: 'Testing data validation',
      timestamp: Date.now()
    },
    {
      type: 'test_execution_progress',
      projectId: 'test-project-1',
      testSuite: 'API Tests',
      progress: 75,
      currentStep: 'Testing error handling',
      timestamp: Date.now()
    },
    {
      type: 'test_execution_complete',
      projectId: 'test-project-1',
      testSuite: 'API Tests',
      success: true,
      totalSteps: 4,
      passedSteps: 4,
      failedSteps: 0,
      totalTime: 2500,
      timestamp: Date.now()
    }
  ];
  
  console.log('✅ Sending test execution messages...');
  
  testExecutionMessages.forEach((message, index) => {
    setTimeout(() => {
      wsConnection.send(JSON.stringify(message));
      console.log(`✅ Message ${index + 1} sent: ${message.type}`);
    }, index * 500); // Send every 500ms
  });
  
  return testExecutionMessages;
};

// Test 3: Multiple Project Updates
console.log('\n📋 TEST 3: Multiple Project Updates');
const testMultipleProjectUpdates = (wsConnection) => {
  if (!wsConnection) {
    console.log('❌ No WebSocket connection - cannot test multiple project updates');
    return;
  }
  
  const projects = [
    { id: 'project-1', name: 'E-commerce' },
    { id: 'project-2', name: 'TestLab' },
    { id: 'project-3', name: 'NewProject' }
  ];
  
  projects.forEach((project, projectIndex) => {
    setTimeout(() => {
      const updateMessage = {
        type: 'project_update',
        projectId: project.id,
        projectName: project.name,
        updateType: 'test_run_completed',
        testRun: {
          id: `run-${project.id}-${Date.now()}`,
          testSuite: 'API Tests',
          success: Math.random() > 0.3,
          totalSteps: Math.floor(Math.random() * 8) + 2,
          totalTime: Math.floor(Math.random() * 3000) + 500
        },
        timestamp: Date.now()
      };
      
      wsConnection.send(JSON.stringify(updateMessage));
      console.log(`✅ Project update sent for ${project.name}`);
    }, projectIndex * 1000); // Send every 1 second
  });
  
  return projects;
};

// Test 4: WebSocket Message Handling
console.log('\n📋 TEST 4: WebSocket Message Handling');
const testMessageHandling = (wsConnection) => {
  if (!wsConnection) {
    console.log('❌ No WebSocket connection - cannot test message handling');
    return;
  }
  
  let messageCount = 0;
  const messageTypes = new Set();
  
  wsConnection.onmessage = function(event) {
    messageCount++;
    try {
      const data = JSON.parse(event.data);
      messageTypes.add(data.type);
      console.log(`✅ Message ${messageCount} received: ${data.type}`);
      
      // Handle different message types
      switch (data.type) {
        case 'test_execution_start':
          console.log(`   📋 Test execution started for ${data.testSuite}`);
          break;
        case 'test_execution_progress':
          console.log(`   📊 Progress: ${data.progress}% - ${data.currentStep}`);
          break;
        case 'test_execution_complete':
          console.log(`   ✅ Test completed: ${data.success ? 'PASSED' : 'FAILED'}`);
          break;
        case 'project_update':
          console.log(`   🔄 Project update: ${data.projectName}`);
          break;
        default:
          console.log(`   ❓ Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.log(`❌ Error parsing message ${messageCount}:`, error.message);
    }
  };
  
  return { messageCount, messageTypes };
};

// Test 5: Connection Resilience
console.log('\n📋 TEST 5: Connection Resilience');
const testConnectionResilience = () => {
  const wsUrl = 'ws://localhost:5000';
  let connectionAttempts = 0;
  const maxAttempts = 3;
  
  const attemptConnection = () => {
    connectionAttempts++;
    console.log(`🔄 Connection attempt ${connectionAttempts}/${maxAttempts}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = function() {
        console.log(`✅ Connection attempt ${connectionAttempts} successful`);
        ws.close();
      };
      
      ws.onerror = function(error) {
        console.log(`❌ Connection attempt ${connectionAttempts} failed`);
        
        if (connectionAttempts < maxAttempts) {
          setTimeout(attemptConnection, 1000); // Retry after 1 second
        } else {
          console.log('❌ All connection attempts failed');
        }
      };
      
    } catch (error) {
      console.log(`❌ Connection attempt ${connectionAttempts} error:`, error.message);
      
      if (connectionAttempts < maxAttempts) {
        setTimeout(attemptConnection, 1000);
      }
    }
  };
  
  attemptConnection();
};

// Test 6: Performance Under Load
console.log('\n📋 TEST 6: Performance Under Load');
const testPerformanceUnderLoad = (wsConnection) => {
  if (!wsConnection) {
    console.log('❌ No WebSocket connection - cannot test performance');
    return;
  }
  
  const startTime = performance.now();
  const messageCount = 100;
  
  console.log(`✅ Sending ${messageCount} messages rapidly...`);
  
  for (let i = 0; i < messageCount; i++) {
    const message = {
      type: 'performance_test',
      messageId: i,
      timestamp: Date.now(),
      data: `Test message ${i}`
    };
    
    wsConnection.send(JSON.stringify(message));
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ Sent ${messageCount} messages in ${Math.round(duration)}ms`);
  console.log(`✅ Average: ${Math.round(duration / messageCount)}ms per message`);
  
  return { messageCount, duration };
};

// Test 7: Error Handling
console.log('\n📋 TEST 7: Error Handling');
const testErrorHandling = (wsConnection) => {
  if (!wsConnection) {
    console.log('❌ No WebSocket connection - cannot test error handling');
    return;
  }
  
  const errorTests = [
    {
      name: 'Invalid JSON',
      message: 'invalid-json-message'
    },
    {
      name: 'Missing required fields',
      message: JSON.stringify({ type: 'test_execution_start' }) // Missing projectId
    },
    {
      name: 'Invalid message type',
      message: JSON.stringify({ type: 'invalid_type', data: 'test' })
    },
    {
      name: 'Oversized message',
      message: JSON.stringify({ type: 'large_message', data: 'x'.repeat(10000) })
    }
  ];
  
  errorTests.forEach((test, index) => {
    setTimeout(() => {
      try {
        wsConnection.send(test.message);
        console.log(`✅ Error test ${index + 1} sent: ${test.name}`);
      } catch (error) {
        console.log(`❌ Error test ${index + 1} failed: ${test.name} - ${error.message}`);
      }
    }, index * 200);
  });
  
  return errorTests;
};

// Run all real-time tests
const runRealtimeTests = async () => {
  console.log('🚀 Starting real-time updates and WebSocket tests...');
  
  // Test 1: WebSocket Connection
  const connectionResult = await testWebSocketConnection();
  
  if (!connectionResult.success) {
    console.log('❌ WebSocket connection failed - cannot run real-time tests');
    return;
  }
  
  const wsConnection = connectionResult.connection;
  
  // Test 2: Real-time Test Execution
  const executionMessages = testRealtimeExecution(wsConnection);
  
  // Test 3: Multiple Project Updates
  const projectUpdates = testMultipleProjectUpdates(wsConnection);
  
  // Test 4: Message Handling
  const messageHandling = testMessageHandling(wsConnection);
  
  // Test 5: Connection Resilience
  testConnectionResilience();
  
  // Test 6: Performance Under Load
  const performanceTest = testPerformanceUnderLoad(wsConnection);
  
  // Test 7: Error Handling
  const errorTests = testErrorHandling(wsConnection);
  
  // Wait for all tests to complete
  setTimeout(() => {
    // Summary
    console.log('\n🎉 REAL-TIME UPDATES AND WEBSOCKET TESTING COMPLETED!');
    console.log('📊 Real-time Test Summary:');
    console.log(`✅ WebSocket connection: ${connectionResult.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Test execution messages: ${executionMessages?.length || 0}`);
    console.log(`✅ Project updates: ${projectUpdates?.length || 0}`);
    console.log(`✅ Messages received: ${messageHandling?.messageCount || 0}`);
    console.log(`✅ Performance test: ${performanceTest?.messageCount || 0} messages`);
    console.log(`✅ Error handling tests: ${errorTests?.length || 0}`);
    
    // Close connection
    if (wsConnection) {
      wsConnection.close();
      console.log('✅ WebSocket connection closed');
    }
    
    console.log('\n🔄 REFRESH THE PAGE TO SEE REAL-TIME UPDATES!');
  }, 10000); // Wait 10 seconds for all tests
};

// Start the test
runRealtimeTests();
