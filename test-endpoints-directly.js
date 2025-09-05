const axios = require('axios');

async function testEndpointsDirectly() {
  console.log('🧪 TESTING ENDPOINTS DIRECTLY - BYPASSING UI ISSUES');
  console.log('=' .repeat(70));
  
  const RENDER_URL = 'https://devops-real-app-staging.onrender.com';
  let allTestsPassed = true;
  let testResults = [];
  
  // Test 1: Health Check
  console.log('\n1️⃣ TESTING HEALTH CHECK ENDPOINT');
  try {
    const response = await axios.get(`${RENDER_URL}/api/health`, { timeout: 10000 });
    console.log(`✅ Health check: ${response.status} - ${response.data.message}`);
    testResults.push({ test: 'Health Check', status: 'PASSED', details: response.data });
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    testResults.push({ test: 'Health Check', status: 'FAILED', error: error.message });
    allTestsPassed = false;
  }
  
  // Test 2: API Test Suite
  console.log('\n2️⃣ TESTING API TEST SUITE ENDPOINT');
  try {
    const apiTestSuite = {
      name: 'Direct API Test Suite',
      description: 'Testing API endpoints directly',
      testType: 'API',
      toolCategory: 'internal',
      toolId: 'axios',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      steps: [
        {
          id: 'step1',
          name: 'Get Posts',
          type: 'get',
          config: {
            url: '/posts',
            headers: {},
            validation: {
              statusCode: 200,
              responseTime: 5000
            }
          }
        },
        {
          id: 'step2',
          name: 'Get Single Post',
          type: 'get',
          config: {
            url: '/posts/1',
            headers: {},
            validation: {
              statusCode: 200,
              responseTime: 5000
            }
          }
        }
      ]
    };
    
    console.log('📤 Sending API test suite...');
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, {
      testSuite: apiTestSuite
    }, { timeout: 30000 });
    
    console.log(`✅ API test suite response: ${response.status}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ API test suite executed successfully');
      testResults.push({ test: 'API Test Suite', status: 'PASSED', details: response.data });
    } else {
      console.log('❌ API test suite failed');
      testResults.push({ test: 'API Test Suite', status: 'FAILED', details: response.data });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ API test suite failed: ${error.message}`);
    if (error.response) {
      console.log(`📊 Error response:`, JSON.stringify(error.response.data, null, 2));
    }
    testResults.push({ test: 'API Test Suite', status: 'FAILED', error: error.message });
    allTestsPassed = false;
  }
  
  // Test 3: Functional Test Suite
  console.log('\n3️⃣ TESTING FUNCTIONAL TEST SUITE ENDPOINT');
  try {
    const functionalTestSuite = {
      name: 'Direct Functional Test Suite',
      description: 'Testing functional endpoints directly',
      testType: 'Functional',
      toolCategory: 'internal',
      toolId: 'puppeteer',
      baseUrl: 'https://example.com',
      steps: [
        {
          id: 'step1',
          name: 'Navigate to Example',
          type: 'navigate',
          config: {
            url: 'https://example.com'
          }
        },
        {
          id: 'step2',
          name: 'Check Title',
          type: 'assert',
          config: {
            selector: 'h1',
            assertion: 'visible'
          }
        }
      ]
    };
    
    console.log('📤 Sending functional test suite...');
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, {
      testSuite: functionalTestSuite
    }, { timeout: 60000 }); // Longer timeout for functional tests
    
    console.log(`✅ Functional test suite response: ${response.status}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Functional test suite executed successfully');
      testResults.push({ test: 'Functional Test Suite', status: 'PASSED', details: response.data });
    } else {
      console.log('❌ Functional test suite failed');
      testResults.push({ test: 'Functional Test Suite', status: 'FAILED', details: response.data });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ Functional test suite failed: ${error.message}`);
    if (error.response) {
      console.log(`📊 Error response:`, JSON.stringify(error.response.data, null, 2));
    }
    testResults.push({ test: 'Functional Test Suite', status: 'FAILED', error: error.message });
    allTestsPassed = false;
  }
  
  // Test 4: Performance Test Suite
  console.log('\n4️⃣ TESTING PERFORMANCE TEST SUITE ENDPOINT');
  try {
    const performanceTestSuite = {
      name: 'Direct Performance Test Suite',
      description: 'Testing performance endpoints directly',
      testType: 'Performance',
      toolCategory: 'internal',
      toolId: 'k6',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      steps: [
        {
          id: 'step1',
          name: 'Load Test',
          type: 'loadTest',
          config: {
            duration: 10, // 10 seconds
            users: 5,
            url: '/posts'
          }
        }
      ]
    };
    
    console.log('📤 Sending performance test suite...');
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, {
      testSuite: performanceTestSuite
    }, { timeout: 45000 }); // Longer timeout for performance tests
    
    console.log(`✅ Performance test suite response: ${response.status}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Performance test suite executed successfully');
      testResults.push({ test: 'Performance Test Suite', status: 'PASSED', details: response.data });
    } else {
      console.log('❌ Performance test suite failed');
      testResults.push({ test: 'Performance Test Suite', status: 'FAILED', details: response.data });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ Performance test suite failed: ${error.message}`);
    if (error.response) {
      console.log(`📊 Error response:`, JSON.stringify(error.response.data, null, 2));
    }
    testResults.push({ test: 'Performance Test Suite', status: 'FAILED', error: error.message });
    allTestsPassed = false;
  }
  
  // Test 5: Invalid Test Suite (Error Handling)
  console.log('\n5️⃣ TESTING ERROR HANDLING');
  try {
    const invalidTestSuite = {
      name: 'Invalid Test Suite',
      // Missing required fields
      testType: 'InvalidType',
      steps: []
    };
    
    console.log('📤 Sending invalid test suite...');
    const response = await axios.post(`${RENDER_URL}/api/execute-test-suite`, {
      testSuite: invalidTestSuite
    }, { timeout: 10000 });
    
    console.log(`✅ Invalid test suite response: ${response.status}`);
    console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));
    
    if (!response.data.success && response.status === 400) {
      console.log('✅ Error handling working correctly');
      testResults.push({ test: 'Error Handling', status: 'PASSED', details: response.data });
    } else {
      console.log('❌ Error handling not working');
      testResults.push({ test: 'Error Handling', status: 'FAILED', details: response.data });
      allTestsPassed = false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`✅ Error handling working correctly: ${error.response.status}`);
      testResults.push({ test: 'Error Handling', status: 'PASSED', details: error.response.data });
    } else {
      console.log(`❌ Error handling failed: ${error.message}`);
      testResults.push({ test: 'Error Handling', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 ENDPOINT TEST RESULTS');
  console.log('=' .repeat(70));
  
  testResults.forEach((result, index) => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    const details = result.details ? ` - ${JSON.stringify(result.details).substring(0, 100)}...` : '';
    const error = result.error ? ` - ${result.error}` : '';
    console.log(`${index + 1}. ${status} ${result.test}${details}${error}`);
  });
  
  console.log('\n' + '=' .repeat(70));
  console.log(`🎯 ENDPOINT TEST RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('=' .repeat(70));
  
  if (allTestsPassed) {
    console.log('\n🚀 ALL ENDPOINTS WORKING!');
    console.log('✅ API tests working');
    console.log('✅ Functional tests working');
    console.log('✅ Performance tests working');
    console.log('✅ Error handling working');
    console.log('✅ Server is functioning correctly');
    console.log('\n📋 CONCLUSION:');
    console.log('The server endpoints are working correctly. The UI issues are likely:');
    console.log('1. Authentication problems');
    console.log('2. Frontend-backend communication issues');
    console.log('3. Client-side JavaScript errors');
    console.log('4. Network/CORS issues');
  } else {
    console.log('\n⚠️ ENDPOINT ISSUES DETECTED');
    console.log('❌ Some endpoints failed - check above for details');
    console.log('🔧 Server-side issues need debugging');
  }
  
  return allTestsPassed;
}

testEndpointsDirectly().then(success => {
  console.log(`\n🎯 FINAL ENDPOINT TEST RESULT: ${success ? '✅ ALL ENDPOINTS WORKING - SERVER IS FUNCTIONAL' : '❌ ENDPOINT ISSUES REMAIN - NEEDS DEBUGGING'}`);
  process.exit(success ? 0 : 1);
});
