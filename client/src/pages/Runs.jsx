// src/pages/Runs.jsx
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import TestRunsService from '../lib/testRunsService';

function Runs() {
  const { user } = useAuth();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, passed, failed, running
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, all

  useEffect(() => {
    if (user?.id) {
      fetchRuns();
    }
  }, [user?.id, timeRange]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      
      // Fetch test runs using our new service
      const result = await TestRunsService.getTestRuns(user?.id || 'anonymous');
      
      if (result.success) {
        // Transform test runs into the expected format
        const transformedRuns = result.data.map(run => ({
          id: run.id,
          name: run.test_suite_name,
          type: run.test_type || 'automated',
          status: run.status === 'completed' ? 'passed' : run.status,
          duration: run.total_time || 0,
          startedAt: run.created_at,
          completedAt: run.updated_at,
          owner: run.user_id,
          result: run.results ? JSON.stringify(run.results, null, 2) : 'No results available',
          logs: `Running ${run.test_suite_name}...\nStatus: ${run.status}\nSteps: ${run.passed_steps}/${run.total_steps}\nDuration: ${run.total_time}ms`,
          passedSteps: run.passed_steps,
          totalSteps: run.total_steps,
          toolId: run.tool_id
        }));

        setRuns(transformedRuns);
      } else {
        console.error('Error fetching runs:', result.error);
        setRuns([]);
      }
    } catch (error) {
      console.error('Error fetching runs:', error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'running': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'automated': return '🤖';
      case 'performance': return '⚡';
      case 'security': return '🔒';
      case 'integration': return '🔗';
      case 'manual': return '👤';
      default: return '🧪';
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const remainingSeconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredRuns = runs.filter(run => {
    if (filter !== 'all' && run.status !== filter) return false;
    
    if (timeRange !== 'all') {
      const runDate = new Date(run.startedAt);
      const now = new Date();
      const diffInHours = (now - runDate) / (1000 * 60 * 60);
      
      switch (timeRange) {
        case '24h': return diffInHours <= 24;
        case '7d': return diffInHours <= 24 * 7;
        case '30d': return diffInHours <= 24 * 30;
        default: return true;
      }
    }
    
    return true;
  });

  const stats = {
    total: runs.length,
    passed: runs.filter(r => r.status === 'passed' || r.status === 'completed').length,
    failed: runs.filter(r => r.status === 'failed').length,
    running: runs.filter(r => r.status === 'running').length,
    successRate: runs.length > 0 ? Math.round((runs.filter(r => r.status === 'passed' || r.status === 'completed').length / runs.length) * 100) : 0
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Runs</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Inspect historical runs, logs, and pass rates</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Runs</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.passed}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Passed</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.failed}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Failed</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.running}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Running</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.successRate}%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</p>
        </div>
      </div>

      {/* Runs List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 shimmer rounded"></div>
                <div className="h-6 w-16 shimmer rounded-full"></div>
              </div>
              <div className="h-4 shimmer rounded mb-2"></div>
              <div className="h-4 shimmer rounded w-2/3"></div>
            </div>
          ))
        ) : filteredRuns.length > 0 ? (
          filteredRuns.map((run) => (
            <div key={run.id} className="glass-card hover-lift p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 grid place-items-center">
                    <span className="text-black font-bold text-sm">
                      {getTypeIcon(run.type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {run.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {run.owner} • {run.type} • {run.toolId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(run.status)}`}>
                    {getStatusIcon(run.status)} {run.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(run.duration)}
                  </span>
                  {run.totalSteps && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {run.passedSteps}/{run.totalSteps} steps
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Started:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(run.startedAt).toLocaleString()}
                  </span>
                </div>
                {run.result && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {run.result}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  View Logs
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Re-run
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No runs found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filter !== 'all' || timeRange !== 'all' 
                ? 'Try adjusting your filters to see more results'
                : 'Run some tests to see execution history and results'
              }
            </p>
            {filter === 'all' && timeRange === 'all' && (
              <button
                onClick={() => window.location.href = '/jobs'}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create a Test Job
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Runs;
