import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  PlusIcon, 
  ChevronRightIcon,
  CogIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const TestFolderManager = ({ onFolderSelect, onCreateFolder }) => {
  const [folders, setFolders] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  useEffect(() => {
    // Load folders from localStorage
    const savedFolders = JSON.parse(localStorage.getItem('testFolders') || '[]');
    setFolders(savedFolders);
  }, []);

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newFolderName.trim(),
      description: newFolderDescription.trim(),
      createdAt: new Date().toISOString(),
      testSuites: [],
      status: 'active'
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('testFolders', JSON.stringify(updatedFolders));

    setNewFolderName('');
    setNewFolderDescription('');
    setShowCreateForm(false);
    
    // Navigate to the new folder
    onFolderSelect(newFolder);
  };

  const deleteFolder = (folderId, e) => {
    e.stopPropagation();
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem('testFolders', JSON.stringify(updatedFolders));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Test Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your tests into folders and suites
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Test Folder
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., API Tests, E2E Tests, Performance Tests"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Describe what this folder contains..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FolderIcon className="h-5 w-5" />
                Create Folder
              </button>
              
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderSelect(folder)}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => deleteFolder(folder.id, e)}
              className="absolute top-3 right-3 p-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete folder"
            >
              <TrashIcon className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FolderIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {folder.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {folder.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {folder.testSuites.length} test suites
                  </span>
                  <span>
                    Created {new Date(folder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  folder.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {folder.status}
                </span>
              </div>
              
              <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {folders.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No test folders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first test folder to organize your test suites
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Folder
          </button>
        </div>
      )}
    </div>
  );
};

export default TestFolderManager;
