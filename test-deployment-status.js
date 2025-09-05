const axios = require('axios');

async function testDeploymentStatus() {
  console.log('🔍 TESTING DEPLOYMENT STATUS');
  console.log('=' .repeat(50));
  
  const RENDER_URL = 'https://devops-real-app-staging.onrender.com';
  
  try {
    // Test health endpoint first
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${RENDER_URL}/api/health`, { timeout: 10000 });
    console.log(`✅ Health: ${healthResponse.status} - ${healthResponse.data.message}`);
    
    // Test with a very simple request to see the exact error
    console.log('\n2️⃣ Testing minimal request...');
    const testRequest = {
      testSuite: {
        name: 'Test',
        testType: 'API',
        toolId: 'axios',
        baseUrl: 'https://example.com',
        steps: [{
          id: '1',
          name: 'Test',
          type: 'get',
          config: { url: '/' }
        }]
      }
    };
    
    console.log('📤 Sending request...');
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, testRequest, { 
      timeout: 30000 
    });
    
    console.log(`✅ Success: ${response.status}`);
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.response) {
      console.log(`📊 Status: ${error.response.status}`);
      console.log(`📊 Data:`, JSON.stringify(error.response.data, null, 2));
      
      // Check if this is the same error or a different one
      if (error.response.data && error.response.data.error) {
        const errorMsg = error.response.data.error;
        console.log(`🔍 Error message: "${errorMsg}"`);
        
        if (errorMsg === 'stepStartTime is not defined') {
          console.log('🎯 SAME ERROR: Deployment not updated or code issue persists');
        } else {
          console.log('🎯 NEW ERROR: Different issue detected');
        }
      }
    }
  }
}

testDeploymentStatus().then(() => {
  console.log('\n🎯 DEPLOYMENT STATUS CHECK COMPLETE');
  process.exit(0);
});
