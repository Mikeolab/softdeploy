const { chromium } = require('playwright');

async function finalStagingTest() {
  console.log('🎯 Final comprehensive staging test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor all network activity
  const networkLog = [];
  page.on('request', request => {
    networkLog.push({
      type: 'request',
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('response', response => {
    networkLog.push({
      type: 'response',
      url: response.url(),
      status: response.status(),
      timestamp: new Date().toISOString()
    });
    
    if (response.status() >= 400) {
      console.log(`❌ HTTP Error: ${response.status()} - ${response.url()}`);
    }
  });
  
  try {
    // Step 1: Navigate to staging
    console.log('📱 Navigating to staging environment...');
    await page.goto('https://devops-real-app-staging.onrender.com');
    await page.waitForLoadState('networkidle');
    
    // Check if we need to login
    const loginForm = page.locator('form').first();
    if (await loginForm.isVisible()) {
      console.log('🔐 Logging in...');
      await page.fill('input[type="email"]', 'scott@gmail.com');
      await page.fill('input[type="password"]', 'Virus@Mike4');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
    
    // Step 2: Navigate to test management
    console.log('🧪 Navigating to test management...');
    await page.goto('https://devops-real-app-staging.onrender.com/test-management/ce3e97ce-3508-4778-933d-fb285269dc10');
    await page.waitForLoadState('networkidle');
    
    // Step 3: Find and click User Stories tab
    console.log('📋 Looking for User Stories tab...');
    const tabs = page.locator('[role="tab"], .tab, button').filter({ hasText: /user.?stories/i });
    if (await tabs.count() > 0) {
      await tabs.first().click();
      await page.waitForLoadState('networkidle');
      console.log('✅ User Stories tab clicked');
    } else {
      console.log('⚠️ User Stories tab not found, continuing...');
    }
    
    // Step 4: Look for the test builder interface
    console.log('🔍 Looking for test builder interface...');
    await page.waitForTimeout(3000);
    
    // Check if we can find test configuration elements
    const testNameField = page.locator('input').filter({ hasText: /name/i }).first();
    const testTypeField = page.locator('select').first();
    
    if (await testNameField.isVisible()) {
      console.log('✅ Test configuration form found');
      
      // Step 5: Configure a test
      console.log('⚙️ Configuring test...');
      await testNameField.fill('Automated Test');
      
      if (await testTypeField.isVisible()) {
        await testTypeField.selectOption('API');
        console.log('✅ Test type set to API');
      }
      
      // Look for tool selection
      const toolField = page.locator('select').nth(1);
      if (await toolField.isVisible()) {
        await toolField.selectOption('axios');
        console.log('✅ Tool set to axios');
      }
      
      // Look for base URL field
      const urlField = page.locator('input').filter({ hasText: /url/i }).first();
      if (await urlField.isVisible()) {
        await urlField.fill('https://jsonplaceholder.typicode.com');
        console.log('✅ Base URL set');
      }
      
      // Step 6: Add a test step
      console.log('➕ Adding test step...');
      const addButton = page.locator('button').filter({ hasText: /add|plus|\+/i }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Fill step details
        const stepFields = page.locator('input').all();
        if (stepFields.length > 0) {
          await stepFields[0].fill('Get Posts');
        }
        if (stepFields.length > 1) {
          await stepFields[1].fill('/posts/1');
        }
        
        console.log('✅ Test step added');
      }
      
      // Step 7: Execute the test
      console.log('🚀 Executing test...');
      const executeButton = page.locator('button').filter({ hasText: /execute|run|start/i }).first();
      if (await executeButton.isVisible()) {
        await executeButton.click();
        console.log('✅ Execute button clicked');
        
        // Step 8: Monitor execution
        console.log('📊 Monitoring execution...');
        await page.waitForTimeout(8000);
        
        // Check for execution logs
        const logsText = await page.textContent('body');
        if (logsText.includes('PASS') || logsText.includes('SUCCESS')) {
          console.log('✅ Test execution successful!');
        } else if (logsText.includes('FAIL') || logsText.includes('ERROR')) {
          console.log('❌ Test execution failed');
        } else {
          console.log('⚠️ Test execution status unclear');
        }
        
        // Check for test results
        if (logsText.includes('Test Execution Results')) {
          console.log('✅ Test results section found');
        } else {
          console.log('❌ Test results section not found');
        }
        
        // Check for specific error patterns
        if (logsText.includes('502') || logsText.includes('Bad Gateway')) {
          console.log('❌ 502 Bad Gateway errors detected');
        }
        if (logsText.includes('Tool: undefined')) {
          console.log('❌ Tool: undefined errors detected');
        }
        
      } else {
        console.log('❌ Execute button not found');
      }
    } else {
      console.log('❌ Test configuration form not found');
    }
    
    // Step 9: Final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'final-staging-test.png', fullPage: true });
    
    // Step 10: Network analysis
    console.log('📡 Network Analysis:');
    const apiRequests = networkLog.filter(log => 
      log.url.includes('execute-test-suite') || 
      log.url.includes('exec_') ||
      log.url.includes('api/')
    );
    
    console.log(`📊 API requests: ${apiRequests.length}`);
    apiRequests.forEach(req => {
      console.log(`  ${req.type}: ${req.status || req.method} - ${req.url}`);
    });
    
    const errors = networkLog.filter(log => log.status && log.status >= 400);
    if (errors.length > 0) {
      console.log(`❌ Network errors: ${errors.length}`);
      errors.forEach(err => {
        console.log(`  ${err.status} - ${err.url}`);
      });
    } else {
      console.log('✅ No network errors detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'final-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the final test
finalStagingTest().catch(console.error);
