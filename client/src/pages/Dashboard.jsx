// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // Not authenticated? redirect to homepage
    useEffect(() => {
      navigate('/');
    }, []);
    return null;
  }

  // Identify test user
  const isTestUser = user.email === 'testuser@softdeploy.dev';

  // Stats for test/demo only
  const demoStats = [
    { label: 'Total Deployments', value: '127', change: '+12%', trend: 'up' },
    { label: 'Success Rate', value: '98.4%', change: '+2.1%', trend: 'up' },
    { label: 'Avg Deploy Time', value: '4.2 min', change: '-15%', trend: 'down' },
    { label: 'Active Projects', value: '8', change: '+1', trend: 'up' },
  ];

  // Empty default for new users
  const newStats = [
    { label: 'Total Deployments', value: '0', change: '-', trend: 'neutral' },
    { label: 'Success Rate', value: '-', change: '-', trend: 'neutral' },
    { label: 'Avg Deploy Time', value: '-', change: '-', trend: 'neutral' },
    { label: 'Active Projects', value: '0', change: '-', trend: 'neutral' },
  ];

  const stats = isTestUser ? demoStats : newStats;

  return (
    <div className="min-h-screen bg-[#0e1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
                <span className="text-black font-bold text-sm">SD</span>
              </div>
              <span className="text-xl font-bold text-white">SoftDeploy</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-300 hover:text-white">Projects</a>
              <a href="#" className="text-gray-300 hover:text-white">Deployments</a>
              <a href="#" className="text-gray-300 hover:text-white">Analytics</a>
              <a href="#" className="text-gray-300 hover:text-white">Settings</a>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-white text-sm font-medium hidden md:inline">
                {user.name}
              </span>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-400 mb-6">
          {isTestUser
            ? `Here's what's happening in your demo workspace.`
            : `Let's get started! Create your first project or deploy.`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              {stat.trend !== 'neutral' && (
                <p 
                  className={`mt-1 text-sm ${
                    stat.trend === 'up' 
                      ? 'text-green-400' 
                      : stat.trend === 'down' 
                      ? 'text-red-400' 
                      : 'text-gray-400'
                  }`}
                >
                  {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* You can now add: Deploys, Projects, Recent builds below only if `isTestUser === true` */}
        {!isTestUser && (
          <div className="mt-10 border border-dashed border-cyan-500 p-8 text-center text-white/70 rounded-lg">
            <p>No activity yet. Let's build something amazing 🚀</p>
          </div>
        )}
      </main>
    </div>
  );
}
export default Dashboard;