// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

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

  // ===== Queries =====
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects count
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(5);

      if (projectsError) throw projectsError;
      
      // Fetch test plans count
      const { data: testData, error: testError } = await supabase
        .from('test_plans')
        .select('id, title, result, ran_at')
        .eq('user_id', user.id)
        .order('ran_at', { ascending: false })
        .limit(5);

      if (testError) throw testError;

      // Load recent test runs from localStorage
      const savedTestRuns = JSON.parse(localStorage.getItem('testRunsV2') || '[]');
      const recentRuns = savedTestRuns
        .sort((a, b) => new Date(b.executedAt || b.timestamp) - new Date(a.executedAt || a.timestamp))
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
      icon: '📁',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Recent Test Runs', 
      value: recentTestRuns.length.toString(), 
      change: recentTestRuns.length > 0 ? `+${recentTestRuns.length}` : '0', 
      trend: recentTestRuns.length > 0 ? 'up' : 'neutral',
      link: '/test-management',
      icon: '🧪',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Success Rate', 
      value: recentTestRuns.length > 0 ? 
        `${Math.round((recentTestRuns.filter(run => run.success).length / recentTestRuns.length) * 100)}%` : 
        '-', 
      change: '+5%', 
      trend: 'up',
      link: '/test-management',
      icon: '📊',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Avg Deploy Time', 
      value: '2.3m', 
      change: '-0.5m', 
      trend: 'down',
      link: '/projects',
      icon: '⚡',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new project with AI-powered workflows',
      icon: '🚀',
      link: '/projects',
      action: 'Create',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'View Projects',
      description: 'Manage your existing projects and deployments',
      icon: '📁',
      link: '/projects',
      action: 'View',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Test Management',
      description: 'Create and manage test plans for your projects',
      icon: '🧪',
      link: '/projects',
      action: 'Manage',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your AI-powered development workspace overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            to={stat.link}
            className="group glass-card hover-lift p-6 rounded-xl cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.link}
              className="group glass-card hover-lift p-6 rounded-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <span className="text-sm text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 transition-colors">
                  {action.action} →
                </span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Test Runs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Test Runs
          </h2>
          <Link to="/test-management" className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors">
            View all →
          </Link>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 shimmer rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 shimmer rounded w-3/4"></div>
                    <div className="h-3 shimmer rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentTestRuns.length > 0 ? (
            <div className="space-y-4">
              {recentTestRuns.map((run, i) => (
                <div key={run.id || i} className="flex items-center gap-4 animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    run.success ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-700 dark:to-green-600' : 
                    'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-700 dark:to-red-600'
                  }`}>
                    <span className="text-sm">{run.success ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {run.testSuite?.name || 'Unknown Test'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {run.testSuite?.testType || 'Unknown'} • {run.passedSteps || 0}/{run.totalSteps || 0} passed • {run.executedAt ? new Date(run.executedAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No test runs yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create and run your first test to see results here
              </p>
              <Link 
                to="/test-management"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold"
              >
                Start Testing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <Link to="/projects" className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors">
            View all →
          </Link>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 shimmer rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 shimmer rounded w-3/4"></div>
                    <div className="h-3 shimmer rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to SoftDeploy!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start by creating your first project to see activity here
              </p>
              <Link 
                to="/projects"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Create Your First Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
