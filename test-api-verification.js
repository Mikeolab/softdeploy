const axios = require('axios');

async function testAPIFix() {
  console.log('🧪 TESTING API TEST FIX...');
  
  const apiTestSuite = {
    name: "API Test Verification",
    testType: "API",
    toolId: "axios",
    baseUrl: "https://jsonplaceholder.typicode.com",
    steps: [
      {
        name: "Get posts",
        type: "request",
        config: {
          url: "/posts",
          method: "GET",
          validation: {
            statusCode: 200,
            responseTime: 5000
          }
        }
      },
      {
        name: "Get single post",
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
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: apiTestSuite
    });
    
    console.log('✅ API test started successfully:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      console.log('⏳ Waiting for execution to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
      console.log('📊 Final Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'completed') {
        const result = statusResponse.data.finalResult;
        console.log('✅ API TEST COMPLETED!');
        console.log('📈 Results:', {
          success: result?.success,
          totalSteps: result?.totalSteps,
          passedSteps: result?.passedSteps,
          failedSteps: result?.failedSteps,
          totalTime: result?.totalTime
        });
        
        // Check step details
        if (result?.results) {
          console.log('📋 Step Details:');
          result.results.forEach((step, index) => {
            console.log(`  Step ${index + 1}: ${step.stepName} - ${step.success ? '✅ PASS' : '❌ FAIL'} (${step.duration}ms)`);
            console.log(`    Message: ${step.message}`);
          });
        }
        
        return result?.success;
      } else {
        console.log('❌ API test did not complete');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testAPIFix().then(success => {
  console.log(`\n🎯 API TEST RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);
});
