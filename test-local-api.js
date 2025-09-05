const axios = require('axios');

async function testLocalAPI() {
  console.log('🧪 Testing Local API Execution...');
  
  const apiTestSuite = {
    name: "Local API Test",
    testType: "API",
    toolId: "axios",
    baseUrl: "https://jsonplaceholder.typicode.com",
    steps: [
      {
        name: "Get posts",
        type: "request",
        config: {
          url: "/posts/1",
          method: "GET",
          validation: {
            statusCode: 200,
            responseTime: 5000
          }
        }
      }
    ]
  };
  
  try {
    const response = await axios.post('http://localhost:3001/api/execute-test-suite', {
      testSuite: apiTestSuite
    });
    
    console.log('✅ Local API test started successfully:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      console.log('⏳ Waiting for execution to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await axios.get(`http://localhost:3001/api/execution-status/${executionId}`);
      console.log('📊 Final Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'completed') {
        const result = statusResponse.data.finalResult;
        console.log('✅ LOCAL API TEST COMPLETED!');
        console.log('📈 Results:', {
          success: result?.success,
          totalSteps: result?.totalSteps,
          passedSteps: result?.passedSteps,
          failedSteps: result?.failedSteps,
          totalTime: result?.totalTime
        });
        
        return result?.success;
      } else {
        console.log('❌ Local API test did not complete');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Local API test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testLocalAPI().then(success => {
  console.log(`\n🎯 LOCAL API TEST RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);
});