// AI Assistant Component for Test Generation
import React, { useState } from 'react';
import { 
  SparklesIcon, 
  PlayIcon, 
  DocumentTextIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import AIUsageMonitor from './AIUsageMonitor';

const AIAssistant = ({ projectContext, onTestGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [testType, setTestType] = useState('API');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showUsageMonitor, setShowUsageMonitor] = useState(false);

  const testTypes = [
    { value: 'API', label: 'API Testing', description: 'REST API endpoints and responses' },
    { value: 'Functional', label: 'Functional Testing', description: 'UI interactions and user flows' },
    { value: 'Performance', label: 'Performance Testing', description: 'Load testing and performance metrics' },
    { value: 'E2E', label: 'End-to-End Testing', description: 'Complete user journeys' }
  ];

  const handleGenerateTest = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of the test you want to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedTest(null);

    try {
      const response = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          testType,
          projectContext
        })
      });

      const result = await response.json();

      if (result.success) {
        try {
          // Parse the generated JSON
          const testConfig = JSON.parse(result.generatedScript);
          setGeneratedTest(testConfig);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          setError('AI generated invalid test configuration. Please try again.');
        }
      } else {
        // Handle rate limit errors specially
        if (response.status === 429) {
          setError(`Rate limit exceeded: ${result.message}. Please wait before trying again.`);
        } else {
          setError(result.message || 'Failed to generate test script');
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setError('Failed to connect to AI service. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/suggest-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectContext })
      });

      const result = await response.json();

      if (result.success) {
        setSuggestions(result.suggestions.suggestions || []);
        setShowSuggestions(true);
      } else {
        // Handle rate limit errors specially
        if (response.status === 429) {
          setError(`Rate limit exceeded: ${result.message}. Please wait before trying again.`);
        } else {
          setError(result.message || 'Failed to get suggestions');
        }
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      setError('Failed to get suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    setPrompt(suggestion.description);
    setTestType(suggestion.testType);
    setShowSuggestions(false);
  };

  const handleUseGeneratedTest = () => {
    if (generatedTest && onTestGenerated) {
      onTestGenerated(generatedTest);
      onClose();
    }
  };

  const handleEditTest = () => {
    // Allow user to edit the generated test
    setGeneratedTest({ ...generatedTest, editable: true });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Test Generator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generate test scripts using AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUsageMonitor(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="View AI Usage"
            >
              <ChartBarIcon className="h-6 w-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Project Context */}
          {projectContext?.name && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Project Context
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>{projectContext.name}</strong>
                {projectContext.description && ` - ${projectContext.description}`}
              </p>
            </div>
          )}

          {/* Test Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Test Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTestType(type.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    testType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {!showSuggestions && (
            <div className="mb-6">
              <button
                onClick={handleGetSuggestions}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-colors"
              >
                <LightBulbIcon className="h-4 w-4" />
                Get AI Suggestions
              </button>
            </div>
          )}

          {/* Suggestions List */}
          {showSuggestions && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  AI Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleUseSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            suggestion.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {suggestion.priority}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.testType} • {suggestion.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe the test you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Test user login functionality with valid credentials, Test API endpoint for creating new users, Test page load performance under high traffic..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <XMarkIcon className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={handleGenerateTest}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate Test Script
                </>
              )}
            </button>
          </div>

          {/* Generated Test Display */}
          {generatedTest && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Generated Test Script
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditTest}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleUseGeneratedTest}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Use This Test
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={generatedTest.name || ''}
                    onChange={(e) => setGeneratedTest({ ...generatedTest, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={generatedTest.description || ''}
                    onChange={(e) => setGeneratedTest({ ...generatedTest, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={generatedTest.baseUrl || ''}
                    onChange={(e) => setGeneratedTest({ ...generatedTest, baseUrl: e.target.value })}
                    placeholder="https://api.example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Test Steps Preview */}
                {generatedTest.steps && generatedTest.steps.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Test Steps ({generatedTest.steps.length})
                    </label>
                    <div className="space-y-2">
                      {generatedTest.steps.map((step, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Step {index + 1}:
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {step.name}
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              {step.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Monitor Modal */}
      <AIUsageMonitor 
        isOpen={showUsageMonitor} 
        onClose={() => setShowUsageMonitor(false)} 
      />
    </div>
  );
};

export default AIAssistant;
