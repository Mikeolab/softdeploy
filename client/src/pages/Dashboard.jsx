// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase, ENVIRONMENT } from '../lib/supabaseClient';
import { 
  FolderIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  PlayIcon,
  CogIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ===== Display name helpers =====
  const displayName = useMemo(() => {
    const full = user?.user_metadata?.full_name?.trim();
    if (full) return full;
    return user?.email || 'User';
  }, [user]);

  const firstName = useMemo(() => {
    const full = user?.user_metadata?.full_name?.trim();
    if (full) return full.split(' ')[0];
    return (user?.email || 'User').split('@')[0];
  }, [user]);

  // ===== Data state =====
  const [projects, setProjects] = useState([]);
  const [testPlans, setTestPlans] = useState([]);
  const [recentTestRuns, setRecentTestRuns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  // initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // Listen for test run completion events
  useEffect(() => {
    const handleTestRunCompleted = () => {
      console.log('🔄 [DASHBOARD] Test run completed, refreshing data...');
      fetchDashboardData();
    };

    window.addEventListener('testRunCompleted', handleTestRunCompleted);
    
    return () => {
      window.removeEventListener('testRunCompleted', handleTestRunCompleted);
    };
  }, [user?.id]);

  // ===== Queries =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects count - handle case where table doesn't exist
      let projectsData = [];
      try {
        // First try to get environment-specific projects
        const { data: envData, error: envError } = await supabase
          .from('projects')
          .select('id, name, environment')
          .eq('user_id', user.id)
          .eq('environment', ENVIRONMENT)
          .order('id', { ascending: false })
          .limit(5);

        if (envError || !envData || envData.length === 0) {
          // If no environment-specific projects, try to get all projects (fallback)
          console.warn('No environment-specific projects found, falling back to all projects');
          const { data: allData, error: allError } = await supabase
            .from('projects')
            .select('id, name, environment')
            .eq('user_id', user.id)
            .order('id', { ascending: false })
            .limit(5);

          if (allError) {
            console.warn('Projects table not available:', allError);
            projectsData = [];
          } else {
            projectsData = allData || [];
          }
        } else {
          projectsData = envData;
        }
      } catch (err) {
        console.warn('Could not fetch projects:', err);
        projectsData = [];
      }
      
      // Fetch test plans count - handle case where table doesn't exist
      let testData = [];
      try {
        const { data, error: testError } = await supabase
          .from('test_plans')
          .select('id, title, result, ran_at')
          .eq('user_id', user.id)
          .order('ran_at', { ascending: false })
          .limit(5);

        if (testError) {
          console.warn('Test plans table not available:', testError);
          testData = [];
        } else {
          testData = data || [];
        }
      } catch (err) {
        console.warn('Could not fetch test plans:', err);
        testData = [];
      }

      // Load recent test runs from localStorage
      const savedTestRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      const recentRuns = savedTestRuns
        .sort((a, b) => new Date(b.executedAt || b.timestamp || 0) - new Date(a.executedAt || a.timestamp || 0))
        .slice(0, 5);

      // Calculate recent activity
      const activity = [
        ...(projectsData || []).map(project => ({
          type: 'project',
          title: `Created project "${project.name}"`,
          time: new Date().toISOString(), // Use current time since we don't have created_at
          icon: '📁'
        })),
        ...(testData || []).map(test => ({
          type: 'test',
          title: `Completed test management "${test.title}"`,
          time: test.ran_at,
          icon: '🧪'
        })),
        ...recentRuns.map(run => ({
          type: 'test_run',
          title: `Executed test "${run.testSuite?.name || 'Unknown'}"`,
          time: run.executedAt || run.timestamp,
          icon: run.success ? '✅' : '❌'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setProjects(projectsData || []);
      setTestPlans(testData || []);
      setRecentTestRuns(recentRuns);
      setRecentActivity(activity);
    } catch (err) {
      console.error('fetchDashboardData:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Active Projects', 
      value: projects.length.toString(), 
      change: '+0', 
      trend: 'neutral',
      link: '/projects',
      icon: FolderIcon,
      priority: 'high' // Top-left priority
    },
    { 
      label: 'Test Runs', 
      value: recentTestRuns.length.toString(), 
      change: recentTestRuns.length > 0 ? `+${recentTestRuns.length}` : '0', 
      trend: recentTestRuns.length > 0 ? 'up' : 'neutral',
      link: '/test-management',
      icon: PlayIcon,
      priority: 'high' // Top-left priority
    },
    { 
      label: 'Success Rate', 
      value: recentTestRuns.length > 0 ? 
        `${Math.round((recentTestRuns.filter(run => run.success).length / recentTestRuns.length) * 100)}%` : 
        '-', 
      change: '+5%', 
      trend: 'up',
      link: '/test-management',
      icon: ChartBarIcon,
      priority: 'medium'
    },
    { 
      label: 'Avg Deploy Time', 
      value: '2.3m', 
      change: '-0.5m', 
      trend: 'down',
      link: '/projects',
      icon: ClockIcon,
      priority: 'low'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new project with AI-powered workflows',
      icon: PlusIcon,
      link: '/projects',
      action: 'Create'
    },
    {
      title: 'View Projects',
      description: 'Manage your existing projects and deployments',
      icon: FolderIcon,
      link: '/projects',
      action: 'View'
    },
    {
      title: 'Test Management',
      description: 'Create and manage test plans for your projects',
      icon: CogIcon,
      link: '/test-management',
      action: 'Manage'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Clean and minimal */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {firstName}
        </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your development workspace overview
        </p>
      </div>

        {/* Key Metrics - Top-left priority layout */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const IconComponent = stat.icon;
              return (
          <Link 
            key={i} 
            to={stat.link}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.label}
                        </p>
                      </div>
              </div>
                    <span className={`text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
          </Link>
              );
            })}
          </div>
      </div>

        {/* Quick Actions - Clean and functional */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => {
              const IconComponent = action.icon;
              return (
            <Link
              key={i}
              to={action.link}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {action.title}
              </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Test Runs - Clean list design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Test Runs
            </h2>
            <Link to="/test-management" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : recentTestRuns.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentTestRuns.map((run, i) => (
                  <div key={run.id || i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        run.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {run.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                               {run.testSuite?.name || run.testSuiteName || 'Unknown Test'}
                             </p>
                             <p className="text-xs text-gray-500 dark:text-gray-400">
                               {run.testSuite?.testType || run.testType || 'Unknown'} • {run.passedSteps || 0}/{run.totalSteps || 0} passed • {run.executedAt ? new Date(run.executedAt).toLocaleDateString() : run.timestamp ? new Date(run.timestamp).toLocaleDateString() : 'Unknown date'}
                             </p>
                           </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  No test runs yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Create and run your first test to see results here
                </p>
                <Link 
                  to="/test-management"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Testing
                </Link>
              </div>
            )}
        </div>
      </div>

        {/* Recent Activity - Clean timeline design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h2>
            <Link to="/projects" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
              View all
          </Link>
        </div>
        
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
              <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
                </div>
            </div>
          ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="p-6 text-center">
                <div className="text-2xl mb-4">🎉</div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Welcome to SoftDeploy!
              </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your activity will appear here as you start using the platform
                </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
