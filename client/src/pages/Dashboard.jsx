// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog } from '@headlessui/react';

function Dashboard() {
  const { user, logout } = useAuth();
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

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);

  // ===== Modal state =====
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testOwner, setTestOwner] = useState('');

  // redirect if no user
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchProjects();
      fetchTestPlans();
    }
  }, [user?.id]);

  // ===== Queries =====
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('last_deploy', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('fetchProjects:', err.message);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTestPlans = async () => {
    try {
      setLoadingTests(true);
      const { data, error } = await supabase
        .from('test_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('ran_at', { ascending: false });

      if (error) throw error;
      setTestPlans(data || []);
    } catch (err) {
      console.error('fetchTestPlans:', err.message);
      setTestPlans([]);
    } finally {
      setLoadingTests(false);
    }
  };

  // ===== Mutations =====
  const handleAddProject = async () => {
    try {
      const newProject = {
        user_id: user.id,
        name: `Project ${projects.length + 1}`,
        status: 'Active',
        deploys: 0,
        last_deploy: null
      };

      const { error } = await supabase.from('projects').insert([newProject]);
      if (error) throw error;
      fetchProjects();
    } catch (err) {
      console.error('handleAddProject:', err.message);
    }
  };

  const handleSubmitTestPlan = async () => {
    if (!testTitle.trim() || !testResult.trim()) return;

    try {
      const newPlan = {
        user_id: user.id,                        // 🔐 critical for RLS
        title: testTitle.trim(),
        result: testResult.trim(),
        owner_name: (testOwner || displayName).trim(),
        ran_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('test_plans')
        .insert([newPlan])
        .select();

      if (error) throw error;
      setTestPlans((prev) => (data ? [...data, ...prev] : prev));

      // reset form
      setTestTitle('');
      setTestResult('');
      setTestOwner('');
      setIsTestModalOpen(false);
    } catch (err) {
      console.error('handleSubmitTestPlan:', err.message);
      alert(`Failed to save test plan: ${err.message}`);
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Total Deployments', value: '0', change: '-', trend: 'neutral' },
    { label: 'Success Rate', value: '-', change: '-', trend: 'neutral' },
    { label: 'Avg Deploy Time', value: '-', change: '-', trend: 'neutral' },
    { label: 'Active Projects', value: projects.length.toString(), change: '+0', trend: 'neutral' }
  ];

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
          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:inline">{displayName}</span>
            <button
              onClick={async () => { await logout(); navigate('/'); }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
          <p className="text-white/60">Track your test plans and projects live in your workspace.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
              <p className="text-sm text-white/50">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <p
                className={`text-sm mt-1 ${
                  stat.trend === 'up' ? 'text-green-400'
                  : stat.trend === 'down' ? 'text-red-400'
                  : 'text-gray-400'
                }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Three-column panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-white">🧱 Projects</h2>
              <button
                onClick={handleAddProject}
                className="text-xs text-black bg-cyan-500 px-3 py-1 rounded hover:bg-cyan-400"
              >
                + New Project
              </button>
            </div>
            <div className="space-y-3">
              {loadingProjects ? (
                <p className="text-sm text-white/50 animate-pulse">Loading projects...</p>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id ?? project.name} className="bg-[#0d1117] p-3 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-white/40">
                        {project.deploys} deploys • {project.last_deploy || 'Just Created'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
                      {project.status || 'Active'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No projects yet.</p>
              )}
            </div>
          </section>

          {/* Deployments */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-white">📦 Deployments</h2>
              <span className="text-xs text-cyan-500">More</span>
            </div>
            <p className="text-white/50 text-sm">No deployments yet.</p>
          </section>

          {/* Test Plans */}
          <section className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-white">🧪 Test Plans</h2>
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="text-xs text-black bg-cyan-500 px-3 py-1 rounded hover:bg-cyan-400"
              >
                + New Test Plan
              </button>
            </div>
            <div className="space-y-3">
              {loadingTests ? (
                <p className="text-sm text-white/50 animate-pulse">Loading test plans...</p>
              ) : testPlans.length > 0 ? (
                testPlans.map((t) => (
                  <div key={t.id ?? `${t.title}-${t.ran_at}`} className="bg-[#0d1117] p-3 rounded">
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-white/70 text-sm">{t.result}</p>
                    <p className="text-white/30 text-xs">
                      {(t.owner_name || displayName)} • {t.ran_at ? new Date(t.ran_at).toLocaleString() : ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-sm">No test plans yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Test Plan Modal */}
      <Dialog open={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#161b22] w-full max-w-md p-6 rounded-lg border border-white/10 text-white shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">New Test Plan</Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full p-2 rounded bg-[#0d1117] border border-white/20"
                  placeholder="e.g. Checkout Flow"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Result</label>
                <input
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value)}
                  placeholder="e.g. 8/10 passed"
                  className="w-full p-2 rounded bg-[#0d1117] border border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Owner</label>
                <input
                  value={testOwner}
                  onChange={(e) => setTestOwner(e.target.value)}
                  placeholder="e.g. QA Team"
                  className="w-full p-2 rounded bg-[#0d1117] border border-white/20"
                />
              </div>
              <button
                onClick={handleSubmitTestPlan}
                className="mt-4 w-full py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400 font-semibold"
              >
                Save Test Plan
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default Dashboard;
