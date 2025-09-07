// Performance testing with large datasets
// This tests how the app handles large amounts of data

console.log('⚡ PERFORMANCE TESTING STARTING...');

// Test 1: Generate large dataset
console.log('\n📋 TEST 1: Large Dataset Generation');
const startTime = performance.now();

const largeDataset = [];
const projectCount = 10;
const runsPerProject = 100;

for (let p = 0; p < projectCount; p++) {
  const projectId = `project-${p}`;
  const projectName = `Project ${p}`;
  
  for (let r = 0; r < runsPerProject; r++) {
    largeDataset.push({
      id: `${projectId}-run-${r}`,
      projectId: projectId,
      testSuite: { 
        name: `Test Suite ${r % 5}`,
        description: `Description for test suite ${r}`
      },
      success: Math.random() > 0.3,
      totalSteps: Math.floor(Math.random() * 10) + 1,
      passedSteps: Math.floor(Math.random() * 8) + 1,
      failedSteps: Math.floor(Math.random() * 3),
      totalTime: Math.floor(Math.random() * 5000) + 100,
      executedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    });
  }
}

const generationTime = performance.now() - startTime;
console.log(`✅ Generated ${largeDataset.length} test runs in ${Math.round(generationTime)}ms`);

// Test 2: Store large dataset
console.log('\n📋 TEST 2: Large Dataset Storage');
const storageStartTime = performance.now();

try {
  localStorage.setItem('testRunsV2', JSON.stringify(largeDataset));
  const storageTime = performance.now() - storageStartTime;
  console.log(`✅ Stored ${largeDataset.length} records in ${Math.round(storageTime)}ms`);
} catch (error) {
  console.log('❌ Storage failed:', error.message);
}

// Test 3: Retrieve and filter large dataset
console.log('\n📋 TEST 3: Large Dataset Retrieval and Filtering');
const retrievalStartTime = performance.now();

try {
  const retrievedData = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
  
  // Test filtering by project
  const project0Runs = retrievedData.filter(run => run.projectId === 'project-0');
  const successfulRuns = retrievedData.filter(run => run.success);
  const recentRuns = retrievedData
    .sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))
    .slice(0, 10);
  
  const retrievalTime = performance.now() - retrievalStartTime;
  console.log(`✅ Retrieved and filtered data in ${Math.round(retrievalTime)}ms`);
  console.log(`   - Project 0 runs: ${project0Runs.length}`);
  console.log(`   - Successful runs: ${successfulRuns.length}`);
  console.log(`   - Recent runs: ${recentRuns.length}`);
} catch (error) {
  console.log('❌ Retrieval failed:', error.message);
}

// Test 4: Memory usage
console.log('\n📋 TEST 4: Memory Usage');
if (performance.memory) {
  const memoryInfo = {
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
  };
  
  console.log('Memory usage:', memoryInfo);
  console.log(`Memory usage: ${memoryInfo.used}MB / ${memoryInfo.limit}MB (${Math.round(memoryInfo.used / memoryInfo.limit * 100)}%)`);
} else {
  console.log('Memory API not available');
}

// Test 5: DOM manipulation performance
console.log('\n📋 TEST 5: DOM Manipulation Performance');
const domStartTime = performance.now();

// Simulate rendering large lists
const testContainer = document.createElement('div');
testContainer.style.display = 'none'; // Hide to avoid visual impact

for (let i = 0; i < 1000; i++) {
  const testElement = document.createElement('div');
  testElement.textContent = `Test Item ${i}`;
  testElement.className = 'test-item';
  testContainer.appendChild(testElement);
}

document.body.appendChild(testContainer);
const domTime = performance.now() - domStartTime;
console.log(`✅ Created 1000 DOM elements in ${Math.round(domTime)}ms`);

// Clean up
document.body.removeChild(testContainer);

// Test 6: Search performance
console.log('\n📋 TEST 6: Search Performance');
const searchStartTime = performance.now();

const searchTerm = 'Test Suite 2';
const searchResults = largeDataset.filter(run => 
  run.testSuite.name.toLowerCase().includes(searchTerm.toLowerCase())
);

const searchTime = performance.now() - searchStartTime;
console.log(`✅ Found ${searchResults.length} results for "${searchTerm}" in ${Math.round(searchTime)}ms`);

// Test 7: Sort performance
console.log('\n📋 TEST 7: Sort Performance');
const sortStartTime = performance.now();

const sortedRuns = [...largeDataset].sort((a, b) => 
  new Date(b.executedAt) - new Date(a.executedAt)
);

const sortTime = performance.now() - sortStartTime;
console.log(`✅ Sorted ${sortedRuns.length} records in ${Math.round(sortTime)}ms`);

// Clean up test data
localStorage.removeItem('testRunsV2');

console.log('\n🎉 PERFORMANCE TESTING COMPLETED!');
console.log('📊 Performance Summary:');
console.log(`✅ Dataset generation: ${Math.round(generationTime)}ms`);
console.log(`✅ Data storage: ${Math.round(storageTime)}ms`);
console.log(`✅ Data retrieval: ${Math.round(retrievalTime)}ms`);
console.log(`✅ DOM manipulation: ${Math.round(domTime)}ms`);
console.log(`✅ Search operation: ${Math.round(searchTime)}ms`);
console.log(`✅ Sort operation: ${Math.round(sortTime)}ms`);
console.log(`✅ Total records tested: ${largeDataset.length}`);
