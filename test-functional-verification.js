const axios = require('axios');

async function testFunctionalFix() {
  console.log('🧪 TESTING FUNCTIONAL TEST FIX...');
  
  const functionalTestSuite = {
    name: "Functional Test Verification",
    testType: "Functional",
    toolId: "puppeteer",
    baseUrl: "https://www.google.com",
    steps: [
      {
        name: "Navigate to Google",
        type: "navigation",
        config: {
          url: "https://www.google.com"
        }
      },
      {
        name: "Search for 'test automation'",
        type: "interaction",
        config: {
          selector: "input[name='q'], textarea[name='q'], input[title='Search'], input[aria-label*='Search'], .gLFyf",
          action: "type",
          value: "test automation"
        }
      }
    ]
  };
  
  try {
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: functionalTestSuite
    });
    
    console.log('✅ Functional test started successfully:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      console.log('⏳ Waiting for execution to complete...');
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
      console.log('📊 Final Status:', statusResponse.data.status);
      
      if (statusResponse.data.status === 'completed') {
        const result = statusResponse.data.finalResult;
        console.log('✅ FUNCTIONAL TEST COMPLETED!');
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
        console.log('❌ Functional test did not complete');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Functional test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testFunctionalFix().then(success => {
  console.log(`\n🎯 FUNCTIONAL TEST RESULT: ${success ? '✅ PASSED' : '❌ FAILED'}`);
});
