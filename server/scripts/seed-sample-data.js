// Sample data seeding script for SoftDeploy
const fs = require('fs')
const path = require('path')

const sampleData = {
  projects: [
    {
      id: 'sample-project-1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce application',
      user_id: 'sample-user-1',
      environment: 'production',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sample-project-2', 
      name: 'API Gateway',
      description: 'Microservices API gateway',
      user_id: 'sample-user-1',
      environment: 'staging',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  testSuites: [
    {
      id: 'suite-1',
      project_id: 'sample-project-1',
      name: 'Payment Processing Tests',
      description: 'Test payment flows and transactions',
      test_count: 5,
      created_at: new Date().toISOString()
    },
    {
      id: 'suite-2',
      project_id: 'sample-project-2', 
      name: 'API Endpoint Tests',
      description: 'Test REST API functionality',
      test_count: 8,
      created_at: new Date().toISOString()
    }
  ],
  testRuns: [
    {
      id: 'run-1',
      project_id: 'sample-project-1',
      suite_id: 'suite-1',
      status: 'completed',
      success: true,
      total_steps: 5,
      passed_steps: 5,
      failed_steps: 0,
      total_time: 2500,
      executed_at: new Date().toISOString()
    },
    {
      id: 'run-2',
      project_id: 'sample-project-2',
      suite_id: 'suite-2', 
      status: 'completed',
      success: false,
      total_steps: 8,
      passed_steps: 6,
      failed_steps: 2,
      total_time: 4200,
      executed_at: new Date().toISOString()
    }
  ]
}

// Write sample data to JSON files
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

fs.writeFileSync(
  path.join(dataDir, 'sample-data.json'),
  JSON.stringify(sampleData, null, 2)
)

console.log('✅ Sample data seeded successfully!')
console.log(`📁 Data written to: ${path.join(dataDir, 'sample-data.json')}`)
console.log(`📊 Projects: ${sampleData.projects.length}`)
console.log(`📊 Test Suites: ${sampleData.testSuites.length}`)
console.log(`📊 Test Runs: ${sampleData.testRuns.length}`)
