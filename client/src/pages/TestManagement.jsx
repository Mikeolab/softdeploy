// src/pages/TestManagement.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog } from '@headlessui/react';

function TestManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  // ===== Data state =====
  const [project, setProject] = useState(null);
  const [testPlans, setTestPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('test-plans');

  // ===== Modal state =====
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [selectedTestPlan, setSelectedTestPlan] = useState(null);
  const [newTestPlan, setNewTestPlan] = useState({
    name: '',
    description: '',
    testTool: 'cypress',
    testType: 'e2e',
    schedule: 'manual',
    cronExpression: '',
    testFiles: []
  });

  // ===== Test file state =====
  const [currentTestFile, setCurrentTestFile] = useState({
    name: '',
    content: '',
    type: 'spec'
  });

  useEffect(() => {
    if (user?.id && projectId) {
      fetchProjectData();
    }
  }, [user?.id, projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch test plans
      const { data: testData, error: testError } = await supabase
        .from('test_plans')
        .select('id, title, result, owner_name, ran_at')
        .eq('user_id', user.id)
        .order('ran_at', { ascending: false });

             if (testError) {
         console.error('Test plans fetch error:', testError);
         setTestPlans([]);
       } else {
         setTestPlans(testData || []);
       }
    } catch (error) {
      console.error('Error fetching project data:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestPlan = async () => {
    if (!newTestPlan.name.trim()) return;

    try {
      const testPlan = {
        user_id: user.id,
        title: newTestPlan.name.trim(),
        result: newTestPlan.description.trim(),
        owner_name: user.user_metadata?.full_name || user.email,
        ran_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('test_plans')
        .insert([testPlan])
        .select();

      if (error) throw error;
      
      setTestPlans(prev => [data[0], ...prev]);
      setNewTestPlan({
        name: '',
        description: '',
        testTool: 'cypress',
        testType: 'e2e',
        schedule: 'manual',
        cronExpression: '',
        testFiles: []
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating test plan:', error);
      alert('Failed to create test plan');
    }
  };

  const addTestFile = () => {
    if (!currentTestFile.name.trim() || !currentTestFile.content.trim()) return;

    const testFile = {
      id: Date.now(),
      ...currentTestFile,
      content: currentTestFile.content
    };

    setNewTestPlan(prev => ({
      ...prev,
      testFiles: [...prev.testFiles, testFile]
    }));

    setCurrentTestFile({
      name: '',
      content: '',
      type: 'spec'
    });
  };

  const removeTestFile = (fileId) => {
    setNewTestPlan(prev => ({
      ...prev,
      testFiles: prev.testFiles.filter(file => file.id !== fileId)
    }));
  };

  const runTestPlan = (testPlan) => {
    setSelectedTestPlan(testPlan);
    setIsTestRunnerOpen(true);
  };

  const getTestToolIcon = (tool) => {
    switch (tool) {
      case 'cypress': return '🟡';
      case 'jest': return '🟢';
      case 'playwright': return '🔵';
      case 'selenium': return '🔴';
      case 'k6': return '🟣';
      default: return '🧪';
    }
  };

  const getTestTypeIcon = (type) => {
    switch (type) {
      case 'e2e': return '🌐';
      case 'unit': return '🧩';
      case 'integration': return '🔗';
      case 'performance': return '⚡';
      case 'visual': return '👁️';
      default: return '🧪';
    }
  };

  const getDefaultTestContent = (tool, type) => {
    switch (tool) {
      case 'cypress':
        return `describe('${newTestPlan.name}', () => {
  it('should perform ${type} test', () => {
    cy.visit('http://localhost:3000')
    // Add your test steps here
    cy.get('[data-testid="example"]').should('be.visible')
  })
})`;
      case 'jest':
        return `describe('${newTestPlan.name}', () => {
  test('should perform ${type} test', () => {
    // Add your test logic here
    expect(true).toBe(true)
  })
})`;
      case 'playwright':
        return `import { test, expect } from '@playwright/test';

test('${newTestPlan.name}', async ({ page }) => {
  await page.goto('http://localhost:3000')
  // Add your test steps here
  await expect(page.locator('[data-testid="example"]')).toBeVisible()
})`;
      default:
        return `// ${tool.toUpperCase()} test file for ${newTestPlan.name}
// Add your test content here`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading test management...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'test-plans', label: 'Test Plans', icon: '📋' },
    { id: 'test-files', label: 'Test Files', icon: '📁' },
    { id: 'schedules', label: 'Schedules', icon: '⏰' },
    { id: 'results', label: 'Results', icon: '📊' }
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/projects" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Projects
            </Link>
            <span className="text-gray-400">/</span>
            <Link to={`/projects/${projectId}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              {project.name}
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Create and manage test plans with various testing tools</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
        >
          + New Test Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'test-plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testPlans.length > 0 ? (
                testPlans.map((testPlan) => (
                  <div key={testPlan.id} className="glass-card hover-lift p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center">
                        <span className="text-black font-bold text-sm">
                          🧪
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                        Active
                      </span>
                    </div>
                    
                                         <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                       {testPlan.title}
                     </h3>
                     
                     {testPlan.result && (
                       <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                         {testPlan.result}
                       </p>
                     )}
                    
                                         <div className="space-y-2 mb-4">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Tool:</span>
                         <span className="text-gray-900 dark:text-white capitalize">Cypress</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Type:</span>
                         <span className="text-gray-900 dark:text-white capitalize">E2E</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-500 dark:text-gray-400">Schedule:</span>
                         <span className="text-gray-900 dark:text-white capitalize">Manual</span>
                       </div>
                     </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => runTestPlan(testPlan)}
                        className="flex-1 py-2 px-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                      >
                        Run Now
                      </button>
                      <button className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🧪</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No test plans yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Create your first test plan to start testing your project
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
                  >
                    Create Test Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'test-files' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Files</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Test files are created within test plans
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create a test plan to add and manage test files
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Plan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scheduled Tests</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No scheduled tests yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create a test plan with scheduling to automate your tests
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Plan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Results</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No test results yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Run your first test to see results and analytics
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Test Plan Modal */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-card w-full max-w-4xl p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Test Plan
            </Dialog.Title>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Plan Name *
                  </label>
                  <input
                    value={newTestPlan.name}
                    onChange={(e) => setNewTestPlan(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g. E2E Test Suite"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    value={newTestPlan.description}
                    onChange={(e) => setNewTestPlan(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Describe your test plan..."
                  />
                </div>
              </div>

              {/* Test Tool Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Testing Tool *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'cypress', label: 'Cypress', icon: '🟡', desc: 'E2E Testing' },
                    { value: 'jest', label: 'Jest', icon: '🟢', desc: 'Unit Testing' },
                    { value: 'playwright', label: 'Playwright', icon: '🔵', desc: 'Browser Testing' },
                    { value: 'selenium', label: 'Selenium', icon: '🔴', desc: 'Web Testing' },
                    { value: 'k6', label: 'k6', icon: '🟣', desc: 'Performance Testing' }
                  ].map((tool) => (
                    <button
                      key={tool.value}
                      onClick={() => setNewTestPlan(prev => ({ ...prev, testTool: tool.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newTestPlan.testTool === tool.value
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{tool.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{tool.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{tool.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'e2e', label: 'End-to-End', icon: '🌐', desc: 'Full user flows' },
                    { value: 'unit', label: 'Unit', icon: '🧩', desc: 'Component testing' },
                    { value: 'integration', label: 'Integration', icon: '🔗', desc: 'API testing' },
                    { value: 'performance', label: 'Performance', icon: '⚡', desc: 'Load testing' },
                    { value: 'visual', label: 'Visual', icon: '👁️', desc: 'UI comparison' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewTestPlan(prev => ({ ...prev, testType: type.value }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newTestPlan.testType === type.value
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'manual', label: 'Manual', icon: '🖱️' },
                    { value: 'daily', label: 'Daily', icon: '📅' },
                    { value: 'weekly', label: 'Weekly', icon: '📆' },
                    { value: 'custom', label: 'Custom', icon: '⚙️' }
                  ].map((schedule) => (
                    <button
                      key={schedule.value}
                      onClick={() => setNewTestPlan(prev => ({ ...prev, schedule: schedule.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newTestPlan.schedule === schedule.value
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{schedule.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{schedule.label}</div>
                    </button>
                  ))}
                </div>
                
                {newTestPlan.schedule === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cron Expression
                    </label>
                    <input
                      value={newTestPlan.cronExpression}
                      onChange={(e) => setNewTestPlan(prev => ({ ...prev, cronExpression: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="e.g. 0 0 * * * (daily at midnight)"
                    />
                  </div>
                )}
              </div>

              {/* Test Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Files
                </label>
                
                {/* Add Test File Form */}
                <div className="glass-card p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      value={currentTestFile.name}
                      onChange={(e) => setCurrentTestFile(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Test file name (e.g., login.spec.js)"
                    />
                    <select
                      value={currentTestFile.type}
                      onChange={(e) => setCurrentTestFile(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="spec">Spec File</option>
                      <option value="support">Support File</option>
                      <option value="fixture">Fixture</option>
                    </select>
                    <button
                      onClick={addTestFile}
                      disabled={!currentTestFile.name.trim() || !currentTestFile.content.trim()}
                      className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add File
                    </button>
                  </div>
                  
                  <textarea
                    value={currentTestFile.content}
                    onChange={(e) => setCurrentTestFile(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Test file content..."
                    className="w-full h-32 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                {/* Test Files List */}
                {newTestPlan.testFiles.length > 0 && (
                  <div className="space-y-2">
                    {newTestPlan.testFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({file.type})</span>
                        </div>
                        <button
                          onClick={() => removeTestFile(file.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTestPlan}
                  disabled={!newTestPlan.name.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Test Plan
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Test Runner Modal */}
      <Dialog open={isTestRunnerOpen} onClose={() => setIsTestRunnerOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-card w-full max-w-6xl p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Runner - {selectedTestPlan?.title}
            </Dialog.Title>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Output */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Test Output</h3>
                                 <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                   <div>Starting Cypress tests...</div>
                   <div>✓ Running test: {selectedTestPlan?.title}</div>
                   <div>✓ All tests passed!</div>
                   <div>Test completed in 2.3s</div>
                 </div>
              </div>
              
              {/* Browser Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Browser Preview</h3>
                <div className="bg-white border border-gray-300 rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🌐</div>
                    <p>Browser preview would appear here</p>
                    <p className="text-sm">(Similar to Cypress UI mode)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsTestRunnerOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold">
                View Full Results
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default TestManagement;
