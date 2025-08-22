// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  const isTestUser = user?.email?.trim().toLowerCase() === 'testuser@softdeploy.dev';

  // 🔹 Dummy (test user only)
  const demoStats = [
    { label: 'Total Deployments', value: '127', change: '+12%', trend: 'up' },
    { label: 'Success Rate', value: '98.4%', change: '+2.1%', trend: 'up' },
    { label: 'Avg Deploy Time', value: '4.2 min', change: '-15%', trend: 'down' },
    { label: 'Active Projects', value: '8', change: '+1', trend: 'up' },
  ];

  const demoDeployments = [
    { id: '#1240', project: 'Login Gateway', status: 'Passed', duration: '9.93', time: '2 mins ago' },
    { id: '#1239', project: 'Frontend App', status: 'Queued', duration: '3.75', time: '7 mins ago' },
    { id: '#1238', project: 'API Service', status: 'Failed', duration: '6.41', time: '15 mins ago' },
    { id: '#1237', project: 'Login Gateway', status: 'Running', duration: '4.12', time: '30 mins ago' },
  ];

  const demoProjects = [
    { name: 'Frontend App', status: 'Active', deploys: 45, lastDeploy: '2 min ago' },
    { name: 'API Service', status: 'Active', deploys: 32, lastDeploy: '15 min ago' },
  ];

  const demoTests = [
    { title: 'Login Flow', status: '5 / 5 passed', owner: 'QA Team', lastRun: 'Today • 8:40am' },
    { title: 'Checkout Flow', status: '6 / 8 passed', owner: 'Automation Bot', lastRun: 'Today • 9:10am' },
  ];

  // 🧼 Real user: Local state to simulate project list for now
  const [realProjects, setRealProjects] = useState([]);

  // Real user stats (placeholder logic)
  const realStats = [
    { label: 'Total Deployments', value: '0', change: '-', trend: 'neutral' },
    { label: 'Success Rate', value: '-', change: '-', trend: 'neutral' },
    { label: 'Avg Deploy Time', value: '-', change: '-', trend: 'neutral' },
    { label: 'Active Projects', value: realProjects.length.toString(), change: '+0', trend: 'neutral' },
  ];

  const stats = isTestUser ? demoStats : realStats;

  const handleAddProject = () => {
    const newProject = {
      name: `New Project ${realProjects.length + 1}`,
      status: 'Active',
      deploys: 0,
      lastDeploy: 'Just Created',
    };
    setRealProjects([newProject, ...realProjects]);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-white">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
              <span className="text-black font-bold text-sm">SD</span>
            </div>
            <span className="text-xl font-bold">SoftDeploy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-300 hover:text-white">Projects</a>
            <a href="#" className="text-gray-300 hover:text-white">Deployments</a>
            <a href="#" className="text-gray-300 hover:text-white">Settings</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:inline">{user.name}</span>
            <button onClick={() => { logout(); navigate('/') }} className="text-sm text-gray-400 hover:text-white">Logout</button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Hello */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-white/60">
            {isTestUser
              ? `Here's what's happening in your demo workspace.`
              : `Build your first deployment or project in your workspace.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
              <p className="text-sm text-white/50">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p className={`text-sm mt-1 ${
                stat.trend === 'up' ? 'text-green-400'
                : stat.trend === 'down' ? 'text-red-400'
                : 'text-gray-400'
              }`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* 3 Column Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deployments */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <Link to="/deployments" className="font-semibold hover:underline">📦 Deployments</Link>
              <span className="text-xs text-cyan-500 cursor-pointer">More</span>
            </div>
            <div className="space-y-3">
              {(isTestUser ? demoDeployments : []).length > 0 ? (
                (isTestUser ? demoDeployments : []).map((d, i) => (
                  <div key={i} className="bg-[#0d1117] p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{d.project}</p>
                      <p className="text-xs text-white/40">Build {d.id} • {d.time}</p>
                    </div>
                    <div className="text-sm text-right">
                      <span className={`px-3 py-1 rounded-full ${
                        d.status === 'Passed' ? 'bg-green-500/10 text-green-400'
                        : d.status === 'Failed' ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                      }`}>
                        {d.status}
                      </span>
                      <p className="text-xs text-white/40">{d.duration} min</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No deployments yet.</p>
              )}
            </div>
          </section>

          {/* Test Management */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <Link to="/tests" className="font-semibold hover:underline">🧪 Test Plans</Link>
              <span className="text-xs text-cyan-500 cursor-pointer">More</span>
            </div>
            <div className="space-y-3">
              {(isTestUser ? demoTests : []).length > 0 ? (
                (isTestUser ? demoTests : []).map((t, i) => (
                  <div key={i} className="bg-[#0d1117] p-3 rounded">
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-white/60">{t.status}</p>
                    <p className="text-xs text-white/30">{t.owner} • {t.lastRun}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No test plans available.</p>
              )}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <Link to="/projects" className="font-semibold hover:underline">🧱 Projects</Link>
              <button
                onClick={handleAddProject}
                className="text-xs text-black bg-cyan-500 px-3 py-1 rounded hover:bg-cyan-400"
              >
                + New Project
              </button>
            </div>
            <div className="space-y-3">
              {(isTestUser ? demoProjects : realProjects).length > 0 ? (
                (isTestUser ? demoProjects : realProjects).map((project, idx) => (
                  <div key={idx} className="bg-[#0d1117] p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-white/40">{project.deploys} deploys • {project.lastDeploy}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">Active</span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No projects yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;