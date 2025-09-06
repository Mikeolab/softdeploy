// src/pages/ProjectDetail.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog } from '@headlessui/react';

function ProjectDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  // ===== Display name helpers =====
  const displayName = useMemo(() => {
    const full = user?.user_metadata?.full_name?.trim();
    if (full) return full;
    return user?.email || 'User';
  }, [user]);

  // ===== Data state =====
  const [project, setProject] = useState(null);
  const [testPlans, setTestPlans] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);

  // redirect if no user
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // initial fetch
  useEffect(() => {
    if (user?.id && projectId) {
      fetchProjectData();
    }
  }, [user?.id, projectId]);

  // ===== Functions =====
  const loadRecentRuns = () => {
    try {
      const savedRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      // Sort by executedAt date, most recent first
      const sortedRuns = savedRuns.sort((a, b) => {
        const dateA = new Date(a.executedAt || a.timestamp || 0);
        const dateB = new Date(b.executedAt || b.timestamp || 0);
        return dateB - dateA;
      });
      setRecentRuns(sortedRuns);
      console.log('📊 [PROJECT_DETAIL] Loaded recent runs:', sortedRuns.length);
    } catch (error) {
      console.error('Error loading recent runs:', error);
      setRecentRuns([]);
    }
  };

  // Listen for test run completion events to sync with dashboard
  useEffect(() => {
    const handleTestRunCompleted = () => {
      console.log('🔄 [PROJECT_DETAIL] Test run completed, refreshing data...');
      loadRecentRuns();
    };

    window.addEventListener('testRunCompleted', handleTestRunCompleted);
    
    return () => {
      window.removeEventListener('testRunCompleted', handleTestRunCompleted);
    };
  }, []);

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(project.name);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === project.name) {
      handleCancelEdit();
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('projects')
        .update({ name: editedName.trim() })
        .eq('id', project.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProject({ ...project, name: editedName.trim() });
      setIsEditingName(false);
      setEditedName('');
    } catch (error) {
      console.error('Error updating project name:', error);
      alert('Failed to update project name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ===== Queries =====
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        // Only redirect if it's a "not found" error, not for other errors
        if (projectError.code === 'PGRST116') {
          navigate('/projects');
          return;
        }
        throw projectError;
      }
      
      setProject(projectData);

      // Fetch test plans for this user (since test_plans table doesn't have project_id)
      const { data: testData, error: testError } = await supabase
        .from('test_plans')
        .select('id, title, result, owner_name, ran_at')
        .eq('user_id', user.id)
        .order('ran_at', { ascending: false });

      if (testError) {
        console.error('Test plans fetch error:', testError);
        // Don't throw error for test plans, just set empty array
        setTestPlans([]);
      } else {
      setTestPlans(testData || []);
      }
      
      // Load recent runs from localStorage
      loadRecentRuns();
    } catch (err) {
      console.error('fetchProjectData:', err.message);
      // Don't automatically redirect on errors, let the user see the error
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading project...</p>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'test-management', label: 'Test Management', icon: '🧪' },
    { id: 'deployments', label: 'Deployments', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const stats = [
    { label: 'Total Deployments', value: 0, icon: '📦' },
    { label: 'Test Plans', value: testPlans.length, icon: '🧪' },
    { label: 'Success Rate', value: '-', icon: '📊' },
    { label: 'Last Deploy', value: 'Never', icon: '🕒' }
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/projects" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Projects
            </Link>
            <span className="text-gray-400">/</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-cyan-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
          </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <button
                  onClick={handleEditName}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Edit project name"
            >
                  ✏️
            </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                 Active
               </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
                 Project ID: {project.id}
               </span>
             </div>
          </div>
          <div className="flex gap-3">
            <button
            onClick={() => setActiveTab('test-management')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
            >
              + New Test Plan
            </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Deploy
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{stat.icon}</span>
              </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Runs */}
              <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Runs</h3>
                    <button
                    onClick={() => setActiveTab('test-management')}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentRuns.slice(0, 3).map((run) => (
                    <div key={run.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {run.testSuite?.name || run.testSuiteName || 'Unknown Test'}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {run.testSuite?.testType || run.testType || 'Unknown'} • {run.passedSteps || 0}/{run.totalSteps || 0} passed
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {run.executedAt ? new Date(run.executedAt).toLocaleString() : 
                             run.timestamp ? new Date(run.timestamp).toLocaleString() : 'Unknown date'}
                          </p>
                        </div>
                        <div className="flex items-center ml-2">
                          {run.success ? (
                            <span className="text-green-500 text-lg">✅</span>
                          ) : (
                            <span className="text-red-500 text-lg">❌</span>
                          )}
                        </div>
                      </div>
                      </div>
                    ))}
                    {recentRuns.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No test runs yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Deployments */}
              <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Deployments</h3>
                    <button
                      onClick={() => setActiveTab('deployments')}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No deployments yet.</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold">
                      Deploy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === 'test-management' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Management</h2>
                <div className="relative">
                <button
                    onClick={() => navigate(`/test-management?project=${projectId}`)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
                >
                    + Create
                </button>
                </div>
              </div>
              
              {/* Recent Test Runs */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Test Runs</h3>
                  <button
                    onClick={() => navigate(`/test-management?project=${projectId}`)}
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                  >
                    View all →
                  </button>
                </div>
              <div className="space-y-3">
                  {recentRuns.slice(0, 5).map((run) => (
                    <div key={run.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {run.testSuite?.name || run.testSuiteName || 'Unknown Test'}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {run.testSuite?.testType || run.testType || 'Unknown'} • {run.passedSteps || 0}/{run.totalSteps || 0} passed
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {run.executedAt ? new Date(run.executedAt).toLocaleString() : 
                             run.timestamp ? new Date(run.timestamp).toLocaleString() : 'Unknown date'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {run.success ? (
                            <span className="text-green-500 text-lg">✅</span>
                          ) : (
                            <span className="text-red-500 text-lg">❌</span>
                          )}
                          <button
                            onClick={() => navigate(`/test-management?project=${projectId}`)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentRuns.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🧪</div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No test runs yet</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Create and run your first test to see results here</p>
                    <button
                        onClick={() => navigate(`/test-management?project=${projectId}`)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
                    >
                        Start Testing
                    </button>
                  </div>
                )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate(`/test-management?project=${projectId}`)}
                  className="glass-card p-4 rounded-xl text-left hover:shadow-lg transition-shadow"
                >
                  <div className="text-2xl mb-2">📁</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Folders</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Organize tests by folders</p>
                </button>
                <button
                  onClick={() => navigate(`/test-management?project=${projectId}`)}
                  className="glass-card p-4 rounded-xl text-left hover:shadow-lg transition-shadow"
                >
                  <div className="text-2xl mb-2">🧪</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Suites</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Create test configurations</p>
                </button>
                <button
                  onClick={() => navigate(`/test-management?project=${projectId}`)}
                  className="glass-card p-4 rounded-xl text-left hover:shadow-lg transition-shadow"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">View test performance</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Deployments</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold">
                  Deploy Now
                </button>
              </div>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No deployments yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Deploy your project to see deployment history and metrics</p>
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold">
                  Deploy Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Settings</h2>
              
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
                <div className="space-y-4">
                                     <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={saving}
                          className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                     <input
                       value={project.name}
                          className="flex-1 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                       readOnly
                     />
                        <button
                          onClick={handleEditName}
                          className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                   </div>
                   <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project ID</label>
                     <input
                       value={project.id}
                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                       readOnly
                     />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

export default ProjectDetail;
