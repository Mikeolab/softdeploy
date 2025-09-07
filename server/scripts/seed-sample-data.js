// Enhanced sample data seeding script for SoftDeploy
const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load sample data from fixtures
const fixturesDir = path.join(__dirname, '../../cypress/fixtures');
const loadFixture = (filename) => {
  try {
    const filePath = path.join(fixturesDir, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`⚠️ Could not load fixture ${filename}:`, error.message);
    return [];
  }
};

// Load sample data from fixtures
const users = loadFixture('sample-users.json');
const projects = loadFixture('sample-projects.json');
const testSuites = loadFixture('sample-tests.json');
const testRuns = loadFixture('sample-runs.json');

// Enhanced sample data with additional generated data
const sampleData = {
  users,
  projects,
  testSuites,
  testRuns,
  // Additional generated data for localStorage compatibility
  localStorage: {
    testRunsV2: testRuns.map(run => ({
      id: run.id,
      projectId: run.project_id,
      testSuite: {
        name: testSuites.find(suite => suite.id === run.test_suite_id)?.name || 'Unknown Test',
        description: testSuites.find(suite => suite.id === run.test_suite_id)?.description || ''
      },
      success: run.status === 'completed' && run.failed_steps === 0,
      totalSteps: run.total_steps,
      passedSteps: run.passed_steps,
      failedSteps: run.failed_steps,
      totalTime: run.total_time,
      executedAt: run.executed_at,
      timestamp: new Date(run.executed_at).getTime(),
      user_id: run.user_id
    })),
    testResultsV2: testRuns.map(run => ({
      id: run.id,
      testSuite: testSuites.find(suite => suite.id === run.test_suite_id)?.name || 'Unknown Test',
      testType: testSuites.find(suite => suite.id === run.test_suite_id)?.test_type || 'API',
      toolId: testSuites.find(suite => suite.id === run.test_suite_id)?.tool_id || 'unknown',
      success: run.status === 'completed' && run.failed_steps === 0,
      totalSteps: run.total_steps,
      passedSteps: run.passed_steps,
      failedSteps: run.failed_steps,
      totalTime: run.total_time,
      executedAt: run.executed_at,
      summary: run.results?.summary || {
        total: run.total_steps,
        passed: run.passed_steps,
        failed: run.failed_steps,
        duration: run.total_time
      }
    }))
  }
};

// Write to JSON file
const outputPath = path.join(dataDir, 'sample-data.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));

console.log('✅ Sample data seeded successfully!');
console.log(`📁 Data written to: ${outputPath}`);
console.log(`📊 Users: ${sampleData.users.length}`);
console.log(`📊 Projects: ${sampleData.projects.length}`);
console.log(`📊 Test Suites: ${sampleData.testSuites.length}`);
console.log(`📊 Test Runs: ${sampleData.testRuns.length}`);
console.log(`📊 LocalStorage Test Runs: ${sampleData.localStorage.testRunsV2.length}`);
console.log(`📊 LocalStorage Test Results: ${sampleData.localStorage.testResultsV2.length}`);