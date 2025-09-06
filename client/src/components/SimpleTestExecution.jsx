// Simple HTTP-based test execution without WebSocket complexity
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SimpleTestExecution = ({ testSuite, onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [searchParams] = useSearchParams();

  const addLog = (message, type = 'info') => {
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message,
      type
    };
    setLogs(prev => [...prev, log]);
    console.log(`${type === 'error' ? '❌' : type === 'success' ? '✅' : '📝'} ${message}`);
  };

  const executeTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    setResults(null);

    try {
      addLog('🚀 Starting test execution...', 'info');
      addLog(`📋 Test Suite: ${testSuite.name}`, 'info');
      addLog(`🔧 Tool: ${testSuite.toolId} | Type: ${testSuite.testType}`, 'info');
      addLog(`📊 Steps: ${testSuite.steps.length}`, 'info');

      // Simple HTTP request
      const response = await fetch('/api/execute-test-suite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testSuite })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Enhanced console output with detailed step information
      addLog('✅ Test execution completed!', 'success');
      addLog(`📊 Results: ${result.passedSteps || 0}/${result.totalSteps || 0} passed`, 'info');
      addLog(`⏱️ Total time: ${result.totalTime || 0}ms`, 'info');
      
      // Show detailed step results
      if (result.steps && result.steps.length > 0) {
        addLog('📋 Detailed Step Results:', 'info');
        result.steps.forEach((step, index) => {
          const stepNumber = index + 1;
          const status = step.success ? '✅' : '❌';
          const duration = step.duration ? `${step.duration}ms` : 'N/A';
          
          addLog(`  ${status} Step ${stepNumber}: ${step.name || 'Unknown'}`, step.success ? 'success' : 'error');
          addLog(`     Type: ${step.type || 'Unknown'} | Duration: ${duration}`, 'info');
          
          // Show specific details based on step type
          if (step.type === 'api' && step.config) {
            const method = step.config.method || 'GET';
            const url = step.config.url || 'Unknown URL';
            const statusCode = step.config.expectedStatus || 'Unknown';
            addLog(`     Endpoint: ${method} ${url} | Expected Status: ${statusCode}`, 'info');
            if (step.response) {
              addLog(`     Response Status: ${step.response.status || 'N/A'}`, 'info');
            }
          } else if (step.type === 'interaction' && step.config) {
            const action = step.config.action || 'Unknown';
            const selector = step.config.selector || 'Unknown';
            addLog(`     Action: ${action} | Selector: ${selector}`, 'info');
          } else if (step.type === 'assertion' && step.config) {
            const assertion = step.config.assertion || 'Unknown';
            const selector = step.config.selector || 'Unknown';
            addLog(`     Assertion: ${assertion} | Selector: ${selector}`, 'info');
          } else if (step.type === 'loadTest' && step.config) {
            const duration = step.config.duration || 'Unknown';
            const users = step.config.users || 'Unknown';
            addLog(`     Duration: ${duration} | Users: ${users}`, 'info');
          }
          
          if (step.message) {
            addLog(`     Message: ${step.message}`, 'info');
          }
          if (step.error) {
            addLog(`     Error: ${step.error}`, 'error');
          }
        });
      }

      setResults(result);

      // Save to localStorage
      const projectId = searchParams.get('project');
      const testRun = {
        id: Date.now(),
        projectId: projectId, // Add project isolation
        testSuiteName: testSuite.name,
        testSuite: {
          name: testSuite.name,
          testType: testSuite.testType,
          toolId: testSuite.toolId,
          baseUrl: testSuite.baseUrl
        },
        testType: testSuite.testType,
        toolId: testSuite.toolId,
        baseUrl: testSuite.baseUrl,
        success: result.success,
        totalSteps: result.totalSteps || testSuite.steps.length,
        passedSteps: result.passedSteps || 0,
        failedSteps: result.failedSteps || 0,
        totalTime: result.totalTime || 0,
        executedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        results: result
      };

      const existingRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      existingRuns.push(testRun);
      localStorage.setItem('testRunsV2', JSON.stringify(existingRuns));

      if (result.success) {
        addLog('🎉 All tests completed successfully!', 'success');
      } else {
        addLog('❌ Some tests failed. Check the results above.', 'error');
      }

      if (onComplete) {
        onComplete(result);
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('testRunCompleted', { 
        detail: { 
          testRun,
          result 
        } 
      }));

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      addLog(`❌ Execution failed: ${error.message}`, 'error');
      
      setResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Test Execution: {testSuite.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {testSuite.testType} • {testSuite.toolId} • {testSuite.steps.length} steps
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isRunning && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm font-medium">Running...</span>
                </div>
              )}
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={executeTest}
                disabled={isRunning}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Execution Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Execution Logs
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet. Click 'Run Test' to start.</div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`mb-2 ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'success'
                          ? 'text-green-400'
                          : log.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 text-xs">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      {' '}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Test Results
              </h2>
            </div>
            <div className="p-6">
              {results ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    results.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <div className="flex items-center">
                      <span className={`text-2xl mr-3 ${
                        results.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {results.success ? '✅' : '❌'}
                      </span>
                      <div>
                        <h3 className={`font-medium ${
                          results.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {results.success ? 'Tests Passed' : 'Tests Failed'}
                        </h3>
                        <p className={`text-sm ${
                          results.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {results.passedSteps || 0}/{results.totalSteps || 0} steps passed
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Time</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {results.totalTime || 0}ms
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {Math.round(((results.passedSteps || 0) / (results.totalSteps || 1)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No results yet. Run a test to see results here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestExecution;
