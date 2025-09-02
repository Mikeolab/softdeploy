// src/pages/Deploy.jsx
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog } from '@headlessui/react';

function Deploy() {
  const { user } = useAuth();
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployConfig, setDeployConfig] = useState({
    environment: 'staging',
    branch: 'main',
    description: '',
    autoRollback: true,
    healthCheck: true
  });

  useEffect(() => {
    if (user?.id) {
      fetchDeployments();
    }
  }, [user?.id]);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      // Mock deployments since we don't have a deployments table
      const mockDeployments = [
        {
          id: 1,
          environment: 'staging',
          status: 'success',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3500000).toISOString(),
          duration: 600,
          url: 'https://staging.myapp.com',
          commit: 'abc123',
          branch: 'main',
          description: 'Deploy latest features',
          healthCheck: true,
          autoRollback: true
        },
        {
          id: 2,
          environment: 'production',
          status: 'success',
          startedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86300000).toISOString(),
          duration: 900,
          url: 'https://myapp.com',
          commit: 'def456',
          branch: 'main',
          description: 'Production release v1.2.0',
          healthCheck: true,
          autoRollback: true
        }
      ];
      setDeployments(mockDeployments);
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!deployConfig.description.trim()) return;

    try {
      const deployment = {
        id: Date.now(),
        ...deployConfig,
        status: 'running',
        startedAt: new Date().toISOString(),
        completedAt: null,
        duration: 0,
        url: deployConfig.environment === 'staging' ? 'https://staging.myapp.com' : 'https://myapp.com',
        commit: Math.random().toString(36).substring(7)
      };

      setDeployments(prev => [deployment, ...prev]);
      setIsDeployModalOpen(false);
      setDeployConfig({
        environment: 'staging',
        branch: 'main',
        description: '',
        autoRollback: true,
        healthCheck: true
      });

      // Simulate deployment completion
      setTimeout(() => {
        setDeployments(prev => prev.map(d => 
          d.id === deployment.id 
            ? { ...d, status: 'success', completedAt: new Date().toISOString(), duration: Math.floor(Math.random() * 600) + 300 }
            : d
        ));
      }, 5000);
    } catch (error) {
      console.error('Error deploying:', error);
    }
  };

  const rollbackDeployment = (deploymentId) => {
    if (confirm('Are you sure you want to rollback this deployment?')) {
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId 
          ? { ...d, status: 'rolling_back' }
          : d
      ));
      
      // Simulate rollback completion
      setTimeout(() => {
        setDeployments(prev => prev.map(d => 
          d.id === deploymentId 
            ? { ...d, status: 'rolled_back' }
            : d
        ));
      }, 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'running': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'rolling_back': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'rolled_back': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      case 'rolling_back': return '⏪';
      case 'rolled_back': return '↩️';
      default: return '❓';
    }
  };

  const getEnvironmentIcon = (env) => {
    switch (env) {
      case 'staging': return '🧪';
      case 'production': return '🚀';
      case 'development': return '🔧';
      default: return '🌍';
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = {
    total: deployments.length,
    success: deployments.filter(d => d.status === 'success').length,
    failed: deployments.filter(d => d.status === 'failed').length,
    running: deployments.filter(d => d.status === 'running').length,
    successRate: deployments.length > 0 ? Math.round((deployments.filter(d => d.status === 'success').length / deployments.length) * 100) : 0
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deploy</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">One-click deployments with health checks & rollback</p>
        </div>
        <button
          onClick={() => setIsDeployModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
        >
          + New Deployment
        </button>
      </div>

      {/* Quick Deploy Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setDeployConfig(prev => ({ ...prev, environment: 'staging', description: 'Quick deploy to staging' }));
            setIsDeployModalOpen(true);
          }}
          className="glass-card p-6 rounded-xl hover-lift text-center"
        >
          <div className="text-4xl mb-3">🧪</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deploy to Staging</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Test your changes in a safe environment</p>
        </button>
        
        <button
          onClick={() => {
            setDeployConfig(prev => ({ ...prev, environment: 'production', description: 'Production deployment' }));
            setIsDeployModalOpen(true);
          }}
          className="glass-card p-6 rounded-xl hover-lift text-center"
        >
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deploy to Production</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Release to your live environment</p>
        </button>
        
        <button
          onClick={() => {
            setDeployConfig(prev => ({ ...prev, environment: 'development', description: 'Development deployment' }));
            setIsDeployModalOpen(true);
          }}
          className="glass-card p-6 rounded-xl hover-lift text-center"
        >
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deploy to Dev</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Deploy to development environment</p>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Deployments</p>
        </div>
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.success}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Successful</p>
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

      {/* Deployments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Deployments</h2>
        
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 shimmer rounded"></div>
                <div className="h-6 w-16 shimmer rounded-full"></div>
              </div>
              <div className="h-4 shimmer rounded mb-2"></div>
              <div className="h-4 shimmer rounded w-2/3"></div>
            </div>
          ))
        ) : deployments.length > 0 ? (
          deployments.map((deployment) => (
            <div key={deployment.id} className="glass-card hover-lift p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-400 grid place-items-center">
                    <span className="text-black font-bold text-sm">
                      {getEnvironmentIcon(deployment.environment)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white capitalize">
                      {deployment.environment} Deployment
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {deployment.branch} • {deployment.commit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(deployment.status)}`}>
                    {getStatusIcon(deployment.status)} {deployment.status}
                  </span>
                  {deployment.duration > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDuration(deployment.duration)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  {deployment.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Started:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(deployment.startedAt).toLocaleString()}
                  </span>
                </div>
                
                {deployment.completedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(deployment.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Health Check: {deployment.healthCheck ? '✅ Enabled' : '❌ Disabled'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Auto Rollback: {deployment.autoRollback ? '✅ Enabled' : '❌ Disabled'}
                  </span>
                </div>
                
                {deployment.url && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">URL:</span>
                    <a 
                      href={deployment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {deployment.url}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                {deployment.status === 'success' && (
                  <button
                    onClick={() => rollbackDeployment(deployment.id)}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Rollback
                  </button>
                )}
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  View Logs
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Re-deploy
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No deployments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Deploy your first application to see deployment history and metrics
            </p>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
            >
              Deploy Now
            </button>
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      <Dialog open={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-card w-full max-w-md p-6 rounded-xl shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              New Deployment
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environment *
                </label>
                <select
                  value={deployConfig.environment}
                  onChange={(e) => setDeployConfig(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch
                </label>
                <select
                  value={deployConfig.branch}
                  onChange={(e) => setDeployConfig(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="feature/new-feature">feature/new-feature</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={deployConfig.description}
                  onChange={(e) => setDeployConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you're deploying..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={3}
                  autoFocus
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Health Check
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Verify deployment health before completing
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={deployConfig.healthCheck}
                    onChange={(e) => setDeployConfig(prev => ({ ...prev, healthCheck: e.target.checked }))}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto Rollback
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically rollback on failure
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={deployConfig.autoRollback}
                    onChange={(e) => setDeployConfig(prev => ({ ...prev, autoRollback: e.target.checked }))}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={!deployConfig.description.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deploy
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default Deploy;