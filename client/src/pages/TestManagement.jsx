// src/pages/TestManagement.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase, ENVIRONMENT } from '../lib/supabaseClient';
import TestFolderManager from '../components/TestFolderManager';
import TestSuiteConfiguration from '../components/TestSuiteConfiguration';
import AdvancedTestBuilderV2 from '../components/AdvancedTestBuilderV2';
import SimpleTestExecution from '../components/SimpleTestExecution';
import { 
  FolderIcon, 
  PlusIcon, 
  ChevronRightIcon,
  CogIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const TestManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folderId, projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState('folders'); // 'folders', 'folder', 'test'
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);
  const [savedTestRuns, setSavedTestRuns] = useState([]);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  // Fetch current project from URL params
  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (projectId && user?.id) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, description')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.warn('Project not found or table not available:', error);
            // Create a mock project for testing
            setCurrentProject({
              id: projectId,
              name: `Project ${projectId}`,
              description: 'Mock project for testing'
            });
          } else {
            setCurrentProject(data);
          }
        } catch (error) {
          console.warn('Could not fetch project:', error);
          setCurrentProject({
            id: projectId,
            name: `Project ${projectId}`,
            description: 'Mock project for testing'
          });
        }
      }
    };

    fetchCurrentProject();
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // If no projectId in URL, redirect to projects page
    if (!projectId) {
      console.log('❌ [DEBUG] No projectId in URL, redirecting to projects');
      navigate('/projects');
      return;
    }
    
    // Load saved test runs immediately
    loadSavedTestRuns();
    
    // Debug: Log current state
    console.log('🔍 [DEBUG] TestManagement useEffect:', {
      projectId,
      folderId,
      currentView,
      selectedFolder: selectedFolder?.name,
      currentProject: currentProject?.name
    });
    
    // Handle URL-based navigation
    if (folderId && !selectedFolder) {
      // Try to find folder by ID from localStorage
      const savedFolders = JSON.parse(localStorage.getItem('testFolders') || '[]');
      const folder = savedFolders.find(f => f.id === folderId);
      if (folder) {
        console.log('📁 [DEBUG] Found folder from URL:', folder.name);
        setSelectedFolder(folder);
        setCurrentView('folder');
      } else {
        console.log('❌ [DEBUG] Folder not found, going back to folders');
        if (currentProject?.id) {
          navigate(`/projects/${currentProject.id}/test-management`);
        } else {
          navigate('/projects');
        }
      }
    }
  }, [user, navigate, projectId, folderId, selectedFolder, currentProject]);

  // Listen for test run completion events
  useEffect(() => {
    const handleTestRunCompleted = () => {
      console.log('🔄 [TEST_MANAGEMENT] Test run completed, refreshing data...');
      loadSavedTestRuns();
    };

    window.addEventListener('testRunCompleted', handleTestRunCompleted);
    
    return () => {
      window.removeEventListener('testRunCompleted', handleTestRunCompleted);
    };
  }, []);

  const loadSavedTestRuns = () => {
    try {
      const savedRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      
      // Filter runs by current project if project is specified
      let filteredRuns = savedRuns;
      if (currentProject?.id) {
        filteredRuns = savedRuns.filter(run => run.projectId === currentProject.id);
        console.log('📊 [DEBUG] Filtered runs for project:', currentProject.name, filteredRuns.length);
      } else {
        console.log('📊 [DEBUG] No project filter, showing all runs:', savedRuns.length);
      }
      
      setSavedTestRuns(filteredRuns);
    } catch (error) {
      console.error('❌ [ERROR] Failed to load saved test runs:', error);
      setSavedTestRuns([]);
    }
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setCurrentView('folder');
    navigate(`/projects/${currentProject?.id}/test-management/${folder.id}`);
  };

  const handleTestSuiteSelect = (testSuite) => {
    setSelectedTestSuite(testSuite);
    setCurrentView('test');
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setSelectedTestSuite(null);
    setCurrentView('folders');
    navigate(`/projects/${currentProject?.id}/test-management`);
  };

  const handleBackToFolder = () => {
    setSelectedTestSuite(null);
    setCurrentView('folder');
    // Keep folder selected and URL intact
  };

  const handleDeleteTestRun = (runId) => {
    if (window.confirm('Are you sure you want to delete this test run?')) {
      try {
        const updatedRuns = savedTestRuns.filter(run => run.id !== runId);
        localStorage.setItem('testRunsV2', JSON.stringify(updatedRuns));
        setSavedTestRuns(updatedRuns);
        console.log('✅ [DEBUG] Test run deleted:', runId);
      } catch (error) {
        console.error('❌ [ERROR] Failed to delete test run:', error);
      }
    }
  };

  const handleEditTestRun = (testRun) => {
    // Navigate to test builder with the test run data
    navigate(`/projects/${currentProject?.id}/test-builder`, { state: { editTestRun: testRun } });
  };

  const handleCreateNew = (type) => {
    setShowCreateDropdown(false);
    switch (type) {
      case 'folder':
        // Handle folder creation
        break;
      case 'testPlan':
        // Handle test plan creation
        break;
      case 'testSuite':
        // Handle test suite creation
        break;
      default:
        break;
    }
  };

  // Template test plans
  const templateTestPlans = [
    {
      id: 'template_api_basic',
      name: 'Basic API Test Template',
      description: 'Template for basic API testing with GET/POST requests',
      type: 'API',
      icon: ChartBarIcon
    },
    {
      id: 'template_functional_basic',
      name: 'Basic Functional Test Template',
      description: 'Template for basic UI testing with navigation and interactions',
      type: 'Functional',
      icon: PlayIcon
    },
    {
      id: 'template_performance_basic',
      name: 'Basic Performance Test Template',
      description: 'Template for basic load testing with concurrent requests',
      type: 'Performance',
      icon: ClockIcon
    }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Clean and minimal with project context */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Test Management
                </h1>
                {currentProject && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <FolderIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {currentProject.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentProject 
                  ? `Manage test folders, suites, and execution results for ${currentProject.name}`
                  : 'Manage your test folders, suites, and execution results'
                }
              </p>
            </div>
            
            {/* Create New Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New
              </button>
              
              {showCreateDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => handleCreateNew('folder')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FolderIcon className="h-4 w-4 mr-3" />
                      New Folder
                    </button>
                    <button
                      onClick={() => handleCreateNew('testPlan')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-3" />
                      New Test Plan
                    </button>
                    <button
                      onClick={() => handleCreateNew('testSuite')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <CogIcon className="h-4 w-4 mr-3" />
                      New Test Suite
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Saved Test Runs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                  Recent Test Runs
                </h2>
              </div>
              <div className="p-4">
                {savedTestRuns.length === 0 ? (
                  <div className="text-center py-6">
                    <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No test runs yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTestRuns.slice(0, 8).map((run) => (
                      <div key={run.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {run.testSuite?.name || 'Unknown Test'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {run.testSuite?.testType || 'Unknown'} • {run.executedAt ? new Date(run.executedAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                            <div className="flex items-center mt-2">
                              {run.success ? (
                                <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                              ) : (
                                <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                              )}
                              <span className={`text-xs ${run.success ? 'text-green-600' : 'text-red-600'}`}>
                                {run.passedSteps || 0}/{run.totalSteps || 0} passed
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEditTestRun(run)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestRun(run.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Template Test Plans */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                  Template Test Plans
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {templateTestPlans.map((template) => {
                    const IconComponent = template.icon;
                    return (
                      <div key={template.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                            <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {currentView === 'folders' && (
              <TestFolderManager 
                onFolderSelect={handleFolderSelect}
                onCreateFolder={() => {}}
                onTestSuiteSelect={handleTestSuiteSelect}
              />
            )}
            
            {currentView === 'folder' && selectedFolder && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToFolders}
                      className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedFolder.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedFolder.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <TestSuiteConfiguration 
                  folder={selectedFolder}
                  onTestSuiteSelect={handleTestSuiteSelect}
                  onRunTest={handleTestSuiteSelect}
                  onBack={handleBackToFolders}
                />
              </div>
            )}
            
            {currentView === 'test' && selectedTestSuite && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToFolder}
                      className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedTestSuite.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTestSuite.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <SimpleTestExecution 
                  testSuite={selectedTestSuite}
                  onComplete={() => {
                    loadSavedTestRuns(); // Refresh saved runs
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;