// src/pages/Settings.jsx
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account preferences and development settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Account Settings
          </h2>
          
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.user_metadata?.full_name || ''}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Preferences
          </h2>
          
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose your preferred color scheme
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              >
                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-sm font-medium">
                  {theme === 'dark' ? 'Dark' : 'Light'} Mode
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          About SoftDeploy
        </h2>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
                <span className="text-black font-bold text-sm">SD</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  SoftDeploy v1.0.0
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI-powered development workflows
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>• Modern CI/CD with AI assistance</p>
              <p>• Automated testing and deployment</p>
              <p>• Real-time monitoring and analytics</p>
              <p>• Team collaboration tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
