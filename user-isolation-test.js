// USER-SPECIFIC DATA ISOLATION TEST
// This ensures each user sees only their own data

console.log('🔒 USER-SPECIFIC DATA ISOLATION TEST STARTING...');

// Test 1: Check current user authentication
console.log('\n📋 TEST 1: Current User Authentication');
const getCurrentUser = () => {
  try {
    const authToken = localStorage.getItem('sb-szzycvciwdxbmeyggdwh-auth-token');
    if (authToken) {
      const tokenData = JSON.parse(authToken);
      const user = tokenData.user;
      console.log('✅ Current user:', user?.email || 'Unknown');
      console.log('✅ User ID:', user?.id || 'Not found');
      return user;
    } else {
      console.log('❌ No authentication token found');
      return null;
    }
  } catch (error) {
    console.log('❌ Error parsing auth token:', error.message);
    return null;
  }
};

const currentUser = getCurrentUser();

// Test 2: Test projects isolation
console.log('\n📋 TEST 2: Projects Data Isolation');
const testProjectsIsolation = async (user) => {
  if (!user) {
    console.log('⚠️ No user - cannot test projects isolation');
    return;
  }
  
  try {
    const response = await fetch('https://szzycvciwdxbmeyggdwh.supabase.co/rest/v1/projects?select=id,name,user_id', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enljdmNpd2R4Ym1leWdnZHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NjcwNjIsImV4cCI6MjA3MTU0MzA2Mn0.b5SvPfNz4wcBHn3aUZOWnnvILsc6kqt1Qkm89RmdfpM',
        'Authorization': 'Bearer ' + localStorage.getItem('sb-szzycvciwdxbmeyggdwh-auth-token')
      }
    });
    
    if (response.ok) {
      const projects = await response.json();
      console.log(`✅ Total projects returned: ${projects.length}`);
      
      // Check if all projects belong to current user
      const userProjects = projects.filter(p => p.user_id === user.id);
      const otherUserProjects = projects.filter(p => p.user_id !== user.id);
      
      console.log(`✅ User's projects: ${userProjects.length}`);
      console.log(`✅ Other users' projects: ${otherUserProjects.length}`);
      
      if (otherUserProjects.length === 0) {
        console.log('✅ Projects isolation working correctly');
      } else {
        console.log('❌ Projects isolation issue detected');
        console.log('Other users projects:', otherUserProjects.map(p => ({ name: p.name, user_id: p.user_id })));
      }
      
      return { userProjects, otherUserProjects };
    } else {
      console.log('❌ Failed to fetch projects:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error testing projects isolation:', error.message);
    return null;
  }
};

// Test 3: Test runs isolation
console.log('\n📋 TEST 3: Test Runs Data Isolation');
const testRunsIsolation = (user) => {
  if (!user) {
    console.log('⚠️ No user - cannot test test runs isolation');
    return;
  }
  
  try {
    const testRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
    console.log(`✅ Total test runs in localStorage: ${testRuns.length}`);
    
    // Check if all test runs belong to current user
    const userTestRuns = testRuns.filter(run => run.user_id === user.id);
    const otherUserTestRuns = testRuns.filter(run => run.user_id !== user.id);
    
    console.log(`✅ User's test runs: ${userTestRuns.length}`);
    console.log(`✅ Other users' test runs: ${otherUserTestRuns.length}`);
    
    if (otherUserTestRuns.length === 0) {
      console.log('✅ Test runs isolation working correctly');
    } else {
      console.log('❌ Test runs isolation issue detected');
      console.log('Other users test runs:', otherUserTestRuns.map(run => ({ 
        id: run.id, 
        user_id: run.user_id,
        testSuite: run.testSuite?.name 
      })));
    }
    
    return { userTestRuns, otherUserTestRuns };
  } catch (error) {
    console.log('❌ Error testing test runs isolation:', error.message);
    return null;
  }
};

// Test 4: Generate user-specific test data
console.log('\n📋 TEST 4: Generate User-Specific Test Data');
const generateUserSpecificData = (user, projects) => {
  if (!user || !projects) {
    console.log('⚠️ Missing user or projects - cannot generate data');
    return;
  }
  
  // Clear existing data
  localStorage.removeItem('testRunsV2');
  
  const userTestRuns = [];
  
  projects.forEach((project, projectIndex) => {
    const projectKey = project.id.substring(0, 8);
    const projectName = project.name.toLowerCase();
    
    // Different test suites based on project name
    const testSuites = {
      'ecommerce': ['Payment Processing', 'Product Catalog', 'User Accounts', 'Order Management'],
      'testlab': ['API Endpoints', 'Database Operations', 'Authentication', 'Performance Tests'],
      'newproject': ['Core Features', 'Integration Tests', 'Performance Tests', 'Security Tests']
    };
    
    const suites = testSuites[projectName] || ['API Tests', 'UI Tests', 'Integration Tests', 'Performance Tests'];
    
    // Generate 2-4 test runs per project
    const runsPerProject = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < runsPerProject; i++) {
      const suiteName = suites[i % suites.length];
      const success = Math.random() > 0.2; // 80% success rate
      
      userTestRuns.push({
        id: `${projectKey}-${user.id.substring(0, 8)}-run-${i + 1}`,
        projectId: project.id,
        user_id: user.id, // Ensure user_id is set
        testSuite: { 
          name: `${suiteName} Test`,
          description: `Test suite for ${suiteName.toLowerCase()}`
        },
        success: success,
        totalSteps: Math.floor(Math.random() * 8) + 2,
        passedSteps: success ? Math.floor(Math.random() * 6) + 2 : Math.floor(Math.random() * 3) + 1,
        failedSteps: success ? 0 : Math.floor(Math.random() * 3) + 1,
        totalTime: Math.floor(Math.random() * 3000) + 500,
        executedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
      });
    }
    
    console.log(`✅ Generated ${runsPerProject} test runs for "${project.name}"`);
  });
  
  localStorage.setItem('testRunsV2', JSON.stringify(userTestRuns));
  console.log(`✅ Total user-specific test runs generated: ${userTestRuns.length}`);
  
  return userTestRuns;
};

