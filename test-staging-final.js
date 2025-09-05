const axios = require('axios');

async function testStagingAPI() {
  console.log('🧪 Testing Staging API Execution...');
  
  const apiTestSuite = {
    name: "Staging API Test",
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
      },
      {
        name: "Get users",
        type: "request",
        config: {
          url: "/users/1",
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
    
    console.log('✅ Staging API test started successfully:', response.data);
    
    if (response.data.success) {
      const result = response.data.result;
      console.log('✅ STAGING API TEST COMPLETED!');
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
    }
  } catch (error) {
    console.error('❌ Staging API test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testStagingAPI().then(success => {
  console.log(`\n🎯 STAGING API TEST RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);
});
