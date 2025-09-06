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
  const [editingSuite, setEditingSuite] = useState(null);
  const [newSuite, setNewSuite] = useState({
    name: '',
    description: '',
    testType: 'API',
    toolId: 'axios',
    baseUrl: '',
    userStories: [],
    steps: []
  });

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

  const handleEditSuite = (suite) => {
    console.log('✏️ [DEBUG] Editing test suite:', suite.name);
    setEditingSuite(suite);
    setNewSuite({
      name: suite.name,
      description: suite.description,
      testType: suite.testType,
      toolId: suite.toolId,
      baseUrl: suite.baseUrl,
      userStories: suite.userStories || [],
      steps: suite.steps || []
    });
    setShowCreateForm(true);
  };

  const saveTestSuite = () => {
    if (!newSuite.name.trim()) {
      alert('Please enter a test suite name');
      return;
    }

    const suite = {
      ...newSuite,
      id: editingSuite ? editingSuite.id : `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      folderId: folder.id,
      createdAt: editingSuite ? editingSuite.createdAt : new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'active'
    };

    let updatedSuites;
    if (editingSuite) {
      updatedSuites = testSuites.map(s => s.id === editingSuite.id ? suite : s);
    } else {
      updatedSuites = [...testSuites, suite];
    }

    setTestSuites(updatedSuites);
    localStorage.setItem(`testSuites_${folder.id}`, JSON.stringify(updatedSuites));
    
    setShowCreateForm(false);
    setEditingSuite(null);
    setNewSuite({
      name: '',
      description: '',
      testType: 'API',
      toolId: 'axios',
      baseUrl: '',
      userStories: [],
      steps: []
    });
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
                        onClick={() => handleEditSuite(suite)}
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

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingSuite ? 'Edit Test Suite' : 'Create New Test Suite'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Suite Name *
                </label>
                <input
                  type="text"
                  value={newSuite.name}
                  onChange={(e) => setNewSuite({...newSuite, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., User Authentication API Tests"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newSuite.description}
                  onChange={(e) => setNewSuite({...newSuite, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Describe what this test suite validates..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Type
                  </label>
                  <select
                    value={newSuite.testType}
                    onChange={(e) => setNewSuite({...newSuite, testType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="API">API Testing</option>
                    <option value="Functional">Functional Testing</option>
                    <option value="Performance">Performance Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tool
                  </label>
                  <select
                    value={newSuite.toolId}
                    onChange={(e) => setNewSuite({...newSuite, toolId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="axios">Axios (API)</option>
                    <option value="puppeteer">Puppeteer (Functional)</option>
                    <option value="k6">k6 (Performance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={newSuite.baseUrl}
                  onChange={(e) => setNewSuite({...newSuite, baseUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://api.example.com"
                />
              </div>

              {/* Steps Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Test Steps ({newSuite.steps.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newStep = {
                        id: Date.now(),
                        name: `Step ${newSuite.steps.length + 1}`,
                        type: 'api',
                        description: '',
                        config: {}
                      };
                      setNewSuite({
                        ...newSuite,
                        steps: [...newSuite.steps, newStep]
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                  >
                    <PlusIcon className="w-3 h-3 mr-1" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-3">
                  {newSuite.steps.map((step, index) => (
                    <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Step {index + 1}: {step.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSteps = newSuite.steps.filter(s => s.id !== step.id);
                            setNewSuite({ ...newSuite, steps: updatedSteps });
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Step Name
                          </label>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => {
                              const updatedSteps = newSuite.steps.map(s => 
                                s.id === step.id ? { ...s, name: e.target.value } : s
                              );
                              setNewSuite({ ...newSuite, steps: updatedSteps });
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Step Type
                          </label>
                          <select
                            value={step.type}
                            onChange={(e) => {
                              const updatedSteps = newSuite.steps.map(s => 
                                s.id === step.id ? { ...s, type: e.target.value, config: {} } : s
                              );
                              setNewSuite({ ...newSuite, steps: updatedSteps });
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="api">API Request</option>
                            <option value="interaction">UI Interaction</option>
                            <option value="assertion">Assertion</option>
                            <option value="navigation">Navigation</option>
                            <option value="loadTest">Load Test</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => {
                            const updatedSteps = newSuite.steps.map(s => 
                              s.id === step.id ? { ...s, description: e.target.value } : s
                            );
                            setNewSuite({ ...newSuite, steps: updatedSteps });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Describe what this step does..."
                        />
                      </div>

                      {/* Step Configuration based on type */}
                      {step.type === 'api' && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Method
                            </label>
                            <select
                              value={step.config.method || 'GET'}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, method: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              URL Path
                            </label>
                            <input
                              type="text"
                              value={step.config.url || ''}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, url: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="/api/users"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Expected Status
                            </label>
                            <input
                              type="number"
                              value={step.config.expectedStatus || 200}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, expectedStatus: parseInt(e.target.value) } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'interaction' && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Selector
                            </label>
                            <input
                              type="text"
                              value={step.config.selector || ''}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, selector: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="button[type='submit']"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Action
                            </label>
                            <select
                              value={step.config.action || 'click'}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, action: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="click">Click</option>
                              <option value="type">Type</option>
                              <option value="hover">Hover</option>
                              <option value="select">Select</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={step.config.value || ''}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, value: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Text to type or select"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'assertion' && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Selector
                            </label>
                            <input
                              type="text"
                              value={step.config.selector || ''}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, selector: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="h1, .error-message, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Assertion
                            </label>
                            <select
                              value={step.config.assertion || 'visible'}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, assertion: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="visible">Visible</option>
                              <option value="exists">Exists</option>
                              <option value="contains">Contains Text</option>
                              <option value="equals">Equals Text</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {step.type === 'loadTest' && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={step.config.duration || '10s'}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, duration: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="10s"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Users
                            </label>
                            <input
                              type="number"
                              value={step.config.users || 5}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, users: parseInt(e.target.value) } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Ramp Up
                            </label>
                            <input
                              type="text"
                              value={step.config.rampUpTime || '2s'}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, rampUpTime: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="2s"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              URL Path
                            </label>
                            <input
                              type="text"
                              value={step.config.url || ''}
                              onChange={(e) => {
                                const updatedSteps = newSuite.steps.map(s => 
                                  s.id === step.id ? { 
                                    ...s, 
                                    config: { ...s.config, url: e.target.value } 
                                  } : s
                                );
                                setNewSuite({ ...newSuite, steps: updatedSteps });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="/api/posts"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSuite(null);
                    setNewSuite({
                      name: '',
                      description: '',
                      testType: 'API',
                      toolId: 'axios',
                      baseUrl: '',
                      userStories: [],
                      steps: []
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTestSuite}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingSuite ? 'Update Test Suite' : 'Create Test Suite'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSuiteConfiguration;