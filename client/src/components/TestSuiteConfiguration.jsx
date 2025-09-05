import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  PlayIcon,
  CogIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const TestSuiteConfiguration = ({ folder, onBack, onRunTest }) => {
  const [testSuites, setTestSuites] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 [DEBUG] TestSuiteConfiguration loading for folder:', folder?.name);
    
    if (!folder) {
      console.log('❌ [DEBUG] No folder provided');
      setLoading(false);
      return;
    }
    
    try {
      // Load test suites for this folder
      let savedSuites = JSON.parse(localStorage.getItem(`testSuites_${folder.id}`) || '[]');
      
      // If no suites found, check if folder has testSuites property (from sample data)
      if (savedSuites.length === 0 && folder.testSuites && folder.testSuites.length > 0) {
        console.log('📁 [DEBUG] Using folder testSuites:', folder.testSuites.length);
        savedSuites = folder.testSuites;
      }
      
      console.log('✅ [DEBUG] Loaded test suites:', savedSuites.length);
      setTestSuites(savedSuites);
    } catch (error) {
      console.error('❌ [DEBUG] Error loading test suites:', error);
      setTestSuites([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  const handleRunTest = (suite) => {
    console.log('🚀 [DEBUG] Running test suite:', suite.name);
    if (onRunTest) {
      onRunTest(suite);
    }
  };

  if (!folder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Folder Selected</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a folder to view test suites.</p>
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Folders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading test suites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Folders
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {folder.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {folder.description || 'Test suite configuration'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Test Suite
            </button>
          </div>
        </div>

        {/* Test Suites List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Test Suites ({testSuites.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {testSuites.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No test suites</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new test suite.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Test Suite
                  </button>
                </div>
              </div>
            ) : (
              testSuites.map((suite) => (
                <div key={suite.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {suite.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          suite.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {suite.status || 'draft'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {suite.description || 'No description provided'}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-1" />
                          {suite.testType || 'API'}
                        </span>
                        <span className="flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          {suite.steps?.length || 0} steps
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {suite.lastModified ? new Date(suite.lastModified).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRunTest(suite)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <PlayIcon className="w-4 h-4 mr-1" />
                        Run Test
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuiteConfiguration;