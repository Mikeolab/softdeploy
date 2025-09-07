// AI Usage Monitor Component
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AIUsageMonitor = ({ isOpen, onClose }) => {
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsageStats();
    }
  }, [isOpen]);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/usage');
      const result = await response.json();
      
      if (result.success) {
        setUsageStats(result.usage);
      } else {
        setError(result.error || 'Failed to fetch usage stats');
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
  };

  const getStatusIcon = (available) => {
    return available ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Usage Monitor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track your AI API usage and limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading usage stats...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {usageStats && !loading && (
            <div className="space-y-6">
              {/* Service Status */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(usageStats.available)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        AI Service Status
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {usageStats.available ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Model: {usageStats.model}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {usageStats.freeTier ? 'Free Tier' : 'Paid Tier'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Usage Statistics
                </h3>

                {/* Daily Usage */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Daily Usage</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getUsageColor(getUsagePercentage(usageStats.usage.dailyRequests, usageStats.limits.dailyLimit))}`}>
                      {usageStats.usage.dailyRequests} / {usageStats.limits.dailyLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUsagePercentage(usageStats.usage.dailyRequests, usageStats.limits.dailyLimit)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {usageStats.usage.dailyRemaining} requests remaining today
                  </p>
                </div>

                {/* Hourly Usage */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Hourly Usage</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getUsageColor(getUsagePercentage(usageStats.usage.hourlyRequests, usageStats.limits.hourlyLimit))}`}>
                      {usageStats.usage.hourlyRequests} / {usageStats.limits.hourlyLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUsagePercentage(usageStats.usage.hourlyRequests, usageStats.limits.hourlyLimit)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {usageStats.usage.hourlyRemaining} requests remaining this hour
                  </p>
                </div>

                {/* Per Minute Usage */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Per Minute Usage</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getUsageColor(getUsagePercentage(usageStats.usage.requestsPerMinute, usageStats.limits.requestsPerMinute))}`}>
                      {usageStats.usage.requestsPerMinute} / {usageStats.limits.requestsPerMinute}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUsagePercentage(usageStats.usage.requestsPerMinute, usageStats.limits.requestsPerMinute)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {usageStats.usage.minuteRemaining} requests remaining this minute
                  </p>
                </div>
              </div>

              {/* Total Usage */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Total Requests</h4>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {usageStats.usage.totalRequests}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  All-time requests made
                </p>
              </div>

              {/* Reset Information */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Daily limit resets: {usageStats.lastResetDate}</p>
                <p>Hourly limit resets: Every hour</p>
                <p>Per-minute limit resets: Every minute</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIUsageMonitor;
