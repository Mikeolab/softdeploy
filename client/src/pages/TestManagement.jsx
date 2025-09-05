// src/pages/TestManagement.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// Removed unused testRunner import - using AdvancedTestBuilderV2 instead
import { Dialog } from '@headlessui/react';
import AdvancedTestBuilderV2 from '../components/AdvancedTestBuilderV2';
import { 
  PlusIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  DocumentTextIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  BeakerIcon,
  CodeBracketIcon,
  ServerIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

function TestManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  // ===== Data state =====
  const [project, setProject] = useState(null);
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('test-suites');

  // ===== Modal state =====
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);
  const [modalMode, setModalMode] = useState('traditional'); // 'traditional' or 'user-story'
  const [newTestSuite, setNewTestSuite] = useState({
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

      // Fetch test suites (using test_plans table for now)
      const { data: testData, error: testError } = await supabase
        .from('test_plans')
        .select('id, title, result, owner_name, ran_at')
        .eq('user_id', user.id)
        .order('ran_at', { ascending: false });

      if (testError) {
        console.error('Test suites fetch error:', testError);
        setTestSuites([]);
      } else {
        setTestSuites(testData || []);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestSuite = async () => {
    if (!newTestSuite.name.trim()) return;

    try {
      const testSuite = {
        user_id: user.id,
        title: newTestSuite.name.trim(),
        result: newTestSuite.description.trim(),
        owner_name: user.user_metadata?.full_name || user.email,
        ran_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('test_plans')
        .insert([testSuite])
        .select();

      if (error) throw error;
      
      setTestSuites(prev => [data[0], ...prev]);
      setNewTestSuite({
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
      console.error('Error creating test suite:', error);
      alert('Failed to create test suite');
    }
  };

  const addTestFile = () => {
    if (!currentTestFile.name.trim()) return;

    // Auto-generate test content if empty
    let content = currentTestFile.content;
    if (!content.trim()) {
      content = testRunner.generateTestContent(
        newTestSuite.testTool,
        newTestSuite.testType,
        currentTestFile.name.replace('.spec.js', '').replace('.test.js', '')
      );
    }

    const testFile = {
      id: Date.now(),
      name: currentTestFile.name,
      type: currentTestFile.type,
      content: content
    };

    setNewTestSuite(prev => ({
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
    setNewTestSuite(prev => ({
      ...prev,
      testFiles: prev.testFiles.filter(file => file.id !== fileId)
    }));
  };

  const runTestSuite = async (testSuite) => {
    setSelectedTestSuite(testSuite);
    setIsTestRunnerOpen(true);
    
    // Simulate running the first test file
    if (testSuite.testFiles && testSuite.testFiles.length > 0) {
      const testFile = testSuite.testFiles[0];
      const result = await testRunner.runTest(testSuite, testFile);
      
      // Update the test suite with results
      console.log('Test result:', result);
      
      // You could store results in the database here
      // For now, we'll just show the output in the modal
    }
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
    { id: 'test-suites', label: 'Test Suites', icon: FolderIcon },
    { id: 'user-stories', label: 'User Stories', icon: DocumentTextIcon },
    { id: 'test-cases', label: 'Test Cases', icon: DocumentTextIcon },
    { id: 'test-runs', label: 'Test Runs', icon: BoltIcon },
    { id: 'test-reports', label: 'Test Reports', icon: ChartBarIcon },
    { id: 'settings', label: 'Settings', icon: CpuChipIcon }
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
          <p className="text-gray-600 dark:text-gray-300">Create and manage test suites with various testing tools</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
        >
          + New Test Suite
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
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'test-suites' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testSuites.length > 0 ? (
                testSuites.map((testSuite) => (
                  <div key={testSuite.id} className="glass-card hover-lift p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center">
                        <span className="text-black font-bold text-sm">
                          🧪
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => runTestSuite(testSuite)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                          title="Run Test Suite"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Edit Test Suite"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          title="Delete Test Suite"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {testSuite.title}
                    </h3>
                    
                    {testSuite.result && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {testSuite.result}
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
                        onClick={() => runTestSuite(testSuite)}
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
                    No test suites yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Create your first test suite to start testing your project
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
                  >
                    Create Test Suite
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'user-stories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Stories</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                + New User Story Test
              </button>
            </div>
            
                                       <div className="glass-card p-6 rounded-xl">
                <AdvancedTestBuilderV2 projectName={project?.name} />
              </div>
          </div>
        )}

        {activeTab === 'test-cases' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Cases</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Test cases are created within test suites
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create a test suite to add and manage individual test cases
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Suite
              </button>
            </div>
          </div>
        )}

        {activeTab === 'test-runs' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Runs</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No test runs yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Run your first test suite to see execution history and results
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Suite
              </button>
            </div>
          </div>
        )}

        {activeTab === 'test-reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Reports</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No test reports yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Run your first test to see detailed reports and analytics
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Test Suite
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Integrations */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 grid place-items-center">
                    <GlobeAltIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Version Control */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Version Control</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 dark:text-orange-400 font-bold">🐙</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">GitHub</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Connect your GitHub repositories</div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                          Connect →
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 dark:text-orange-400 font-bold">🦊</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">GitLab</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Integrate with GitLab pipelines</div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                          Connect →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Platforms */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cloud Platforms</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-400 font-bold">☁️</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">AWS</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Deploy to AWS services</div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                          Connect →
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">🔵</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Google Cloud</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Deploy to Google Cloud</div>
                          </div>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                          Connect →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-400 grid place-items-center">
                    <CpuChipIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">General</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={project.name}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Default Test Tool
                        </label>
                        <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white">
                          <option value="inbuilt">Inbuilt Test Runner</option>
                          <option value="cypress">Cypress</option>
                          <option value="playwright">Playwright</option>
                          <option value="selenium">Selenium</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Test Suite Modal */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-card w-full max-w-4xl p-6 rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex-shrink-0">
              Create New Test Suite
            </Dialog.Title>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 flex-shrink-0">
              <button
                onClick={() => setModalMode('traditional')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  modalMode === 'traditional'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Traditional Test Creation
              </button>
              <button
                onClick={() => setModalMode('user-story')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  modalMode === 'user-story'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                User Story Automation
              </button>
            </div>
            
            {modalMode === 'traditional' ? (
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Suite Name *
                    </label>
                    <input
                      value={newTestSuite.name}
                      onChange={(e) => setNewTestSuite(prev => ({ ...prev, name: e.target.value }))}
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
                      value={newTestSuite.description}
                      onChange={(e) => setNewTestSuite(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Describe your test suite..."
                    />
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Configuration</h4>
                  
                  {/* Test Tool Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Testing Tool
                    </label>
                    <select
                      value={newTestSuite.testTool}
                      onChange={(e) => {
                        const newTool = e.target.value;
                        setNewTestSuite(prev => ({ ...prev, testTool: newTool }));
                        
                        // Auto-generate content for existing test files
                        if (newTestSuite.testFiles.length > 0) {
                          const updatedFiles = newTestSuite.testFiles.map(file => ({
                            ...file,
                            content: testRunner.generateTestContent(
                              newTool,
                              newTestSuite.testType,
                              file.name.replace('.spec.js', '').replace('.test.js', '')
                            )
                          }));
                          setNewTestSuite(prev => ({ ...prev, testFiles: updatedFiles }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="cypress">Cypress - E2E Testing</option>
                      <option value="jest">Jest - Unit Testing</option>
                      <option value="playwright">Playwright - Browser Testing</option>
                      <option value="selenium">Selenium - Web Testing</option>
                      <option value="k6">k6 - Performance Testing</option>
                    </select>
                  </div>

                  {/* Test Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Type
                    </label>
                    <select
                      value={newTestSuite.testType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setNewTestSuite(prev => ({ ...prev, testType: newType }));
                        
                        // Auto-generate content for existing test files
                        if (newTestSuite.testFiles.length > 0) {
                          const updatedFiles = newTestSuite.testFiles.map(file => ({
                            ...file,
                            content: testRunner.generateTestContent(
                              newTestSuite.testTool,
                              newType,
                              file.name.replace('.spec.js', '').replace('.test.js', '')
                            )
                          }));
                          setNewTestSuite(prev => ({ ...prev, testFiles: updatedFiles }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="e2e">End-to-End Testing</option>
                      <option value="unit">Unit Testing</option>
                      <option value="integration">Integration Testing</option>
                      <option value="performance">Performance Testing</option>
                      <option value="visual">Visual Testing</option>
                    </select>
                  </div>

                  {/* Schedule Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule
                    </label>
                    <select
                      value={newTestSuite.schedule}
                      onChange={(e) => setNewTestSuite(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="manual">Manual - Run on demand</option>
                      <option value="daily">Daily - Run every day</option>
                      <option value="weekly">Weekly - Run every week</option>
                      <option value="custom">Custom - Cron expression</option>
                    </select>
                  </div>

                  {/* Custom Cron Expression */}
                  {newTestSuite.schedule === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cron Expression
                      </label>
                      <input
                        type="text"
                        value={newTestSuite.cronExpression}
                        onChange={(e) => setNewTestSuite(prev => ({ ...prev, cronExpression: e.target.value }))}
                        placeholder="e.g. 0 0 * * * (daily at midnight)"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                        disabled={!currentTestFile.name.trim()}
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
                  {newTestSuite.testFiles.length > 0 && (
                    <div className="space-y-2">
                      {newTestSuite.testFiles.map((file) => (
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
              </div>
            ) : (
                                             <div className="space-y-6 flex-1 overflow-y-auto">
                  <AdvancedTestBuilderV2 projectName={project?.name} />
                </div>
            )}
            
            <div className="flex gap-3 pt-4 flex-shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {modalMode === 'traditional' && (
                <button
                  onClick={handleCreateTestSuite}
                  disabled={!newTestSuite.name.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Test Suite
                </button>
              )}
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
              Test Runner - {selectedTestSuite?.title}
            </Dialog.Title>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Output */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Test Output</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                  {selectedTestSuite?.testFiles && selectedTestSuite.testFiles.length > 0 ? (
                    <div>
                      <div>Starting {selectedTestSuite.testTool || 'Cypress'} tests...</div>
                      <div>✓ Running test: {selectedTestSuite.testFiles[0].name}</div>
                      <div>✓ Test file loaded successfully</div>
                      <div>✓ Browser launched</div>
                      <div>✓ Navigated to test URL</div>
                      <div>✓ All assertions passed</div>
                      <div>Test completed in 2.3s</div>
                    </div>
                  ) : (
                    <div>
                      <div>No test files found in this suite</div>
                      <div>Add test files to run tests</div>
                    </div>
                  )}
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
