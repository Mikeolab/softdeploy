const axios = require('axios');

async function debugSpecificError() {
  console.log('🔍 DEBUGGING SPECIFIC ERROR - DETAILED ANALYSIS');
  console.log('=' .repeat(70));
  
  const RENDER_URL = 'https://devops-real-app-staging.onrender.com';
  
  try {
    // Test with minimal API test suite
    const minimalTestSuite = {
      name: 'Minimal API Test',
      testType: 'API',
      toolId: 'axios',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      steps: [
        {
          id: 'step1',
          name: 'Simple GET',
          type: 'get',
          config: {
            url: '/posts/1'
          }
        }
      ]
    };
    
    console.log('📤 Sending minimal test suite...');
    console.log('📋 Test suite:', JSON.stringify(minimalTestSuite, null, 2));
    
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, {
      testSuite: minimalTestSuite
    }, { 
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`❌ Error occurred: ${error.message}`);
    
    if (error.response) {
      console.log(`📊 Error status: ${error.response.status}`);
      console.log(`📊 Error data:`, JSON.stringify(error.response.data, null, 2));
      
      // Check if it's a different error than stepStartTime
      if (error.response.data && error.response.data.error) {
        const errorMsg = error.response.data.error;
        console.log(`🔍 Error message: "${errorMsg}"`);
        
        if (errorMsg.includes('test suite')) {
          console.log('🎯 ISSUE: Test suite validation error');
        } else if (errorMsg.includes('stepStartTime')) {
          console.log('🎯 ISSUE: Variable scope error');
        } else if (errorMsg.includes('not defined')) {
          console.log('🎯 ISSUE: Variable not defined');
        } else {
          console.log('🎯 ISSUE: Unknown error type');
        }
      }
    } else if (error.request) {
      console.log('📊 No response received:', error.request);
    } else {
      console.log('📊 Request setup error:', error.message);
    }
  }
}

debugSpecificError().then(() => {
  console.log('\n🎯 DEBUG COMPLETE');
  process.exit(0);
});
