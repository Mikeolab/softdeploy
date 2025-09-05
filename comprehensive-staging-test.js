const { chromium } = require('playwright');

async function comprehensiveStagingTest() {
  console.log('🚀 Starting comprehensive staging test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🚨 Browser Console Error:', msg.text());
    }
  });
  
  // Monitor network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('execute-test-suite') || request.url().includes('exec_')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('execute-test-suite') || response.url().includes('exec_')) {
      console.log(`📡 Response: ${response.status()} - ${response.url()}`);
      if (response.status() >= 400) {
        console.log(`❌ Error response: ${response.status()} - ${response.url()}`);
      }
    }
  });
  
  try {
    // Step 1: Navigate to staging
    console.log('📱 Navigating to staging...');
    await page.goto('https://devops-real-app-staging.onrender.com/test-management/ce3e97ce-3508-4778-933d-fb285269dc10');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Look for User Stories tab
    console.log('🔍 Looking for User Stories tab...');
    const userStoriesTab = page.locator('text=User Stories').first();
    if (await userStoriesTab.isVisible()) {
      await userStoriesTab.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ User Stories tab clicked');
    }
    
    // Step 3: Look for sample tests
    console.log('🎯 Looking for sample tests...');
    await page.waitForTimeout(2000);
    
    // Check if we can find any test configuration elements
    const testNameInput = page.locator('input[placeholder*="name" i], input[name="name"]').first();
    const testTypeSelect = page.locator('select').first();
    const toolSelect = page.locator('select').nth(1);
    
    if (await testNameInput.isVisible()) {
      console.log('✅ Test configuration form found');
      
      // Step 4: Configure a simple API test manually
      console.log('⚙️ Configuring API test...');
      
      // Fill test name
      await testNameInput.fill('Automated Test');
      
      // Select test type
      if (await testTypeSelect.isVisible()) {
        await testTypeSelect.selectOption('API');
        console.log('✅ Test type set to API');
      }
      
      // Select tool
      if (await toolSelect.isVisible()) {
        await toolSelect.selectOption('axios');
        console.log('✅ Tool set to axios');
      }
      
      // Fill base URL
      const baseUrlInput = page.locator('input[placeholder*="url" i], input[name="baseUrl"]').first();
      if (await baseUrlInput.isVisible()) {
        await baseUrlInput.fill('https://jsonplaceholder.typicode.com');
        console.log('✅ Base URL set');
      }
      
      // Step 5: Add a test step
      console.log('➕ Adding test step...');
      const addStepButton = page.locator('button:has-text("Add Step"), button:has-text("+")').first();
      if (await addStepButton.isVisible()) {
        await addStepButton.click();
        await page.waitForTimeout(1000);
        
        // Fill step details
        const stepNameInput = page.locator('input[placeholder*="step" i], input[name="stepName"]').first();
        if (await stepNameInput.isVisible()) {
          await stepNameInput.fill('Get Posts');
        }
        
        const stepUrlInput = page.locator('input[placeholder*="url" i], input[name="url"]').first();
        if (await stepUrlInput.isVisible()) {
          await stepUrlInput.fill('/posts');
        }
        
        const stepActionSelect = page.locator('select').last();
        if (await stepActionSelect.isVisible()) {
          await stepActionSelect.selectOption('GET');
        }
        
        console.log('✅ Test step configured');
      }
      
      // Step 6: Execute the test
      console.log('🚀 Executing test...');
      const executeButton = page.locator('button:has-text("Execute Test Suite")').first();
      if (await executeButton.isVisible()) {
        await executeButton.click();
        console.log('✅ Execute button clicked');
        
        // Step 7: Monitor execution
        console.log('📊 Monitoring execution...');
        await page.waitForTimeout(10000); // Wait 10 seconds for execution
        
        // Check for execution logs
        const logsSection = page.locator('text=Live Execution Logs, text=Execution Logs').first();
        if (await logsSection.isVisible()) {
          console.log('✅ Execution logs found');
          
          // Check for success/failure messages
          const successMessages = page.locator('text=/PASS|SUCCESS|completed successfully/');
          const errorMessages = page.locator('text=/FAIL|ERROR|502|Bad Gateway|Tool: undefined/');
          
          const successCount = await successMessages.count();
          const errorCount = await errorMessages.count();
          
          console.log(`📈 Success messages: ${successCount}`);
          console.log(`❌ Error messages: ${errorCount}`);
          
          if (errorCount > 0) {
            for (let i = 0; i < errorCount; i++) {
              const errorText = await errorMessages.nth(i).textContent();
              console.log(`🚨 Error: ${errorText}`);
            }
          }
        }
        
        // Step 8: Check for test results
        console.log('📈 Checking test results...');
        const resultsSection = page.locator('text=Test Execution Results').first();
        if (await resultsSection.isVisible()) {
          console.log('✅ Test results section found');
          
          // Check if results are populated
          const resultText = await resultsSection.locator('..').textContent();
          if (resultText && resultText.length > 100) {
            console.log('✅ Test results populated');
            console.log('📊 Results preview:', resultText.substring(0, 200) + '...');
          } else {
            console.log('⚠️ Test results section empty');
          }
        } else {
          console.log('❌ Test results section not found');
        }
      } else {
        console.log('❌ Execute button not found');
      }
    } else {
      console.log('❌ Test configuration form not found');
    }
    
    // Step 9: Take final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'staging-test-final.png', fullPage: true });
    
    // Step 10: Summary
    console.log('📋 Test Summary:');
    console.log(`📡 Network requests monitored: ${networkRequests.length}`);
    console.log('🌐 Network requests:', networkRequests);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'staging-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the comprehensive test
comprehensiveStagingTest().catch(console.error);
