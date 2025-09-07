// src/pages/TestManagement.jsx - FULL VERSION
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  PlusIcon, 
  PlayIcon,
  FolderIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const TestManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState({
    suites: [],
    cases: [],
    runs: []
  });

  // Load project and test data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!projectId) {
      console.log('No projectId, redirecting to projects');
      navigate('/projects');
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, description')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();
          
          if (error) {
          console.error('Project fetch error:', error);
          navigate('/projects');
          return;
        }

        setCurrentProject(data);
        loadTestData();
      } catch (err) {
        console.error('Project fetch failed:', err);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId, navigate]);

  // Load test data from localStorage
  const loadTestData = () => {
    try {
      const savedTestRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      const projectRuns = savedTestRuns.filter(run => run.projectId === projectId);
      
      // Generate project-specific test suites and cases
      const projectSpecificSuites = generateProjectSpecificSuites(projectId, currentProject?.name);
      const projectSpecificCases = generateProjectSpecificCases(projectId, projectSpecificSuites);

      setTestData({
        suites: projectSpecificSuites,
        cases: projectSpecificCases,
        runs: projectRuns
      });
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  // Generate project-specific test suites
  const generateProjectSpecificSuites = (projectId, projectName) => {
    const projectKey = projectId.substring(0, 8); // Use first 8 chars as key
    
    const suiteTemplates = {
      'ecommerce': [
        { name: 'Payment Processing', description: 'Test payment flows and transactions', testCount: 4 },
        { name: 'Product Catalog', description: 'Test product listing and search', testCount: 3 },
        { name: 'User Accounts', description: 'Test user registration and login', testCount: 5 }
      ],
      'testlab': [
        { name: 'API Endpoints', description: 'Test REST API functionality', testCount: 6 },
        { name: 'Database Operations', description: 'Test data persistence and queries', testCount: 4 },
        { name: 'Authentication', description: 'Test user authentication flows', testCount: 3 }
      ],
      'newproject': [
        { name: 'Core Features', description: 'Test main application features', testCount: 5 },
        { name: 'Integration Tests', description: 'Test external service integrations', testCount: 3 },
        { name: 'Performance Tests', description: 'Test application performance', testCount: 2 }
      ]
    };

    // Default suites if project name doesn't match
    const defaultSuites = [
      { name: 'API Tests', description: 'Test API endpoints and responses', testCount: 4 },
      { name: 'UI Tests', description: 'Test user interface components', testCount: 3 },
      { name: 'Integration Tests', description: 'Test system integrations', testCount: 2 }
    ];

    const suites = suiteTemplates[projectName?.toLowerCase()] || defaultSuites;
    
    return suites.map((suite, index) => ({
      id: `${projectKey}-suite-${index + 1}`,
      name: suite.name,
      description: suite.description,
      testCount: suite.testCount,
      lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last week
    }));
  };

  // Generate project-specific test cases
  const generateProjectSpecificCases = (projectId, suites) => {
    const projectKey = projectId.substring(0, 8);
    const cases = [];

    suites.forEach((suite, suiteIndex) => {
      for (let i = 0; i < suite.testCount; i++) {
        const caseNames = [
          'User Authentication',
          'Data Validation', 
          'API Response Handling',
          'Error Handling',
          'Performance Check',
          'Security Validation',
          'Integration Test',
          'UI Component Test'
        ];

        cases.push({
          id: `${projectKey}-case-${suiteIndex}-${i + 1}`,
          suiteId: suite.id,
          name: caseNames[i % caseNames.length],
          status: Math.random() > 0.3 ? 'passed' : 'failed', // 70% pass rate
          duration: Math.floor(Math.random() * 2000) + 500 // 500-2500ms
        });
      }
    });

    return cases;
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleCreateTestSuite = () => {
    navigate(`/projects/${projectId}/test-builder`);
  };

  const handleRunTest = (suiteId) => {
    console.log('Running test suite:', suiteId);
    // Add test execution logic here
  };

  const handleEditTestRun = (runId) => {
    navigate(`/projects/${projectId}/test-builder?edit=${runId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test management...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={handleBackToProjects}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToProjects}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Test Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentProject.name}
                </p>
              </div>
            </div>
              <button
              onClick={handleCreateTestSuite}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
              Create Test Suite
                    </button>
                  </div>
                </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <FolderIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Suites</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{testData.suites.length}</p>
              </div>
          </div>
        </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <PlayIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Cases</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{testData.cases.length}</p>
              </div>
                            </div>
                          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Runs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{testData.runs.length}</p>
              </div>
              </div>
            </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {testData.runs.length > 0 ? 
                    `${Math.round((testData.runs.filter(run => run.success).length / testData.runs.length) * 100)}%` : 
                    '-'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Suites */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Test Suites</h2>
          </div>
          <div className="p-6">
            {testData.suites.length > 0 ? (
              <div className="space-y-4">
                {testData.suites.map((suite) => (
                  <div key={suite.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <FolderIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{suite.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{suite.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{suite.testCount} tests</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleRunTest(suite.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                    >
                        <PlayIcon className="h-3 w-3 mr-1" />
                        Run
                    </button>
                    </div>
                  </div>
                ))}
                </div>
            ) : (
              <div className="text-center py-8">
                <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No test suites yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first test suite to get started</p>
                <button
                  onClick={handleCreateTestSuite}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Test Suite
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Test Runs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Test Runs</h2>
          </div>
          <div className="p-6">
            {testData.runs.length > 0 ? (
              <div className="space-y-4">
                {testData.runs.slice(0, 5).map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      {run.success ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
                      )}
              <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {run.testSuite?.name || 'Unknown Test'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {run.totalSteps || 0} steps • {run.totalTime || 0}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        run.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {run.success ? 'Passed' : 'Failed'}
                      </span>
                    <button
                        onClick={() => handleEditTestRun(run.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <CogIcon className="h-4 w-4" />
                    </button>
                    </div>
                  </div>
                ))}
                </div>
            ) : (
              <div className="text-center py-8">
                <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No test runs yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Run your first test to see results here</p>
                <button
                  onClick={handleCreateTestSuite}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Testing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;