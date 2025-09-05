const axios = require('axios');

async function testSupabaseTable() {
  console.log('🧪 Testing Supabase Table Integration...');
  
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
  
  try {
    console.log('📤 Sending test to staging server...');
    const response = await axios.post('https://devops-real-app-staging.onrender.com/api/execute-test-suite', {
      testSuite: apiTestSuite
    });
    
    console.log('✅ Test execution response:', response.data);
    
    if (response.data.success) {
      const result = response.data.finalResult;
      console.log('📊 Test Results:', {
        success: result?.success,
        totalSteps: result?.totalSteps,
        passedSteps: result?.passedSteps,
        failedSteps: result?.failedSteps,
        totalTime: result?.totalTime
      });
      
      console.log('💾 Test run should now be saved to Supabase');
      console.log('🔍 Check your Supabase dashboard to see if the test run was saved');
      
      return true;
    }
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
    return false;
  }
}

testSupabaseTable().then(success => {
  console.log(`\n🎯 SUPABASE TABLE TEST RESULT: ${success ? '✅ READY FOR TESTING' : '❌ FAILED'}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Run the SQL script in Supabase dashboard');
  console.log('2. Check if test runs appear in the test_runs table');
  console.log('3. Verify the Test Runs page shows saved results');
});
