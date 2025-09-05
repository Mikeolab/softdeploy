const puppeteer = require('puppeteer');

async function testSaveFunctionality() {
  console.log('💾 TESTING SAVE FUNCTIONALITY - COMPREHENSIVE TEST');
  console.log('=' .repeat(70));
  
  let allTestsPassed = true;
  let testResults = [];
  let browser;
  
  try {
    // Launch browser
    console.log('\n1️⃣ LAUNCHING BROWSER');
    browser = await puppeteer.launch({ 
      headless: false, // Run in visible mode to see what's happening
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    console.log('✅ Browser launched successfully');
    testResults.push({ test: 'Browser Launch', status: 'PASSED' });
    
    // Test 1: Navigate to local application
    console.log('\n2️⃣ NAVIGATING TO LOCAL APPLICATION');
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
      const title = await page.title();
      console.log(`✅ Application loaded: ${title}`);
      testResults.push({ test: 'Local Application Navigation', status: 'PASSED' });
    } catch (error) {
      console.log(`❌ Local Navigation Failed: ${error.message}`);
      testResults.push({ test: 'Local Application Navigation', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 2: Navigate to test creation page
    console.log('\n3️⃣ NAVIGATING TO TEST CREATION PAGE');
    try {
      // Check current URL and navigate to test creation
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Look for navigation to test creation
      const testCreationLink = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.find(link => 
          link.innerText.toLowerCase().includes('test') ||
          link.innerText.toLowerCase().includes('create') ||
          link.href && link.href.includes('test')
        );
      });
      
      if (testCreationLink && testCreationLink.asElement()) {
        await testCreationLink.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Navigated to test creation page');
      } else {
        // Try to navigate directly to test management
        await page.goto('http://localhost:5173/test-management', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log('✅ Navigated directly to test management');
      }
      
      testResults.push({ test: 'Navigate to Test Creation', status: 'PASSED' });
    } catch (error) {
      console.log(`❌ Navigate to Test Creation Failed: ${error.message}`);
      testResults.push({ test: 'Navigate to Test Creation', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 3: Fill out test suite form
    console.log('\n4️⃣ FILLING OUT TEST SUITE FORM');
    try {
      // Fill in test suite name
      const nameInput = await page.$('input[placeholder*="name"], input[name*="name"]');
      if (nameInput) {
        await nameInput.type('Save Test Suite Test');
        console.log('✅ Test suite name entered');
      }
      
      // Fill in description
      const descInput = await page.$('textarea[placeholder*="description"], textarea[name*="description"]');
      if (descInput) {
        await descInput.type('Testing the save functionality');
        console.log('✅ Description entered');
      }
      
      // Select test type
      const testTypeSelect = await page.$('select[name*="type"], select[id*="type"]');
      if (testTypeSelect) {
        await testTypeSelect.select('API');
        console.log('✅ Test type selected: API');
      }
      
      // Select tool
      const toolSelect = await page.$('select[name*="tool"], select[id*="tool"]');
      if (toolSelect) {
        await toolSelect.select('axios');
        console.log('✅ Tool selected: axios');
      }
      
      testResults.push({ test: 'Form Filling', status: 'PASSED' });
    } catch (error) {
      console.log(`❌ Form Filling Failed: ${error.message}`);
      testResults.push({ test: 'Form Filling', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 3: Add a test step
    console.log('\n4️⃣ ADDING TEST STEP');
    try {
      // Look for "Add Step" button
      const addStepButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.innerText.toLowerCase().includes('add step') ||
          btn.innerText.toLowerCase().includes('add') ||
          btn.innerText.toLowerCase().includes('step')
        );
      });
      
      if (addStepButton && addStepButton.asElement()) {
        await addStepButton.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Add step button clicked');
        
        // Fill in step details
        const stepNameInput = await page.$('input[placeholder*="step"], input[name*="step"]');
        if (stepNameInput) {
          await stepNameInput.type('Test API Call');
          console.log('✅ Step name entered');
        }
        
        const stepUrlInput = await page.$('input[placeholder*="url"], input[name*="url"]');
        if (stepUrlInput) {
          await stepUrlInput.type('/api/test');
          console.log('✅ Step URL entered');
        }
        
        testResults.push({ test: 'Add Test Step', status: 'PASSED' });
      } else {
        console.log('⚠️ Add step button not found');
        testResults.push({ test: 'Add Test Step', status: 'FAILED', error: 'Add step button not found' });
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Add Test Step Failed: ${error.message}`);
      testResults.push({ test: 'Add Test Step', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 4: Save the test suite
    console.log('\n5️⃣ SAVING TEST SUITE');
    try {
      // Look for "Save Test Suite" button
      const saveButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.innerText.toLowerCase().includes('save') &&
          btn.innerText.toLowerCase().includes('test')
        );
      });
      
      if (saveButton && saveButton.asElement()) {
        await saveButton.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Save button clicked');
        
        // Check for success notification
        const notification = await page.evaluate(() => {
          const notifications = document.querySelectorAll('.fixed.top-4.right-4, .notification, .alert');
          return notifications.length > 0 ? notifications[0].innerText : null;
        });
        
        if (notification && notification.includes('saved successfully')) {
          console.log(`✅ Success notification found: ${notification}`);
          testResults.push({ test: 'Save Test Suite', status: 'PASSED' });
        } else {
          console.log('⚠️ Success notification not found');
          testResults.push({ test: 'Save Test Suite', status: 'FAILED', error: 'No success notification' });
          allTestsPassed = false;
        }
      } else {
        console.log('⚠️ Save button not found');
        testResults.push({ test: 'Save Test Suite', status: 'FAILED', error: 'Save button not found' });
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Save Test Suite Failed: ${error.message}`);
      testResults.push({ test: 'Save Test Suite', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 5: Check if saved test appears in Saved Tests section
    console.log('\n6️⃣ CHECKING SAVED TESTS SECTION');
    try {
      // Look for "Saved Test Suites" section
      const savedTestsSection = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('h3'));
        const savedSection = sections.find(section => 
          section.innerText.toLowerCase().includes('saved test')
        );
        return savedSection ? savedSection.innerText : null;
      });
      
      if (savedTestsSection) {
        console.log(`✅ Saved Tests section found: ${savedTestsSection}`);
        
        // Check if our test appears in the saved tests
        const savedTestCards = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.glass-card'));
          return cards.filter(card => 
            card.innerText.includes('Save Test Suite Test')
          );
        });
        
        if (savedTestCards.length > 0) {
          console.log('✅ Saved test appears in Saved Tests section');
          testResults.push({ test: 'Saved Tests Display', status: 'PASSED' });
        } else {
          console.log('⚠️ Saved test not found in Saved Tests section');
          testResults.push({ test: 'Saved Tests Display', status: 'FAILED', error: 'Saved test not displayed' });
          allTestsPassed = false;
        }
      } else {
        console.log('⚠️ Saved Tests section not found');
        testResults.push({ test: 'Saved Tests Display', status: 'FAILED', error: 'Saved Tests section not found' });
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Saved Tests Display Failed: ${error.message}`);
      testResults.push({ test: 'Saved Tests Display', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 6: Test loading a saved test
    console.log('\n7️⃣ TESTING LOAD SAVED TEST');
    try {
      // Click on the saved test card
      const savedTestCard = await page.evaluateHandle(() => {
        const cards = Array.from(document.querySelectorAll('.glass-card'));
        return cards.find(card => 
          card.innerText.includes('Save Test Suite Test')
        );
      });
      
      if (savedTestCard && savedTestCard.asElement()) {
        await savedTestCard.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Saved test card clicked');
        
        // Check if the form is populated with the saved test data
        const formData = await page.evaluate(() => {
          const nameInput = document.querySelector('input[placeholder*="name"], input[name*="name"]');
          const descInput = document.querySelector('textarea[placeholder*="description"], textarea[name*="description"]');
          
          return {
            name: nameInput ? nameInput.value : null,
            description: descInput ? descInput.value : null
          };
        });
        
        if (formData.name && formData.name.includes('Save Test Suite Test')) {
          console.log('✅ Saved test loaded successfully');
          testResults.push({ test: 'Load Saved Test', status: 'PASSED' });
        } else {
          console.log('⚠️ Saved test not loaded properly');
          testResults.push({ test: 'Load Saved Test', status: 'FAILED', error: 'Test data not loaded' });
          allTestsPassed = false;
        }
      } else {
        console.log('⚠️ Saved test card not found');
        testResults.push({ test: 'Load Saved Test', status: 'FAILED', error: 'Saved test card not found' });
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ Load Saved Test Failed: ${error.message}`);
      testResults.push({ test: 'Load Saved Test', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
    // Test 7: Take final screenshot
    console.log('\n8️⃣ TAKING FINAL SCREENSHOT');
    try {
      await page.screenshot({ path: 'save-functionality-test.png' });
      console.log('✅ Final screenshot saved');
      testResults.push({ test: 'Final Screenshot', status: 'PASSED' });
    } catch (error) {
      console.log(`❌ Final Screenshot Failed: ${error.message}`);
      testResults.push({ test: 'Final Screenshot', status: 'FAILED', error: error.message });
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ Test Setup Failed: ${error.message}`);
    allTestsPassed = false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 SAVE FUNCTIONALITY TEST RESULTS');
  console.log('=' .repeat(70));
  
  testResults.forEach((result, index) => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    const error = result.error ? ` - ${result.error}` : '';
    console.log(`${index + 1}. ${status} ${result.test}${error}`);
  });
  
  console.log('\n' + '=' .repeat(70));
  console.log(`🎯 SAVE FUNCTIONALITY TEST RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('=' .repeat(70));
  
  if (allTestsPassed) {
    console.log('\n🚀 SAVE FUNCTIONALITY VERIFIED!');
    console.log('✅ Test suite saving working');
    console.log('✅ Saved tests display working');
    console.log('✅ Load saved test working');
    console.log('✅ Complete save workflow functional');
    console.log('✅ Ready for production');
  } else {
    console.log('\n⚠️ SAVE FUNCTIONALITY ISSUES DETECTED');
    console.log('❌ Some tests failed - check above for details');
    console.log('🔧 Save functionality debugging required');
  }
  
  return allTestsPassed;
}

testSaveFunctionality().then(success => {
  console.log(`\n🎯 FINAL SAVE TEST RESULT: ${success ? '✅ SAVE FUNCTIONALITY WORKING - READY FOR USERS' : '❌ SAVE ISSUES REMAIN - NEEDS DEBUGGING'}`);
  process.exit(success ? 0 : 1);
});
