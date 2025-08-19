import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user] = useState({ name: 'John Doe', email: 'john@example.com' });
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };

  const stats = [
    { label: 'Total Deployments', value: '127', change: '+12%', trend: 'up' },
    { label: 'Success Rate', value: '98.4%', change: '+2.1%', trend: 'up' },
    { label: 'Avg Deploy Time', value: '4.2 min', change: '-15%', trend: 'down' },
    { label: 'Active Projects', value: '8', change: '+1', trend: 'up' }
  ];

  const recentDeployments = [
    { id: 1, project: 'Frontend App', status: 'Success', time: '2 min ago', duration: '3.2 min' },
    { id: 2, project: 'API Service', status: 'Success', time: '15 min ago', duration: '4.1 min' },
    { id: 3, project: 'Database Migration', status: 'Failed', time: '1 hour ago', duration: '12.3 min' },
    { id: 4, project: 'Analytics Dashboard', status: 'Success', time: '3 hours ago', duration: '2.8 min' }
  ];

  const projects = [
    { name: 'Frontend App', status: 'Active', deployments: 45, lastDeploy: '2 min ago' },
    { name: 'API Service', status: 'Active', deployments: 32, lastDeploy: '15 min ago' },
    { name: 'Analytics Dashboard', status: 'Active', deployments: 28, lastDeploy: '3 hours ago' },
    { name: 'Mobile Backend', status: 'Inactive', deployments: 12, lastDeploy: '2 days ago' }
  ];

  return (
    <div className="min-h-screen bg-[#0e1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
                  <span className="text-black font-bold text-sm">SD</span>
                </div>
                <span className="text-xl font-bold text-white">SoftDeploy</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-300 hover:text-white">Projects</a>
              <a href="#" className="text-gray-300 hover:text-white">Deployments</a>
              <a href="#" className="text-gray-300 hover:text-white">Analytics</a>
              <a href="#" className="text-gray-300 hover:text-white">Settings</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5z" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-400">Here's what's happening with your deployments today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  <svg className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                  </svg>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Deployments */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="p-6 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold text-white">Recent Deployments</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDeployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${deployment.status === 'Success' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-white font-medium">{deployment.project}</p>
                        <p className="text-gray-400 text-sm">{deployment.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${deployment.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                        {deployment.status}
                      </p>
                      <p className="text-gray-400 text-xs">{deployment.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-center text-blue-400 hover:text-blue-300 text-sm">
                View all deployments
              </button>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="p-6 border-b border-[#30363d] flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Projects</h2>
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-400 hover:to-cyan-400">
                New Project
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                    <div>
                      <p className="text-white font-medium">{project.name}</p>
                      <p className="text-gray-400 text-sm">{project.deployments} deployments • {project.lastDeploy}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Active' ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                      <button className="text-gray-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-lg hover:bg-[#21262d] transition-colors">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">New Deployment</p>
                <p className="text-gray-400 text-sm">Deploy your latest changes</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-lg hover:bg-[#21262d] transition-colors">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">View Analytics</p>
                <p className="text-gray-400 text-sm">Check performance metrics</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-[#0d1117] rounded-lg hover:bg-[#21262d] transition-colors">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Settings</p>
                <p className="text-gray-400 text-sm">Configure your workspace</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;