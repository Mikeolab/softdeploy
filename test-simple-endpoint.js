// test-simple-endpoint.js
const axios = require('axios');

async function testSimpleEndpoint() {
  console.log('🔍 TESTING SIMPLE ENDPOINT');
  console.log('======================================================================');
  
  const baseUrl = 'https://devops-real-app-staging.onrender.com';
  
  try {
    // Test with shorter timeout
    console.log('1️⃣ Testing with 5 second timeout...');
    const response = await axios.get(`${baseUrl}/api/health`, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('✅ Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Failed:', error.message);
    
    // Test if it's a CORS issue
    console.log('\n2️⃣ Testing with different method...');
    try {
      const response = await axios.get(`${baseUrl}/`, { timeout: 5000 });
      console.log('✅ Root endpoint works:', response.status);
    } catch (error2) {
      console.log('❌ Root endpoint failed:', error2.message);
    }
  }
  
  console.log('\n======================================================================');
  console.log('🎯 SIMPLE ENDPOINT TEST COMPLETED');
  console.log('======================================================================');
}

testSimpleEndpoint().catch(console.error);
