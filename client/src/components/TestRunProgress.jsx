// client/src/components/TestRunProgress.jsx
import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TestRunProgress = ({ runId, onComplete, onError }) => {
  const [run, setRun] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (runId) {
      loadRun();
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [runId]);

  const loadRun = async () => {
    try {
      const response = await fetch(`/api/runs/${runId}`);
      const data = await response.json();
      
      if (data.success) {
        setRun(data.data);
        setLoading(false);
        
        // Check if run is complete
        if (data.data.status === 'completed' || data.data.status === 'failed') {
          if (data.data.status === 'completed' && onComplete) {
            onComplete(data.data);
          } else if (data.data.status === 'failed' && onError) {
            onError(data.data);
          }
        }
      } else {
        setError(data.error);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch(`/api/runs/${runId}/status`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`/api/runs/${runId}/logs`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  let pollInterval;

  const startPolling = () => {
    // Poll every 2 seconds for status updates
    pollInterval = setInterval(async () => {
      await loadStatus();
      await loadLogs();
      
      // If run is complete, stop polling
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        stopPolling();
        await loadRun(); // Load final run data
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  const stopRun = async () => {
    try {
      const response = await fetch(`/api/runs/${runId}/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await loadRun();
      }
    } catch (err) {
      console.error('Error stopping run:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <PlayIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'stopped':
        return <StopIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'stopped':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0s';
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          <span>Error loading test run: {error}</span>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-gray-500 dark:text-gray-400">No test run data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow" data-testid="test-run-progress">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(run.status)}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {run.testSuite.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="run-id">
                Run ID: {run.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(run.status)}`} data-testid="run-status">
              {run.status}
            </span>
            {run.status === 'running' && (
              <button
                onClick={stopRun}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-gray-600"
                data-testid="stop-run-btn"
              >
                <StopIcon className="w-4 h-4 mr-1" />
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {run.status === 'running' && status && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="progress-percentage">
              {status.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700" data-testid="progress-bar">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700" data-testid="results-summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="total-steps">
              {run.results.totalSteps}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Steps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="passed-steps">
              {run.results.passedSteps}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="failed-steps">
              {run.results.failedSteps}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="duration">
              {formatDuration(run.duration)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
          </div>
        </div>
      </div>

      {/* Step Results */}
      {run.results.steps && run.results.steps.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700" data-testid="step-results">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Step Results
          </h4>
          <div className="space-y-2">
            {run.results.steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" data-testid="step-result">
                <div className="flex items-center space-x-3">
                  {step.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" data-testid="step-icon" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" data-testid="step-icon" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white" data-testid="step-name">
                      {step.name}
                    </div>
                    {step.error && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {step.error}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400" data-testid="step-duration">
                  {formatDuration(step.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="px-6 py-4" data-testid="execution-logs">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Execution Logs
          </h4>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1" data-testid="log-entry">
                <span className="text-gray-500" data-testid="log-timestamp">[{log.timestamp}]</span>
                <span className={`ml-2 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  'text-green-400'
                }`} data-testid="log-level">
                  [{log.level.toUpperCase()}]
                </span>
                <span className="ml-2" data-testid="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts */}
      {run.artifacts && (run.artifacts.screenshots.length > 0 || run.artifacts.videos.length > 0) && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Artifacts
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {run.artifacts.screenshots.map((screenshot, index) => (
              <div key={index} className="text-center">
                <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Screenshot {index + 1}
                </div>
              </div>
            ))}
            {run.artifacts.videos.map((video, index) => (
              <div key={index} className="text-center">
                <PlayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Video {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunProgress;
