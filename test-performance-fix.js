const axios = require('axios');

async function testPerformanceFix() {
  try {
    console.log('🧪 Testing Performance Test Fix...');
    
    const performanceTestSuite = {
      name: "Performance Test Fix",
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
            duration: "10s",
            vus: 5
          }
        },
        {
          name: "Stress test users endpoint",
          type: "stress",
          config: {
            url: "/users",
            method: "GET",
            duration: "5s",
            vus: 3
          }
        }
      ]
    };
    
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: performanceTestSuite
    });
    
    console.log('✅ Performance test started:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
      console.log('📊 Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'completed') {
        console.log('✅ Performance test completed successfully!');
        console.log('📈 Results:', {
          success: statusResponse.data.finalResult?.success,
          totalSteps: statusResponse.data.finalResult?.totalSteps,
          passedSteps: statusResponse.data.finalResult?.passedSteps,
          failedSteps: statusResponse.data.finalResult?.failedSteps,
          totalTime: statusResponse.data.finalResult?.totalTime
        });
        
        // Show step details
        if (statusResponse.data.finalResult?.results) {
          console.log('📋 Step Details:');
          statusResponse.data.finalResult.results.forEach((step, index) => {
            console.log(`  Step ${index + 1}: ${step.stepName} - ${step.success ? 'PASS' : 'FAIL'} (${step.duration}ms)`);
            console.log(`    Message: ${step.message}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
  }
}

testPerformanceFix();
