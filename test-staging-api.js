const axios = require('axios');

async function testStagingAPI() {
  console.log('🧪 Testing staging API directly...');
  
  try {
    // Test 1: Health check
    console.log('📊 Testing health endpoint...');
    const healthResponse = await axios.get('https://devops-real-app-staging.onrender.com/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: API test execution
    console.log('🚀 Testing API execution...');
    const testSuite = {
      name: "Direct API Test",
      testType: "API",
      toolId: "axios",
      baseUrl: "https://jsonplaceholder.typicode.com",
      steps: [
        {
          name: "Get posts",
          action: "GET",
          url: "/posts/1",
          headers: { "Content-Type": "application/json" },
          expectedStatus: 200
        }
      ]
    };
    
    const executionResponse = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite
    });
    
    console.log('✅ Test execution started:', executionResponse.data);
    
    if (executionResponse.data.success) {
      const executionId = executionResponse.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution to complete
      console.log('⏳ Waiting for execution to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check execution status
      try {
        const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
        console.log('📊 Execution status:', statusResponse.data);
        
        if (statusResponse.data.status === 'completed') {
          console.log('✅ Test execution completed successfully!');
          console.log('📈 Results:', {
            success: statusResponse.data.finalResult?.success,
            totalSteps: statusResponse.data.finalResult?.totalSteps,
            passedSteps: statusResponse.data.finalResult?.passedSteps,
            failedSteps: statusResponse.data.finalResult?.failedSteps,
            totalTime: statusResponse.data.finalResult?.totalTime
          });
        } else {
          console.log('⚠️ Test execution status:', statusResponse.data.status);
        }
      } catch (statusError) {
        console.error('❌ Error getting execution status:', statusError.message);
        if (statusError.response) {
          console.error('Status error response:', statusError.response.status, statusError.response.data);
        }
      }
    } else {
      console.log('❌ Test execution failed to start');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
  }
}

// Run the API test
testStagingAPI().catch(console.error);
