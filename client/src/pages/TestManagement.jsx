// src/pages/TestManagement.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import TestFolderManager from '../components/TestFolderManager';
import TestSuiteConfiguration from '../components/TestSuiteConfiguration';
import AdvancedTestBuilderV2 from '../components/AdvancedTestBuilderV2';

const TestManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folderId } = useParams();
  const [currentView, setCurrentView] = useState('folders'); // 'folders', 'folder', 'test'
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setCurrentView('folder');
    // Update URL to reflect the current folder
    navigate(`/test-management/${folder.id}`);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setCurrentView('folders');
    navigate('/test-management');
  };

  const handleRunTest = (testSuite) => {
    setSelectedTestSuite(testSuite);
    setCurrentView('test');
  };

  const handleBackToFolder = () => {
    setSelectedTestSuite(null);
    setCurrentView('folder');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access test management
          </h2>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'folders' && (
          <TestFolderManager
            onFolderSelect={handleFolderSelect}
            onCreateFolder={handleFolderSelect}
          />
        )}
        
        {currentView === 'folder' && selectedFolder && (
          <TestSuiteConfiguration
            folder={selectedFolder}
            onBack={handleBackToFolders}
            onRunTest={handleRunTest}
          />
        )}
        
        {currentView === 'test' && selectedTestSuite && (
          <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToFolder}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {selectedFolder?.name}
              </button>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Running: {selectedTestSuite.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Execute and monitor your test suite
                </p>
              </div>
            </div>
            
            {/* Test Execution Component */}
            <AdvancedTestBuilderV2 
              initialTestSuite={selectedTestSuite}
              onTestComplete={() => {
                // Optionally navigate back to folder after test completion
                setTimeout(() => {
                  handleBackToFolder();
                }, 5000);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestManagement;