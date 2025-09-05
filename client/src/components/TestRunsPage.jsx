// src/components/TestRunsPage.jsx
import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import TestRunsService from '../lib/testRunsService';

export default function TestRunsPage() {
  const [testRuns, setTestRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);

  useEffect(() => {
    loadTestRuns();
    
    // Listen for new test runs
    const handleTestRunCompleted = () => {
      console.log('🔄 New test run completed, refreshing...');
      loadTestRuns();
    };
    
    window.addEventListener('testRunCompleted', handleTestRunCompleted);
    
    return () => {
      window.removeEventListener('testRunCompleted', handleTestRunCompleted);
    };
  }, []);

  useEffect(() => {
    if (testRuns.length > 0) {
      loadStats();
    }
  }, [testRuns]);

  const loadTestRuns = async () => {
    setLoading(true);
    
    // Load from Supabase
    const supabaseResult = await TestRunsService.getTestRuns();
    let supabaseRuns = [];
    if (supabaseResult.success) {
      supabaseRuns = supabaseResult.data;
    } else {
      console.log('Supabase not available, using localStorage only');
    }
    
    // Load from localStorage
    const localResults = JSON.parse(localStorage.getItem('testResultsV2') || '[]');
    const localRuns = localResults.map(result => ({
      id: result.id || `local_${Date.now()}_${Math.random()}`,
      test_suite_name: result.testSuite || result.name || 'Unnamed Test',
      test_type: result.testType || 'API',
      tool_id: result.toolId || 'unknown',
      status: result.success ? 'completed' : 'failed',
      total_steps: result.totalSteps || result.summary?.total || 0,
      passed_steps: result.passedSteps || result.summary?.passed || 0,
      failed_steps: result.failedSteps || result.summary?.failed || 0,
      total_time: result.totalTime || result.summary?.duration || 0,
      created_at: result.executedAt || new Date().toISOString(),
      updated_at: result.executedAt || new Date().toISOString(),
      results: result,
      source: 'localStorage'
    }));
    
    // Combine and sort by date (newest first)
    const allRuns = [...supabaseRuns, ...localRuns]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    setTestRuns(allRuns);
    setLoading(false);
  };

  const loadStats = async () => {
    // Calculate stats from current test runs
    const totalRuns = testRuns.length;
    const successfulRuns = testRuns.filter(run => run.status === 'completed').length;
    const failedRuns = testRuns.filter(run => run.status === 'failed').length;
    const averageTime = totalRuns > 0 
      ? testRuns.reduce((sum, run) => sum + (run.total_time || 0), 0) / totalRuns 
      : 0;
    
    setStats({
      totalRuns,
      successfulRuns,
      failedRuns,
      averageTime
    });
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'running':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Runs</h1>
          <p className="text-gray-600 dark:text-gray-300">View and manage your test execution history</p>
        </div>
        <button
          onClick={loadTestRuns}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <PlayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRuns}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Successful</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulRuns}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedRuns}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.averageTime)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Runs List */}
      <div className="glass-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Test Runs</h2>
          
          {testRuns.length === 0 ? (
            <div className="text-center py-8">
              <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No test runs yet</h3>
              <p className="text-gray-600 dark:text-gray-300">Run your first test suite to see execution history and results.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testRuns.map((run) => (
                <div key={run.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{run.test_suite_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {run.test_type} • {run.tool_id} • {formatDate(run.created_at)}
                          {run.source === 'localStorage' && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                              Local
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                            {run.status}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {run.passed_steps}/{run.total_steps} steps
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDuration(run.total_time)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Run Details Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Test Run Details
                </h2>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Suite</label>
                    <p className="text-gray-900 dark:text-white">{selectedRun.test_suite_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRun.status)}`}>
                      {selectedRun.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Type</label>
                    <p className="text-gray-900 dark:text-white">{selectedRun.test_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tool</label>
                    <p className="text-gray-900 dark:text-white">{selectedRun.tool_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                    <p className="text-gray-900 dark:text-white">{formatDuration(selectedRun.total_time)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Steps</label>
                    <p className="text-gray-900 dark:text-white">{selectedRun.passed_steps}/{selectedRun.total_steps} passed</p>
                  </div>
                </div>
                
                {selectedRun.results && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Results</label>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(selectedRun.results, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
