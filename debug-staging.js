const { chromium } = require('playwright');

async function debugStagingEnvironment() {
  console.log('🔍 Starting comprehensive staging environment debug...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down for observation
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to staging and check initial load
    console.log('📱 Navigating to staging environment...');
    await page.goto('https://devops-real-app-staging.onrender.com');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads properly
    const title = await page.title();
    console.log('✅ Page loaded, title:', title);
    
    // Step 2: Login with provided credentials
    console.log('🔐 Attempting login...');
    
    // Look for login form elements
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('scott@gmail.com');
      await passwordInput.fill('Virus@Mike4');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Login attempted');
    } else {
      console.log('⚠️ No login form found, might already be logged in');
    }
    
    // Step 3: Navigate to test management
    console.log('🧪 Navigating to test management...');
    await page.goto('https://devops-real-app-staging.onrender.com/test-management/ce3e97ce-3508-4778-933d-fb285269dc10');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Check for User Stories tab
    console.log('📋 Looking for User Stories tab...');
    const userStoriesTab = page.locator('text=User Stories').first();
    if (await userStoriesTab.isVisible()) {
      await userStoriesTab.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Clicked User Stories tab');
    }
    
    // Step 5: Check for sample tests
    console.log('🎯 Looking for sample tests...');
    const sampleTests = page.locator('text=Sample Tests').first();
    if (await sampleTests.isVisible()) {
      console.log('✅ Sample tests section found');
      
      // Look for API test sample
      const apiTestCard = page.locator('text=API Test').first();
      if (await apiTestCard.isVisible()) {
        console.log('✅ API Test sample found, clicking...');
        await apiTestCard.click();
        await page.waitForTimeout(2000); // Wait for form to populate
        
        // Check if form was populated
        const testNameInput = page.locator('input[placeholder*="name" i], input[name="name"]').first();
        const testName = await testNameInput.inputValue();
        console.log('📝 Test name populated:', testName);
        
        // Step 6: Execute the test
        console.log('🚀 Executing test suite...');
        const executeButton = page.locator('button:has-text("Execute Test Suite")').first();
        if (await executeButton.isVisible()) {
          await executeButton.click();
          console.log('✅ Execute button clicked');
          
          // Monitor for execution logs
          console.log('📊 Monitoring execution logs...');
          await page.waitForTimeout(5000); // Wait for execution to start
          
          // Look for execution logs
          const logsSection = page.locator('text=Live Execution Logs').first();
          if (await logsSection.isVisible()) {
            console.log('✅ Execution logs section found');
            
            // Check for specific error messages
            const errorMessages = page.locator('text=/502|Bad Gateway|Tool: undefined|FAILURE/');
            const errorCount = await errorMessages.count();
            console.log('❌ Error messages found:', errorCount);
            
            if (errorCount > 0) {
              for (let i = 0; i < errorCount; i++) {
                const errorText = await errorMessages.nth(i).textContent();
                console.log('🚨 Error:', errorText);
              }
            }
          }
          
          // Step 7: Check network requests
          console.log('🌐 Analyzing network requests...');
          const requests = await page.evaluate(() => {
            return performance.getEntriesByType('resource')
              .filter(entry => entry.name.includes('execute-test-suite') || entry.name.includes('exec_'))
              .map(entry => ({
                name: entry.name,
                duration: entry.duration,
                transferSize: entry.transferSize
              }));
          });
          
          console.log('📡 Network requests:', requests);
          
          // Step 8: Check for test results
          console.log('📈 Checking for test results...');
          const resultsSection = page.locator('text=Test Execution Results').first();
          if (await resultsSection.isVisible()) {
            console.log('✅ Test results section found');
            
            // Check if results are populated
            const resultContent = await resultsSection.locator('..').textContent();
            console.log('📊 Results content:', resultContent?.substring(0, 200) + '...');
          } else {
            console.log('❌ Test results section not found');
          }
          
        } else {
          console.log('❌ Execute button not found');
        }
      } else {
        console.log('❌ API Test sample not found');
      }
    } else {
      console.log('❌ Sample tests section not found');
    }
    
    // Step 9: Take screenshot for debugging
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'staging-debug.png', fullPage: true });
    console.log('✅ Screenshot saved as staging-debug.png');
    
    // Step 10: Check console errors
    console.log('🔍 Checking console errors...');
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    console.log('🚨 Console errors:', consoleErrors);
    
  } catch (error) {
    console.error('❌ Debug session failed:', error);
    await page.screenshot({ path: 'staging-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug session
debugStagingEnvironment().catch(console.error);
