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
    // Load test suites for this folder
    const savedSuites = JSON.parse(localStorage.getItem(`testSuites_${folder.id}`) || '[]');
    setTestSuites(savedSuites);
  }, [folder.id]);

  const saveTestSuite = () => {
    if (!newSuite.name.trim()) return;

    const suite = {
      ...newSuite,
      id: editingSuite ? editingSuite.id : `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      folderId: folder.id,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'draft'
    };

    let updatedSuites;
    if (editingSuite) {
      updatedSuites = testSuites.map(s => s.id === editingSuite.id ? suite : s);
    } else {
      updatedSuites = [...testSuites, suite];
    }

    setTestSuites(updatedSuites);
    localStorage.setItem(`testSuites_${folder.id}`, JSON.stringify(updatedSuites));

    // Reset form
    setNewSuite({
      name: '',
      description: '',
      testType: 'API',
      toolId: 'axios',
      baseUrl: '',
      userStories: [],
      steps: []
    });
    setShowCreateForm(false);
    setEditingSuite(null);
  };

  const editTestSuite = (suite) => {
    setNewSuite(suite);
    setEditingSuite(suite);
    setShowCreateForm(true);
  };

  const deleteTestSuite = (suiteId) => {
    const updatedSuites = testSuites.filter(s => s.id !== suiteId);
    setTestSuites(updatedSuites);
    localStorage.setItem(`testSuites_${folder.id}`, JSON.stringify(updatedSuites));
  };

  const addUserStory = () => {
    setNewSuite(prev => ({
      ...prev,
      userStories: [...prev.userStories, {
        id: `story_${Date.now()}`,
        title: '',
        description: '',
        acceptanceCriteria: [],
        priority: 'medium'
      }]
    }));
  };

  const updateUserStory = (storyId, field, value) => {
    setNewSuite(prev => ({
      ...prev,
      userStories: prev.userStories.map(story => 
        story.id === storyId ? { ...story, [field]: value } : story
      )
    }));
  };

  const addAcceptanceCriteria = (storyId) => {
    setNewSuite(prev => ({
      ...prev,
      userStories: prev.userStories.map(story => 
        story.id === storyId 
          ? { ...story, acceptanceCriteria: [...story.acceptanceCriteria, ''] }
          : story
      )
    }));
  };

  const updateAcceptanceCriteria = (storyId, index, value) => {
    setNewSuite(prev => ({
      ...prev,
      userStories: prev.userStories.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              acceptanceCriteria: story.acceptanceCriteria.map((criteria, i) => 
                i === index ? value : criteria
              )
            }
          : story
      )
    }));
  };

  const addTestStep = () => {
    setNewSuite(prev => ({
      ...prev,
      steps: [...prev.steps, {
        id: `step_${Date.now()}`,
        name: '',
        type: 'request',
        description: '',
        config: {}
      }]
    }));
  };

  const updateTestStep = (stepId, field, value) => {
    setNewSuite(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const deleteTestStep = (stepId) => {
    setNewSuite(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Folders
        </button>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {folder.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and manage your test suites
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create Test Suite
        </button>
      </div>

      {/* Test Suites List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testSuites.map((suite) => (
          <div key={suite.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {suite.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {suite.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editTestSuite(suite)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit test suite"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => deleteTestSuite(suite.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete test suite"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <CogIcon className="h-4 w-4" />
                  {suite.testType} • {suite.toolId}
                </span>
                <span className="flex items-center gap-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  {suite.steps.length} steps
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  {suite.userStories.length} user stories
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  suite.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  suite.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {suite.status}
                </div>
                
                <button
                  onClick={() => onRunTest(suite)}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <PlayIcon className="h-4 w-4" />
                  Run Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Test Suite Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {editingSuite ? 'Edit Test Suite' : 'Create New Test Suite'}
          </h3>
          
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Suite Name *
                </label>
                <input
                  type="text"
                  value={newSuite.name}
                  onChange={(e) => setNewSuite(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., User Authentication API Tests"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type
                </label>
                <select
                  value={newSuite.testType}
                  onChange={(e) => setNewSuite(prev => ({ ...prev, testType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="API">API Testing</option>
                  <option value="Functional">Functional Testing</option>
                  <option value="Performance">Performance Testing</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newSuite.description}
                onChange={(e) => setNewSuite(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this test suite validates..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tool
                </label>
                <select
                  value={newSuite.toolId}
                  onChange={(e) => setNewSuite(prev => ({ ...prev, toolId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="axios">Axios (API)</option>
                  <option value="puppeteer">Puppeteer (Functional)</option>
                  <option value="k6">K6 (Performance)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={newSuite.baseUrl}
                  onChange={(e) => setNewSuite(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* User Stories Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Stories
                </h4>
                <button
                  onClick={addUserStory}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Story
                </button>
              </div>
              
              <div className="space-y-4">
                {newSuite.userStories.map((story, index) => (
                  <div key={story.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Story Title
                        </label>
                        <input
                          type="text"
                          value={story.title}
                          onChange={(e) => updateUserStory(story.id, 'title', e.target.value)}
                          placeholder="As a user, I want to..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={story.priority}
                          onChange={(e) => updateUserStory(story.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={story.description}
                        onChange={(e) => updateUserStory(story.id, 'description', e.target.value)}
                        placeholder="Detailed description of the user story..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Acceptance Criteria
                        </label>
                        <button
                          onClick={() => addAcceptanceCriteria(story.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                        >
                          + Add Criteria
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex items-center gap-2">
                            <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => updateAcceptanceCriteria(story.id, criteriaIndex, e.target.value)}
                              placeholder="Given... When... Then..."
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Steps Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Test Steps
                </h4>
                <button
                  onClick={addTestStep}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Step
                </button>
              </div>
              
              <div className="space-y-4">
                {newSuite.steps.map((step, index) => (
                  <div key={step.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Step {index + 1}
                      </h5>
                      <button
                        onClick={() => deleteTestStep(step.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Step Name
                        </label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => updateTestStep(step.id, 'name', e.target.value)}
                          placeholder="e.g., Login User"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Step Type
                        </label>
                        <select
                          value={step.type}
                          onChange={(e) => updateTestStep(step.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                        >
                          <option value="request">API Request</option>
                          <option value="navigation">Navigation</option>
                          <option value="assertion">Assertion</option>
                          <option value="wait">Wait</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => updateTestStep(step.id, 'description', e.target.value)}
                        placeholder="Describe what this step does..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveTestSuite}
                disabled={!newSuite.name.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckIcon className="h-5 w-5" />
                {editingSuite ? 'Update Test Suite' : 'Create Test Suite'}
              </button>
              
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
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {testSuites.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No test suites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first test suite to start testing
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Test Suite
          </button>
        </div>
      )}
    </div>
  );
};

export default TestSuiteConfiguration;