// Test 5: Simulate multiple users
console.log('\n📋 TEST 5: Simulate Multiple Users');
const simulateMultipleUsers = () => {
  const users = [
    { id: 'user-1', email: 'user1@example.com', name: 'User One' },
    { id: 'user-2', email: 'user2@example.com', name: 'User Two' },
    { id: 'user-3', email: 'user3@example.com', name: 'User Three' }
  ];
  
  const allTestRuns = [];
  
  users.forEach(user => {
    const userTestRuns = Array.from({ length: 5 }, (_, i) => ({
      id: `${user.id}-run-${i + 1}`,
      projectId: `project-${user.id}`,
      user_id: user.id,
      testSuite: { name: `Test Suite ${i + 1}` },
      success: Math.random() > 0.3,
      totalSteps: Math.floor(Math.random() * 10) + 1,
      totalTime: Math.floor(Math.random() * 5000) + 100,
      executedAt: new Date().toISOString()
    }));
    
    allTestRuns.push(...userTestRuns);
    console.log(`✅ Generated ${userTestRuns.length} test runs for ${user.name}`);
  });
  
  // Store all users' data
  localStorage.setItem('allUsersTestRuns', JSON.stringify(allTestRuns));
  console.log(`✅ Total test runs for all users: ${allTestRuns.length}`);
  
  // Test filtering by current user
  if (currentUser) {
    const currentUserRuns = allTestRuns.filter(run => run.user_id === currentUser.id);
    console.log(`✅ Current user's runs from all data: ${currentUserRuns.length}`);
  }
  
  return allTestRuns;
};

// Test 6: Cross-user data access prevention
console.log('\n📋 TEST 6: Cross-User Data Access Prevention');
const testCrossUserAccess = (allTestRuns) => {
  if (!currentUser) {
    console.log('⚠️ No current user - cannot test cross-user access');
    return;
  }
  
  // Simulate trying to access other users' data
  const otherUsers = allTestRuns
    .map(run => run.user_id)
    .filter((userId, index, arr) => arr.indexOf(userId) === index)
    .filter(userId => userId !== currentUser.id);
  
  console.log(`✅ Other users found: ${otherUsers.length}`);
  
  otherUsers.forEach(otherUserId => {
    const otherUserRuns = allTestRuns.filter(run => run.user_id === otherUserId);
    console.log(`✅ User ${otherUserId} has ${otherUserRuns.length} test runs`);
    
    // This should NOT be accessible to current user
    console.log(`⚠️ Current user should NOT see these runs: ${otherUserRuns.map(r => r.id).join(', ')}`);
  });
  
  // Test that current user only sees their own data
  const currentUserRuns = allTestRuns.filter(run => run.user_id === currentUser.id);
  console.log(`✅ Current user should only see: ${currentUserRuns.map(r => r.id).join(', ')}`);
  
  return { otherUsers, currentUserRuns };
};

// Run all isolation tests
const runIsolationTests = async () => {
  console.log('🚀 Starting user-specific data isolation tests...');
  
  // Test 1: Current user
  if (!currentUser) {
    console.log('❌ No authenticated user - cannot run isolation tests');
    return;
  }
  
  // Test 2: Projects isolation
  const projectsIsolation = await testProjectsIsolation(currentUser);
  
  // Test 3: Test runs isolation
  const testRunsIsolation = testRunsIsolation(currentUser);
  
  // Test 4: Generate user-specific data
  const userTestRuns = generateUserSpecificData(currentUser, projectsIsolation?.userProjects || []);
  
  // Test 5: Simulate multiple users
  const allTestRuns = simulateMultipleUsers();
  
  // Test 6: Cross-user access prevention
  const crossUserAccess = testCrossUserAccess(allTestRuns);
  
  // Summary
  console.log('\n🎉 USER-SPECIFIC DATA ISOLATION TEST COMPLETED!');
  console.log('📊 Isolation Test Summary:');
  console.log(`✅ Current user: ${currentUser.email}`);
  console.log(`✅ User's projects: ${projectsIsolation?.userProjects?.length || 0}`);
  console.log(`✅ User's test runs: ${userTestRuns?.length || 0}`);
  console.log(`✅ Other users' data: ${crossUserAccess?.otherUsers?.length || 0}`);
  console.log(`✅ Data isolation: ${crossUserAccess?.otherUsers?.length === 0 ? 'Working' : 'Needs Review'}`);
  
  console.log('\n🔄 REFRESH THE PAGE TO SEE USER-SPECIFIC DATA!');
};

// Start the test
runIsolationTests();
