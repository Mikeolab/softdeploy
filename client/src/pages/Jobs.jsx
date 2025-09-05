// src/pages/Jobs.jsx
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog } from '@headlessui/react';

function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    schedule: 'manual',
    cronExpression: '',
    testType: 'automated',
    environment: 'staging'
  });

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Fetch jobs from Supabase (when jobs table is created)
      // For now, return empty array to show clean state
      setJobs([]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.name.trim()) return;

    try {
      // In a real app, you'd save to a jobs table
      const job = {
        id: Date.now(),
        ...newJob,
        status: 'active',
        lastRun: null,
        nextRun: newJob.schedule === 'manual' ? null : new Date(Date.now() + 86400000).toISOString(),
        successRate: 0
      };

      setJobs(prev => [job, ...prev]);
      setNewJob({
        name: '',
        description: '',
        schedule: 'manual',
        cronExpression: '',
        testType: 'automated',
        environment: 'staging'
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const toggleJobStatus = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === 'active' ? 'inactive' : 'active' }
        : job
    ));
  };

  const deleteJob = (jobId) => {
    if (confirm('Are you sure you want to delete this job?')) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400';
      case 'inactive': return 'bg-gray-500/10 text-gray-400';
      case 'running': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getScheduleIcon = (schedule) => {
    switch (schedule) {
      case 'manual': return '🖱️';
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'custom': return '⚙️';
      default: return '⏰';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Define and schedule automated test jobs</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
        >
          + New Job
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 shimmer rounded-lg"></div>
                <div className="w-16 h-6 shimmer rounded-full"></div>
              </div>
              <div className="h-6 shimmer rounded mb-3"></div>
              <div className="h-4 shimmer rounded mb-2"></div>
              <div className="h-4 shimmer rounded w-2/3"></div>
            </div>
          ))
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="glass-card hover-lift p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center">
                  <span className="text-black font-bold text-sm">
                    {getScheduleIcon(job.schedule)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <button
                    onClick={() => toggleJobStatus(job.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {job.name}
              </h3>
              
              {job.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {job.description}
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Schedule:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{job.schedule}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Success Rate:</span>
                  <span className="text-gray-900 dark:text-white">{job.successRate}%</span>
                </div>
                {job.lastRun && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last Run:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(job.lastRun).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium">
                  Run Now
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="py-2 px-3 border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs configured
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first automated test job to streamline your testing process
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
            >
              Create your first job
            </button>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="glass-card w-full max-w-md p-6 rounded-xl shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Job
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Name *
                </label>
                <input
                  value={newJob.name}
                  onChange={(e) => setNewJob(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g. Daily E2E Tests"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this job does..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule
                </label>
                <select
                  value={newJob.schedule}
                  onChange={(e) => setNewJob(prev => ({ ...prev, schedule: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="manual">Manual</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom (Cron)</option>
                </select>
              </div>
              
              {newJob.schedule === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cron Expression
                  </label>
                  <input
                    value={newJob.cronExpression}
                    onChange={(e) => setNewJob(prev => ({ ...prev, cronExpression: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g. 0 0 * * * (daily at midnight)"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type
                </label>
                <select
                  value={newJob.testType}
                  onChange={(e) => setNewJob(prev => ({ ...prev, testType: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="automated">Automated Tests</option>
                  <option value="performance">Performance Tests</option>
                  <option value="security">Security Tests</option>
                  <option value="integration">Integration Tests</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environment
                </label>
                <select
                  value={newJob.environment}
                  onChange={(e) => setNewJob(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={!newJob.name.trim()}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Job
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default Jobs;
