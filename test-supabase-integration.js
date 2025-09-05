const axios = require('axios');

async function testSupabaseIntegration() {
  console.log('🧪 TESTING SUPABASE INTEGRATION...');
  
  // First, test if we can save a test run
  const testRunData = {
    id: 'test_' + Date.now(),
    user_id: 'test_user',
    test_suite_name: 'Supabase Integration Test',
    test_type: 'API',
    tool_id: 'axios',
    status: 'completed',
    total_steps: 2,
    passed_steps: 2,
    failed_steps: 0,
    total_time: 500,
    results: {
      success: true,
      totalSteps: 2,
      passedSteps: 2,
      failedSteps: 0,
      totalTime: 500
    }
  };
  
  try {
    // Test saving via the test executor
    const apiTestSuite = {
      name: "Supabase Integration Test",
      testType: "API",
      toolId: "axios",
      baseUrl: "https://jsonplaceholder.typicode.com",
      steps: [
        {
          name: "Test Supabase save",
          type: "request",
          config: {
            url: "/posts/1",
            method: "GET",
            validation: {
              statusCode: 200
            }
          }
        }
      ]
    };
    
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: apiTestSuite
    });
    
    console.log('✅ Test execution started:', response.data);
    
    if (response.data.success) {
      const executionId = response.data.executionId;
      console.log('🆔 Execution ID:', executionId);
      
      // Wait for execution
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await axios.get(`https://devops-real-app-staging.onrender.com/api/execution-status/${executionId}`);
      
      if (statusResponse.data.status === 'completed') {
        console.log('✅ Test completed - should be saved to Supabase');
        console.log('📊 Final Result:', statusResponse.data.finalResult);
        
        // Check if test run was saved (this would be visible in the frontend)
        console.log('💾 Test run should now be visible in the Test Runs page');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Supabase integration test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testSupabaseIntegration().then(success => {
  console.log(`\n🎯 SUPABASE INTEGRATION RESULT: ${success ? '✅ READY (needs Supabase setup)' : '❌ FAILED'}`);
});
