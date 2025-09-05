const puppeteer = require('puppeteer');

async function testMagicalAnimations() {
  console.log('🎭 TESTING MAGICAL ANIMATIONS ON RENDER DEPLOYMENT');
  console.log('======================================================================');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser to see animations
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the deployed app
    console.log('🌐 Navigating to deployed app...');
    await page.goto('https://devops-real-app-staging.onrender.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check if we're on login page
    const isLoginPage = await page.$('input[type="email"]') !== null;
    
    if (isLoginPage) {
      console.log('🔐 On login page, creating account...');
      
      // Fill in signup form
      await page.type('input[type="email"]', `test${Date.now()}@example.com`);
      await page.type('input[type="password"]', 'testpassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForTimeout(5000);
    }
    
    // Navigate to test management
    console.log('🧪 Navigating to test management...');
    await page.goto('https://devops-real-app-staging.onrender.com/test-management', { 
      waitUntil: 'networkidle2' 
    });
    
    await page.waitForTimeout(3000);
    
    // Look for the test builder
    console.log('🔍 Looking for test builder...');
    
    // Try to find and click "Create New Test Suite" or similar
    const createButton = await page.$('button:contains("Create")') || 
                       await page.$('button:contains("New")') ||
                       await page.$('[data-testid*="create"]');
    
    if (createButton) {
      await createButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Fill in a simple API test
    console.log('📝 Creating API test...');
    
    // Test suite name
    const nameInput = await page.$('input[placeholder*="name" i], input[name*="name" i]');
    if (nameInput) {
      await nameInput.type('Magical Animation Test');
    }
    
    // Test type - API
    const apiOption = await page.$('input[value="API"], button:contains("API")');
    if (apiOption) {
      await apiOption.click();
    }
    
    // Tool selection
    const axiosOption = await page.$('input[value="axios"], button:contains("axios")');
    if (axiosOption) {
      await axiosOption.click();
    }
    
    // Base URL
    const urlInput = await page.$('input[placeholder*="url" i], input[name*="url" i]');
    if (urlInput) {
      await urlInput.type('https://jsonplaceholder.typicode.com');
    }
    
    // Add a test step
    console.log('➕ Adding test step...');
    const addStepButton = await page.$('button:contains("Add Step"), button:contains("Add")');
    if (addStepButton) {
      await addStepButton.click();
      await page.waitForTimeout(1000);
      
      // Fill step details
      const stepNameInput = await page.$('input[placeholder*="step" i], input[name*="step" i]');
      if (stepNameInput) {
        await stepNameInput.type('Get Posts');
      }
      
      const methodSelect = await page.$('select[name*="method" i], select:contains("GET")');
      if (methodSelect) {
        await methodSelect.select('GET');
      }
      
      const endpointInput = await page.$('input[placeholder*="endpoint" i], input[name*="endpoint" i]');
      if (endpointInput) {
        await endpointInput.type('/posts');
      }
    }
    
    // Execute the test
    console.log('🚀 Executing test to see magical animations...');
    const executeButton = await page.$('button:contains("Execute"), button:contains("Run")');
    if (executeButton) {
      await executeButton.click();
      
      // Wait and watch for animations
      console.log('✨ Watching for magical animations...');
      await page.waitForTimeout(15000); // Wait 15 seconds to see animations
      
      // Check if we can see success messages with sparkles
      const successLogs = await page.$$eval('.text-green-400, .success-log', elements => 
        elements.map(el => el.textContent)
      );
      
      console.log('🎉 Success logs found:', successLogs.length);
      successLogs.forEach(log => console.log('  ✨', log));
      
      // Check for sparkle elements
      const sparkles = await page.$$eval('.sparkle', elements => elements.length);
      console.log('✨ Sparkles detected:', sparkles);
      
    } else {
      console.log('❌ Execute button not found');
    }
    
    console.log('✅ Magical animation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for a bit to see results
    console.log('👀 Keeping browser open for 10 seconds to see results...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testMagicalAnimations().catch(console.error);
