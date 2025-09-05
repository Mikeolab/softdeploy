import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  PlusIcon, 
  ChevronRightIcon,
  CogIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const TestFolderManager = ({ onFolderSelect, onCreateFolder }) => {
  const [folders, setFolders] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  useEffect(() => {
    // Load folders from localStorage
    let savedFolders = JSON.parse(localStorage.getItem('testFolders') || '[]');
    
    // Debug: Force create sample folders if none exist
    if (savedFolders.length === 0) {
      console.log('🔧 [DEBUG] No folders found, creating sample data...');
      savedFolders = createSampleFolders();
      
      // Save sample folders to localStorage
      localStorage.setItem('testFolders', JSON.stringify(savedFolders));
      console.log('✅ [DEBUG] Sample folders created and saved:', savedFolders.length);
    } else {
      console.log('📁 [DEBUG] Found existing folders:', savedFolders.length);
    }
    
    setFolders(savedFolders);
  }, []);

  // Function to create sample folders
  const createSampleFolders = () => {
    return [
      {
        id: "folder_demo_api_tests",
        name: "API Testing Suite",
        description: "Comprehensive API testing for various endpoints - PRODUCTION TESTED ✅",
        createdAt: new Date().toISOString(),
        testSuites: [
          {
            id: "suite_jsonplaceholder",
            name: "JSONPlaceholder API Tests",
            description: "Testing CRUD operations on posts endpoint - PRODUCTION TESTED ✅",
            testType: "API",
            toolId: "axios",
            baseUrl: "https://jsonplaceholder.typicode.com",
            steps: [
              {
                name: "Get All Posts",
                type: "api",
                description: "Retrieve all posts from the API",
                config: {
                  method: "GET",
                  url: "/posts",
                  validation: {
                    statusCode: 200,
                    responseTime: 5000
                  }
                }
              },
              {
                name: "Get Single Post",
                type: "api",
                description: "Retrieve a specific post by ID",
                config: {
                  method: "GET",
                  url: "/posts/1",
                  validation: {
                    statusCode: 200,
                    responseTime: 3000
                  }
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          },
          {
            id: "suite_tcall_api",
            name: "Tcall.ai API Tests",
            description: "Testing Tcall.ai authentication and endpoints",
            testType: "API",
            toolId: "axios",
            baseUrl: "https://api.tcall.ai",
            steps: [
              {
                name: "Login Test",
                type: "api",
                description: "Test user login",
                config: {
                  method: "POST",
                  url: "/auth/login",
                  headers: {"Content-Type": "application/json"},
                  body: {"email": "test@example.com", "password": "testpassword123"},
                  validation: {"statusCode": 200, "responseTime": 2000}
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          }
        ],
        status: "active"
      },
      {
        id: "folder_demo_functional_tests",
        name: "Functional Testing Suite",
        description: "Browser automation and UI testing - PRODUCTION TESTED ✅",
        createdAt: new Date().toISOString(),
        testSuites: [
          {
            id: "suite_simple_navigation",
            name: "Simple Navigation Test",
            description: "Test basic navigation functionality - PRODUCTION TESTED ✅",
            testType: "Functional",
            toolId: "puppeteer",
            baseUrl: "https://jsonplaceholder.typicode.com",
            steps: [
              {
                name: "Navigate to API",
                type: "navigation",
                description: "Navigate to JSONPlaceholder API",
                config: {
                  url: "https://jsonplaceholder.typicode.com"
                }
              },
              {
                name: "Check Page Loads",
                type: "assertion",
                description: "Verify page loads successfully",
                config: {
                  selector: "body, html, pre",
                  assertion: "visible"
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          },
          {
            id: "suite_google_search",
            name: "Google Search Test",
            description: "Test Google search functionality",
            testType: "Functional",
            toolId: "puppeteer",
            baseUrl: "https://www.google.com",
            steps: [
              {
                name: "Search Test",
                type: "interaction",
                description: "Search for SoftDeploy",
                config: {
                  selector: "input[name='q']",
                  action: "type",
                  value: "SoftDeploy testing platform"
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          }
        ],
        status: "active"
      },
      {
        id: "folder_demo_performance_tests",
        name: "Performance Testing Suite",
        description: "Load testing and performance monitoring - PRODUCTION TESTED ✅",
        createdAt: new Date().toISOString(),
        testSuites: [
          {
            id: "suite_load_test",
            name: "API Load Test",
            description: "Load testing API endpoints - PRODUCTION TESTED ✅",
            testType: "Performance",
            toolId: "inbuilt",
            baseUrl: "https://jsonplaceholder.typicode.com",
            steps: [
              {
                name: "Load Test",
                type: "loadTest",
                description: "Test posts endpoint under load",
                config: {
                  url: "/posts",
                  method: "GET",
                  duration: "10s",
                  users: 5,
                  rampUpTime: 2
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          }
        ],
        status: "active"
      },
      {
        id: "folder_demo_e2e_tests",
        name: "E2E Testing Suite",
        description: "End-to-end testing scenarios",
        createdAt: new Date().toISOString(),
        testSuites: [
          {
            id: "suite_user_registration",
            name: "User Registration Flow",
            description: "Complete user registration and login flow",
            testType: "Functional",
            toolId: "puppeteer",
            baseUrl: "https://devops-real-app-staging.onrender.com",
            steps: [
              {
                name: "Navigate to App",
                type: "navigation",
                description: "Navigate to the application",
                config: {
                  url: "https://devops-real-app-staging.onrender.com"
                }
              },
              {
                name: "Check Login Page",
                type: "assertion",
                description: "Verify login page loads",
                config: {
                  selector: "input[type='email']",
                  assertion: "visible"
                }
              }
            ],
            createdAt: new Date().toISOString(),
            status: "active"
          }
        ],
        status: "active"
      }
    ];
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newFolderName.trim(),
      description: newFolderDescription.trim(),
      createdAt: new Date().toISOString(),
      testSuites: [],
      status: 'active'
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('testFolders', JSON.stringify(updatedFolders));

    setNewFolderName('');
    setNewFolderDescription('');
    setShowCreateForm(false);
    
    // Navigate to the new folder
    onFolderSelect(newFolder);
  };

  const deleteFolder = (folderId, e) => {
    e.stopPropagation();
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem('testFolders', JSON.stringify(updatedFolders));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Test Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your tests into folders and suites
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create Folder
        </button>
        
        {/* Debug Button */}
        <button
          onClick={() => {
            console.log('🔧 [DEBUG] Force refreshing sample data...');
            const sampleFolders = createSampleFolders();
            localStorage.setItem('testFolders', JSON.stringify(sampleFolders));
            setFolders(sampleFolders);
            console.log('✅ [DEBUG] Sample data refreshed:', sampleFolders.length);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔧 Debug: Refresh Sample Data
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Test Folder
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., API Tests, E2E Tests, Performance Tests"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Describe what this folder contains..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FolderIcon className="h-5 w-5" />
                Create Folder
              </button>
              
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderSelect(folder)}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => deleteFolder(folder.id, e)}
              className="absolute top-3 right-3 p-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete folder"
            >
              <TrashIcon className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {folder.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {folder.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {folder.testSuites.length} test suites
                  </span>
                  <span>
                    Created {new Date(folder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  folder.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {folder.status}
                </span>
              </div>
              
              <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {folders.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No test folders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first test folder to organize your test suites
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Folder
          </button>
        </div>
      )}
      
      {/* Saved Tests Section */}
        {(() => {
          const savedTests = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
          if (savedTests.length > 0) {
            return (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Saved Test Runs ({savedTests.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedTests.map((test, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {test.testSuiteName || `Test Run ${index + 1}`}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {test.success ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {test.testType || 'Unknown'} • {test.totalSteps || 0} steps
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{test.passedSteps || 0}/{test.totalSteps || 0} passed</span>
                        <span>{test.totalTime ? `${test.totalTime}ms` : 'Unknown time'}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {test.timestamp ? new Date(test.timestamp).toLocaleString() : 'Unknown date'}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            // Navigate to test execution with this test data
                            console.log('🚀 [DEBUG] Running saved test:', test.testSuiteName);
                            // You can implement navigation to test execution here
                          }}
                          className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Run Again
                        </button>
                        <button
                          onClick={() => {
                            // Delete this test run
                            const updatedTests = savedTests.filter((_, i) => i !== index);
                            localStorage.setItem('testRunsV2', JSON.stringify(updatedTests));
                            // Refresh the component
                            window.location.reload();
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}
    </div>
  );
};

export default TestFolderManager;
