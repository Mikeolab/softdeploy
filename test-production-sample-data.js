const axios = require('axios');

async function testProductionEndpoints() {
  console.log('🚀 TESTING PRODUCTION ENDPOINTS WITH SAMPLE DATA');
  console.log('======================================================================');
  
  const baseUrl = 'https://devops-real-app-staging.onrender.com';
  
  // Sample test configurations from our guide
  const sampleTests = {
    apiTest: {
      name: "Tcall.ai Login Test",
      description: "Test user login functionality",
      testType: "API",
      toolId: "axios",
      baseUrl: "https://api.tcall.ai",
      steps: [
        {
          name: "Login Test",
          type: "api",
          description: "Test user login",
          config: {
            method: "POST",
            url: "/auth/login",
            headers: {"Content-Type": "application/json"},
            body: {"email": "test@example.com", "password": "testpassword123"},
            validation: {"statusCode": 200, "responseTime": 2000}
          }
        }
      ]
    },
    
    functionalTest: {
      name: "Google Search Test",
      description: "Test Google search functionality",
      testType: "Functional",
      toolId: "puppeteer",
      baseUrl: "https://www.google.com",
      steps: [
        {
          name: "Search Test",
          type: "interaction",
          description: "Search for SoftDeploy",
          config: {
            selector: "input[name='q']",
            action: "type",
            value: "SoftDeploy testing platform"
          }
        }
      ]
    },
    
    performanceTest: {
      name: "API Load Test",
      description: "Load testing API endpoints",
      testType: "Performance",
      toolId: "inbuilt",
      baseUrl: "https://jsonplaceholder.typicode.com",
      steps: [
        {
          name: "Load Test",
          type: "loadTest",
          description: "Test posts endpoint under load",
          config: {
            url: "/posts",
            method: "GET",
            duration: "10s",
            users: 5,
            rampUpTime: 2
          }
        }
      ]
    }
  };
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ TESTING HEALTH CHECK');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`, { timeout: 10000 });
      console.log('✅ Health check successful:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: API Test Suite
    console.log('\n2️⃣ TESTING API TEST SUITE');
    try {
      const apiResponse = await axios.post(`${baseUrl}/api/execute-test-suite`, {
        testSuite: sampleTests.apiTest
      }, { timeout: 30000 });
      
      console.log('✅ API test suite response:', apiResponse.status);
      console.log('📊 API test result:', {
        success: apiResponse.data.success,
        totalSteps: apiResponse.data.totalSteps,
        passedSteps: apiResponse.data.passedSteps,
        failedSteps: apiResponse.data.failedSteps,
        totalTime: apiResponse.data.totalTime
      });
      
      if (apiResponse.data.results) {
        console.log('📋 Step results:');
        apiResponse.data.results.forEach((result, index) => {
          console.log(`   Step ${index + 1}: ${result.stepName} - ${result.success ? '✅ PASS' : '❌ FAIL'}`);
        });
      }
    } catch (error) {
      console.log('❌ API test suite failed:', error.message);
    }
    
    // Test 3: Functional Test Suite
    console.log('\n3️⃣ TESTING FUNCTIONAL TEST SUITE');
    try {
      const functionalResponse = await axios.post(`${baseUrl}/api/execute-test-suite`, {
        testSuite: sampleTests.functionalTest
      }, { timeout: 60000 });
      
      console.log('✅ Functional test suite response:', functionalResponse.status);
      console.log('📊 Functional test result:', {
        success: functionalResponse.data.success,
        totalSteps: functionalResponse.data.totalSteps,
        passedSteps: functionalResponse.data.passedSteps,
        failedSteps: functionalResponse.data.failedSteps,
        totalTime: functionalResponse.data.totalTime
      });
      
      if (functionalResponse.data.results) {
        console.log('📋 Step results:');
        functionalResponse.data.results.forEach((result, index) => {
          console.log(`   Step ${index + 1}: ${result.stepName} - ${result.success ? '✅ PASS' : '❌ FAIL'}`);
        });
      }
    } catch (error) {
      console.log('❌ Functional test suite failed:', error.message);
    }
    
    // Test 4: Performance Test Suite
    console.log('\n4️⃣ TESTING PERFORMANCE TEST SUITE');
    try {
      const performanceResponse = await axios.post(`${baseUrl}/api/execute-test-suite`, {
        testSuite: sampleTests.performanceTest
      }, { timeout: 45000 });
      
      console.log('✅ Performance test suite response:', performanceResponse.status);
      console.log('📊 Performance test result:', {
        success: performanceResponse.data.success,
        totalSteps: performanceResponse.data.totalSteps,
        passedSteps: performanceResponse.data.passedSteps,
        failedSteps: performanceResponse.data.failedSteps,
        totalTime: performanceResponse.data.totalTime
      });
      
      if (performanceResponse.data.results) {
        console.log('📋 Step results:');
        performanceResponse.data.results.forEach((result, index) => {
          console.log(`   Step ${index + 1}: ${result.stepName} - ${result.success ? '✅ PASS' : '❌ FAIL'}`);
          if (result.message) {
            console.log(`   Message: ${result.message}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Performance test suite failed:', error.message);
    }
    
    // Test 5: Error Handling
    console.log('\n5️⃣ TESTING ERROR HANDLING');
    try {
      const errorResponse = await axios.post(`${baseUrl}/api/execute-test-suite`, {
        testSuite: {
          name: "Invalid Test",
          testType: "InvalidType",
          steps: []
        }
      }, { timeout: 10000 });
      
      console.log('❌ Error handling failed - should have returned error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling working correctly:', error.response.status);
        console.log('📊 Error response:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n======================================================================');
    console.log('🎯 PRODUCTION ENDPOINT TEST COMPLETED');
    console.log('======================================================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionEndpoints().catch(console.error);
