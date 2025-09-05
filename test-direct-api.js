const axios = require('axios');

async function testDirectAPI() {
  try {
    console.log('🧪 Testing direct API call...');
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts', { timeout: 5000 });
    console.log('✅ Direct API call successful:', response.status);
    console.log('📊 Response data length:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ Direct API call failed:', error.message);
    return false;
  }
}

testDirectAPI();
