const axios = require('axios');

async function testPerformanceFix() {
  console.log('🧪 TESTING PERFORMANCE TEST FIX...');
  
  const performanceTestSuite = {
    name: "Performance Test Verification",
    testType: "Performance",
    toolId: "k6",
    baseUrl: "https://jsonplaceholder.typicode.com",
    steps: [
      {
        name: "Load test posts endpoint",
        type: "load",
        config: {
          url: "/posts",
          method: "GET",
          duration: "5s",
          vus: 3
        }
      },
      {
        name: "Stress test users endpoint", 
        type: "stress",
        config: {
          url: "/users",
          method: "GET",
          duration: "3s",
          vus: 2
        }
      }
    ]
  };
  
  try {
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: performanceTestSuite
    });
    
    console.log('✅ Performance test started successfully:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      console.log('⏳ Waiting for execution to complete...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
      console.log('📊 Final Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'completed') {
        const result = statusResponse.data.finalResult;
        console.log('✅ PERFORMANCE TEST COMPLETED SUCCESSFULLY!');
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
        console.log('❌ Performance test did not complete');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testPerformanceFix().then(success => {
  console.log(`\n🎯 PERFORMANCE TEST RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);
});
