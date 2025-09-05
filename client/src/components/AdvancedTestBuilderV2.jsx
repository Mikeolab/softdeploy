// src/components/AdvancedTestBuilderV2.jsx
// Advanced test builder with professional tool organization and deep functionality

import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PlusIcon,
  DocumentTextIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  BeakerIcon,
  BoltIcon,
  CpuChipIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  KeyIcon,
  VariableIcon,
  ServerIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  TEST_TOOLS, 
  API_STEP_TYPES, 
  FUNCTIONAL_STEP_TYPES, 
  PERFORMANCE_STEP_TYPES,
  getStepTypesByTool,
  generateCypressScript,
  generateK6Script
} from '../lib/testConfig';
import testExecutor from '../lib/testExecutor';

export default function AdvancedTestBuilderV2() {
  const [testSuite, setTestSuite] = useState({
    name: '',
    description: '',
    testType: '', // 'api', 'functional', 'performance'
    toolCategory: '', // 'internal', 'external'
    toolId: '', // 'inbuilt', 'cypress', 'k6', etc.
    baseUrl: '',
    variables: {}, // For storing extracted data
    steps: []
  });
  
  const [currentStep, setCurrentStep] = useState({
    type: 'request',
    name: '',
    description: '',
    config: {}
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [savedTests, setSavedTests] = useState([]);
  const [showToolDetails, setShowToolDetails] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Sample test templates
  const sampleTests = {
    api: {
      name: "E-commerce API Test",
      description: "Test basic e-commerce API endpoints",
      testType: "API",
      toolCategory: "internal",
      toolId: "axios",
      baseUrl: "https://jsonplaceholder.typicode.com",
      steps: [
        {
          name: "Get all posts",
          action: "GET",
          url: "/posts",
          headers: { "Content-Type": "application/json" },
          expectedStatus: 200
        },
        {
          name: "Get specific post",
          action: "GET", 
          url: "/posts/1",
          headers: { "Content-Type": "application/json" },
          expectedStatus: 200,
          expectedResponse: { userId: 1 }
        },
        {
          name: "Create new post",
          action: "POST",
          url: "/posts",
          headers: { "Content-Type": "application/json" },
          body: {
            title: "Test Post",
            body: "This is a test post",
            userId: 1
          },
          expectedStatus: 201
        }
      ]
    },
    functional: {
      name: "Google Search Flow",
      description: "Test Google search functionality",
      testType: "Functional",
      toolCategory: "internal", 
      toolId: "puppeteer",
      baseUrl: "https://www.google.com",
      steps: [
        {
          name: "Navigate to Google",
          type: "navigation",
          config: {
            url: "https://www.google.com"
          }
        },
        {
          name: "Search for 'test automation'",
          type: "interaction",
          config: {
            selector: "input[name='q'], input[title='Search'], textarea[name='q']",
            action: "type",
            value: "test automation"
          }
        },
        {
          name: "Click search button",
          type: "interaction",
          config: {
            selector: "input[value='Google Search']",
            action: "click"
          }
        },
        {
          name: "Verify results page",
          type: "assertion",
          config: {
            selector: "#search",
            assertion: "visible"
          }
        }
      ]
    },
    performance: {
      name: "API Load Test",
      description: "Test API performance under load",
      testType: "Performance",
      toolCategory: "external",
      toolId: "k6",
      baseUrl: "https://jsonplaceholder.typicode.com",
      steps: [
        {
          name: "Load test posts endpoint",
          type: "load",
          config: {
            url: "/posts",
            method: "GET",
            duration: "30s",
            vus: 10
          }
        },
        {
          name: "Stress test users endpoint", 
          type: "stress",
          config: {
            url: "/users",
            method: "GET",
            duration: "60s",
            stages: [
              { duration: "10s", target: 5 },
              { duration: "20s", target: 20 },
              { duration: "30s", target: 0 }
            ]
          }
        }
      ]
    }
  };

  // Load sample test
  const loadSampleTest = (type) => {
    const sample = sampleTests[type];
    if (sample) {
      setTestSuite(sample);
      console.log(`📋 Loaded sample ${type} test:`, sample);
    }
  };

  // Clear form
  const clearForm = () => {
    setTestSuite({
      name: '',
      description: '',
      testType: '',
      toolCategory: '',
      toolId: '',
      baseUrl: '',
      variables: {},
      steps: []
    });
    setTestResults(null);
    setExecutionLogs([]);
    console.log('🧹 Form cleared');
  };

  // Load saved tests
  useEffect(() => {
    const saved = localStorage.getItem('advancedTestsV2');
    if (saved) {
      setSavedTests(JSON.parse(saved));
    }
  }, []);

  // Save test to localStorage
  const saveTest = () => {
    if (!testSuite.name || !testSuite.testType || !testSuite.toolId) {
      alert('Please fill in all required fields');
      return;
    }

    const testToSave = {
      ...testSuite,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      steps: testSuite.steps.map((step, index) => ({ ...step, order: index + 1 }))
    };

    const updatedTests = [...savedTests, testToSave];
    localStorage.setItem('advancedTestsV2', JSON.stringify(updatedTests));
    setSavedTests(updatedTests);
    alert('Test suite saved successfully!');
  };

  // Execute test suite
  const executeTestSuite = async () => {
    if (!testSuite.name || !testSuite.testType || !testSuite.toolId || testSuite.steps.length === 0) {
      alert('Please fill in all required fields and add at least one step');
      return;
    }

    console.log('🚀 Starting test execution:', {
      name: testSuite.name,
      type: testSuite.testType,
      tool: testSuite.toolId,
      steps: testSuite.steps.length,
      baseUrl: testSuite.baseUrl
    });

    setIsRunning(true);
    setTestResults(null);
    setExecutionLogs([]);

    try {
      // Progress callback for real-time updates
      const onProgress = (message, type = 'info') => {
        const log = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          message,
          type // 'info', 'success', 'error', 'warning'
        };
        
        // Console logging for debugging
        const consolePrefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
        console.log(`${consolePrefix} [${new Date().toLocaleTimeString()}] ${message}`);
        
        setExecutionLogs(prev => [...prev, log]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const logsContainer = document.getElementById('execution-logs');
          if (logsContainer) {
            logsContainer.scrollTop = logsContainer.scrollHeight;
          }
        }, 100);
      };

      onProgress(`Starting test suite: ${testSuite.name}`, 'info');
      onProgress(`Test type: ${testSuite.testType}, Tool: ${testSuite.toolId}`, 'info');
      onProgress(`Base URL: ${testSuite.baseUrl}`, 'info');
      onProgress(`Total steps: ${testSuite.steps.length}`, 'info');

      // Execute the test suite
      const result = await testExecutor.executeTestSuite(testSuite, onProgress);
      
      console.log('📊 Test execution completed:', result);
      onProgress(`Test execution completed with ${result.success ? 'SUCCESS' : 'FAILURE'}`, result.success ? 'success' : 'error');
      
      setTestResults(result);
      
      // Save results to localStorage
      const savedResults = JSON.parse(localStorage.getItem('testResultsV2') || '[]');
      savedResults.push({
        ...result,
        id: `result_${Date.now()}`,
        testSuiteId: testSuite.id,
        executedAt: new Date().toISOString()
      });
      localStorage.setItem('testResultsV2', JSON.stringify(savedResults));

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        testSuite: testSuite.name,
        testType: testSuite.testType,
        toolId: testSuite.toolId
      });
      
      const onProgress = (message, type = 'info') => {
        const log = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          message,
          type
        };
        setExecutionLogs(prev => [...prev, log]);
      };
      
      onProgress(`Test execution failed: ${error.message}`, 'error');
      onProgress(`Error type: ${error.name}`, 'error');
      if (error.stack) {
        onProgress(`Stack trace: ${error.stack.split('\n').slice(0, 3).join(' ')}`, 'error');
      }
      
      setTestResults({
        success: false,
        testSuite: testSuite.name,
        summary: {
          total: testSuite.steps.length,
          passed: 0,
          failed: testSuite.steps.length,
          duration: 0
        },
        steps: [],
        error: error.message,
        errorDetails: {
          name: error.name,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsRunning(false);
      console.log('🏁 Test execution finished');
    }
  };

    // Stop test execution
  const stopExecution = () => {
    testExecutor.stopExecution();
    setIsRunning(false);
    // Log stop event
    setExecutionLogs(prev => ([
      ...prev,
      {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        message: 'Test execution stopped by user',
        type: 'warning'
      }
    ]));
  };

  // Add step to test suite
  const addStep = () => {
    if (!currentStep.name || !currentStep.type) {
      alert('Please fill in step name and type');
      return;
    }

    const newStep = {
      ...currentStep,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setTestSuite(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    // Reset current step
    setCurrentStep({
      type: 'request',
      name: '',
      description: '',
      config: {}
    });
  };

  // Remove step
  const removeStep = (stepId) => {
    setTestSuite(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  // Execute test suite
  const executeTest = async () => {
    if (!testSuite.name || !testSuite.testType || !testSuite.toolId || testSuite.steps.length === 0) {
      alert('Please fill in all required fields and add at least one step');
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setExecutionLogs([]);

    try {
      // Progress callback for real-time updates
      const onProgress = (message, type = 'info') => {
        const log = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          message,
          type // 'info', 'success', 'error', 'warning'
        };
        
        setExecutionLogs(prev => [...prev, log]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          const logsContainer = document.getElementById('execution-logs');
          if (logsContainer) {
            logsContainer.scrollTop = logsContainer.scrollHeight;
          }
        }, 100);
      };

      // Execute the test suite
      const result = await testExecutor.executeTestSuite(testSuite, onProgress);
      setTestResults(result);
      
      // Save results to localStorage
      const savedResults = JSON.parse(localStorage.getItem('testResultsV2') || '[]');
      savedResults.push({
        ...result,
        id: `result_${Date.now()}`,
        testSuiteId: testSuite.id,
        executedAt: new Date().toISOString()
      });
      localStorage.setItem('testResultsV2', JSON.stringify(savedResults));

    } catch (error) {
      console.error('Test execution failed:', error);
      const onProgress = (message, type = 'info') => {
        const log = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          message,
          type
        };
        setExecutionLogs(prev => [...prev, log]);
      };
      onProgress(`Test execution failed: ${error.message}`, 'error');
      
      setTestResults({
        success: false,
        testSuite: testSuite.name,
        summary: {
          total: testSuite.steps.length,
          passed: 0,
          failed: testSuite.steps.length,
          duration: 0
        },
        steps: [],
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Execute individual step
  const executeStep = async (step, baseUrl, toolId, variables) => {
    const stepStartTime = Date.now();
    
    try {
      let result = { success: false, message: '', duration: 0, data: null, extractedData: null };

      switch (step.type) {
        case 'request':
          result = await executeApiRequest(step, baseUrl, variables);
          break;
        case 'validation':
          result = await executeValidation(step, variables);
          break;
        case 'extraction':
          result = await executeExtraction(step, variables);
          break;
        case 'conditional':
          result = await executeConditional(step, variables);
          break;
        case 'navigation':
          result = await executeNavigation(step, baseUrl);
          break;
        case 'interaction':
          result = await executeInteraction(step, baseUrl);
          break;
        case 'assertion':
          result = await executeAssertion(step, baseUrl);
          break;
        case 'loadTest':
          result = await executeLoadTest(step, baseUrl, toolId);
          break;
        default:
          result = { success: false, message: `Unknown step type: ${step.type}` };
      }

      result.duration = Date.now() - stepStartTime;
      return result;

    } catch (error) {
      return {
        success: false,
        message: `Step execution failed: ${error.message}`,
        duration: Date.now() - stepStartTime,
        error: error.message
      };
    }
  };

  // Execute API request
  const executeApiRequest = async (step, baseUrl, variables) => {
    try {
      const config = step.config;
      const url = config.url.startsWith('http') ? config.url : `${baseUrl}${config.url}`;
      
      // Replace variables in URL
      const processedUrl = url.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] || match;
      });

      const headers = { 'Content-Type': 'application/json' };
      
      // Add custom headers
      if (config.headers) {
        Object.assign(headers, config.headers);
      }

      // Add authentication
      if (config.auth && config.auth !== 'None') {
        switch (config.auth) {
          case 'Bearer':
            if (variables.token) {
              headers['Authorization'] = `Bearer ${variables.token}`;
            }
            break;
          case 'Basic':
            if (variables.username && variables.password) {
              const credentials = btoa(`${variables.username}:${variables.password}`);
              headers['Authorization'] = `Basic ${credentials}`;
            }
            break;
        }
      }

      const requestOptions = {
        method: config.method || 'GET',
        headers: headers
      };

      // Add query parameters
      if (config.params) {
        const urlObj = new URL(processedUrl);
        Object.entries(config.params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, value);
        });
        requestOptions.url = urlObj.toString();
      }

      // Add request body
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        requestOptions.body = JSON.stringify(config.body);
      }

      const response = await fetch(processedUrl, requestOptions);
      const responseData = await response.json().catch(() => null);
      
      return {
        success: response.ok,
        message: response.ok ? 'API request successful' : `Request failed: ${response.status}`,
        data: {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `API request failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute validation
  const executeValidation = async (step, variables) => {
    try {
      const config = step.config;
      const lastResponse = variables.lastResponse;
      
      if (!lastResponse) {
        return {
          success: false,
          message: 'No response data available for validation'
        };
      }

      let success = true;
      let message = 'Validation passed';

      // Status code validation
      if (config.statusCode && lastResponse.status !== config.statusCode) {
        success = false;
        message = `Expected status ${config.statusCode}, got ${lastResponse.status}`;
      }

      // JSON path validation
      if (config.jsonPath && config.expectedValue) {
        const value = extractJsonPathValue(lastResponse.response, config.jsonPath);
        if (value != config.expectedValue) {
          success = false;
          message = `JSON path ${config.jsonPath} expected ${config.expectedValue}, got ${value}`;
        }
      }

      // Response time validation
      if (config.responseTime && lastResponse.duration > config.responseTime) {
        success = false;
        message = `Response time ${lastResponse.duration}ms exceeded limit ${config.responseTime}ms`;
      }

      return {
        success,
        message,
        data: { validation: { success, message } }
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute extraction
  const executeExtraction = async (step, variables) => {
    try {
      const config = step.config;
      const lastResponse = variables.lastResponse;
      
      if (!lastResponse) {
        return {
          success: false,
          message: 'No response data available for extraction'
        };
      }

      const value = extractJsonPathValue(lastResponse.response, config.jsonPath);
      const extractedData = { [config.variableName]: value || config.defaultValue };

      return {
        success: true,
        message: `Extracted ${config.variableName}: ${value}`,
        data: { extracted: extractedData },
        extractedData
      };
    } catch (error) {
      return {
        success: false,
        message: `Extraction failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute conditional logic
  const executeConditional = async (step, variables) => {
    try {
      const config = step.config;
      const value = variables[config.variable];
      
      let conditionMet = false;
      
      switch (config.condition) {
        case 'equals':
          conditionMet = value == config.value;
          break;
        case 'contains':
          conditionMet = String(value).includes(config.value);
          break;
        case 'greater_than':
          conditionMet = Number(value) > Number(config.value);
          break;
        case 'less_than':
          conditionMet = Number(value) < Number(config.value);
          break;
        case 'exists':
          conditionMet = value !== undefined && value !== null;
          break;
        case 'not_exists':
          conditionMet = value === undefined || value === null;
          break;
      }

      return {
        success: true,
        message: `Condition ${config.condition} ${conditionMet ? 'met' : 'not met'}`,
        data: { conditionMet, nextStep: conditionMet ? config.onSuccess : config.onFailure }
      };
    } catch (error) {
      return {
        success: false,
        message: `Conditional logic failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute navigation
  const executeNavigation = async (step, baseUrl) => {
    try {
      const url = step.config.url ? `${baseUrl}${step.config.url}` : baseUrl;
      const response = await fetch(url);

      return {
        success: response.ok,
        message: response.ok ? 'Navigation successful' : `Navigation failed: ${response.status}`,
        data: {
          status: response.status,
          url: url
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Navigation failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute interaction (simulated)
  const executeInteraction = async (step, baseUrl) => {
    try {
      const response = await fetch(baseUrl);
      const html = await response.text();

      // Simple simulation - in real implementation, this would use Playwright or similar
      const elementExists = html.includes(step.config.selector || 'button') || html.includes(step.config.value || '');

      return {
        success: elementExists,
        message: elementExists ? 'Interaction simulation successful' : 'Element not found',
        data: {
          selector: step.config.selector,
          action: step.config.action,
          value: step.config.value
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Interaction simulation failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute assertion (simulated)
  const executeAssertion = async (step, baseUrl) => {
    try {
      const response = await fetch(baseUrl);
      const html = await response.text();

      const contentExists = html.includes(step.config.expectedValue || '');

      return {
        success: contentExists,
        message: contentExists ? 'Assertion passed' : 'Expected content not found',
        data: {
          selector: step.config.selector,
          assertion: step.config.assertion,
          expectedValue: step.config.expectedValue,
          found: contentExists
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Assertion failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Execute load test
  const executeLoadTest = async (step, baseUrl, toolId) => {
    try {
      // Simulate load test
      const startTime = Date.now();
      const promises = [];

      // Create multiple concurrent requests
      const concurrentUsers = step.config.virtualUsers || 10;
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(fetch(baseUrl));
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const successfulRequests = responses.filter(r => r.ok).length;
      const avgResponseTime = (endTime - startTime) / responses.length;

      return {
        success: successfulRequests > 0,
        message: `Load test completed: ${successfulRequests}/${responses.length} successful requests`,
        data: {
          concurrentUsers,
          successfulRequests,
          totalRequests: responses.length,
          avgResponseTime: `${avgResponseTime.toFixed(2)}ms`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Load test failed: ${error.message}`,
        error: error.message
      };
    }
  };
  const extractJsonPathValue = (json, path) => {
    try {
      return path.split('.').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : undefined, json);
    } catch (e) {
      return undefined;
    }
  };

  // Generate script for external tools
  const generateScript = () => {
    if (!testSuite.toolId) return null;

    switch (testSuite.toolId) {
      case 'cypress':
        return generateCypressScript(testSuite);
      case 'k6':
        return generateK6Script(testSuite);
      default:
        return null;
    }
  };

  // Render field based on type
  const renderField = (fieldName, fieldConfig, value, onChange) => {
    const handleChange = (newValue) => {
      onChange(fieldName, newValue);
    };

    switch (fieldConfig.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="">Select {fieldName}</option>
            {fieldConfig.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        );

      case 'json':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            rows={4}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white font-mono text-sm"
          />
        );

      case 'keyvalue':
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={fieldConfig.placeholder}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Format: key1: value1, key2: value2
            </p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Tests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <SparklesIcon className="h-5 w-5" />
          Sample Tests
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose a sample test to get started quickly, then customize it to your needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => loadSampleTest('api')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  API Test
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">E-commerce API endpoints</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Test GET, POST endpoints with validation
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <span>3 steps</span>
              <span>•</span>
              <span>Ready to run</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => loadSampleTest('functional')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  Functional Test
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Google search flow</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Navigate, interact, and assert on web pages
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <span>4 steps</span>
              <span>•</span>
              <span>Browser automation</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => loadSampleTest('performance')}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Performance Test
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">API load testing</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Load and stress test API endpoints
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
              <span>2 steps</span>
              <span>•</span>
              <span>K6 integration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Suite Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BeakerIcon className="h-5 w-5" />
          Test Suite Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Suite Name *
            </label>
            <input
              type="text"
              value={testSuite.name}
              onChange={(e) => setTestSuite(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Login Flow Test"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base URL *
            </label>
            <input
              type="url"
              value={testSuite.baseUrl}
              onChange={(e) => setTestSuite(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://your-app.com"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={testSuite.description}
            onChange={(e) => setTestSuite(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this test suite does..."
            rows={3}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Test Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Test Type *
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'api', name: 'API Testing', description: 'Test API endpoints and integrations', icon: '🔗' },
            { key: 'functional', name: 'Functional Testing', description: 'Test user interactions and UI functionality', icon: '🧪' },
            { key: 'performance', name: 'Performance Testing', description: 'Test application performance and load handling', icon: '⚡' }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => {
                setTestSuite(prev => ({ 
                  ...prev, 
                  testType: type.key, 
                  toolCategory: '', 
                  toolId: '', 
                  steps: [] 
                }));
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                testSuite.testType === type.key
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {type.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {type.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Selection */}
      {testSuite.testType && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Testing Tool *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inbuilt Tool */}
            <button
              onClick={() => setTestSuite(prev => ({ ...prev, toolCategory: 'internal', toolId: 'inbuilt' }))}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                testSuite.toolId === 'inbuilt'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{TEST_TOOLS.inbuilt.icon}</span>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {TEST_TOOLS.inbuilt.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {TEST_TOOLS.inbuilt.description}
              </p>
            </button>

            {/* External Tools */}
            <button
              onClick={() => setShowToolDetails(!showToolDetails)}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-left transition-all hover:border-gray-300 dark:hover:border-gray-500"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{TEST_TOOLS.external.icon}</span>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {TEST_TOOLS.external.name}
                </h4>
                {showToolDetails ? (
                  <ChevronUpIcon className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {TEST_TOOLS.external.description}
              </p>
            </button>
          </div>

          {/* External Tools Details */}
          {showToolDetails && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available External Tools:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(TEST_TOOLS.external.tools).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setTestSuite(prev => ({ ...prev, toolCategory: 'external', toolId: tool.id }))}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      testSuite.toolId === tool.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {tool.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variables Management */}
      {testSuite.toolId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <VariableIcon className="h-5 w-5" />
              Test Variables
            </h3>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {showVariables ? 'Hide' : 'Show'} Variables
              {showVariables ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
          </div>
          
          {showVariables && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Variable Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., sessionId"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Value
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., default-session"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-3">
                <button className="px-3 py-1 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                  Add Variable
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Steps */}
      {testSuite.toolId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Steps ({testSuite.steps.length})
          </h3>
          
          {/* Add New Step */}
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Step Type
                </label>
                <select
                  value={currentStep.type}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, type: e.target.value, config: {} }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="">Select Step Type</option>
                  {Object.entries(getStepTypesByTool(testSuite.toolId, testSuite.testType)).map(([key, stepType]) => (
                    <option key={key} value={key}>
                      {stepType.name} - {stepType.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Step Name
                </label>
                <input
                  type="text"
                  value={currentStep.name}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Login with credentials"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={currentStep.description}
                onChange={(e) => setCurrentStep(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What this step does..."
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Dynamic Fields based on Step Type */}
            {currentStep.type && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Step Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(getStepTypesByTool(testSuite.toolId, testSuite.testType)[currentStep.type]?.fields || {}).map(([fieldName, fieldConfig]) => (
                    <div key={fieldName}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
                        {fieldConfig.required && <span className="text-red-500"> *</span>}
                      </label>
                      {renderField(
                        fieldName,
                        fieldConfig,
                        currentStep.config[fieldName],
                        (fieldName, value) => setCurrentStep(prev => ({
                          ...prev,
                          config: { ...prev.config, [fieldName]: value }
                        }))
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={addStep}
              disabled={!currentStep.name.trim() || !currentStep.type}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4" />
              Add Step
            </button>
          </div>
          
          {/* Existing Steps */}
          {testSuite.steps.length > 0 && (
            <div className="space-y-3">
              {testSuite.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Step {index + 1}:
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {step.name}
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {step.type}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {testSuite.toolId && (
          <>
            <button
              onClick={executeTestSuite}
              disabled={!testSuite.baseUrl || testSuite.steps.length === 0 || isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="h-4 w-4" />
              {isRunning ? 'Running...' : 'Execute Test Suite'}
            </button>
            
            {isRunning && (
              <button
                onClick={() => testExecutor.stopExecution()}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                Stop Execution
              </button>
            )}
          </>
        )}
        
        <button
          onClick={clearForm}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
          Clear Form
        </button>
          
        <button
          onClick={saveTest}
          disabled={!testSuite.name || !testSuite.testType || !testSuite.toolId}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentTextIcon className="h-4 w-4" />
          Save Test Suite
        </button>

        {testSuite.toolCategory === 'external' && (
          <button
            onClick={() => {
              const script = generateScript();
              if (script) {
                navigator.clipboard.writeText(script);
                alert('Script copied to clipboard!');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <CodeBracketIcon className="h-4 w-4" />
            Generate Script
          </button>
        )}
      </div>

      {/* Real-time Execution Logs */}
      {(isRunning || executionLogs.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Live Execution Logs
            {isRunning && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Running...</span>
              </div>
            )}
          </h3>
          
          <div 
            id="execution-logs"
            className="max-h-96 overflow-y-auto bg-gray-900 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm"
          >
            {executionLogs.length === 0 ? (
              <div className="text-gray-400">Waiting for execution to start...</div>
            ) : (
              <div className="space-y-1">
                {executionLogs.map((log) => (
                  <div key={log.id} className={`flex items-start gap-2 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}>
                    <span className="text-gray-500 text-xs flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Test Execution Results
          </h3>
          
          <div className={`p-4 rounded-lg border ${
            testResults.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {testResults.success ? (
                <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {testResults.testSuite || testSuite.name || 'Test Suite'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                testResults.success 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {testResults.success ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Total Steps: {testResults.totalSteps || testResults.summary?.total || 0}</div>
              <div>Passed: {testResults.passedSteps || testResults.summary?.passed || 0}</div>
              <div>Failed: {testResults.failedSteps || testResults.summary?.failed || 0}</div>
              <div>Duration: {testResults.totalTime || testResults.summary?.duration || 0}ms</div>
            </div>
            
            {/* Step Results */}
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Step Details:</h4>
              {(testResults.results || testResults.steps || []).map((step, index) => (
                <div key={step.stepIndex || step.stepNumber || index} className={`p-2 rounded text-sm ${
                  step.success 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {step.success ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      Step {step.stepIndex || step.stepNumber || index + 1}: {step.stepName || step.name || 'Unknown Step'}
                    </span>
                    <span className="text-xs">({step.duration || 0}ms)</span>
                  </div>
                  <p className="ml-6 text-xs">{step.message || 'No message'}</p>
                  {step.responseData && (
                    <details className="ml-6 text-xs mt-1">
                      <summary className="cursor-pointer text-blue-600 dark:text-blue-400">View Response Data</summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(step.responseData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
