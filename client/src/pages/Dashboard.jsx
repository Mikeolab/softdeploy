import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

function Dashboard() {
const { user, logout } = useAuth();
const navigate = useNavigate();

if (!user) {
useEffect(() => {
navigate('/');
}, []);
return null;
}

const isTestUser = user && user.email?.toLowerCase() === 'testuser@softdeploy.dev ';

const demoStats = [
{ label: 'Total Deployments', value: '127', change: '+12%', trend: 'up' },
{ label: 'Success Rate', value: '98.4%', change: '+2.1%', trend: 'up' },
{ label: 'Avg Deploy Time', value: '4.2 min', change: '-15%', trend: 'down' },
{ label: 'Active Projects', value: '8', change: '+1', trend: 'up' },
];

const newStats = [
{ label: 'Total Deployments', value: '0', change: '-', trend: 'neutral' },
{ label: 'Success Rate', value: '-', change: '-', trend: 'neutral' },
{ label: 'Avg Deploy Time', value: '-', change: '-', trend: 'neutral' },
{ label: 'Active Projects', value: '0', change: '-', trend: 'neutral' },
];

const stats = isTestUser ? demoStats : newStats;

const recentDeployments = [
{ id: 1, project: 'Frontend App', status: 'Success', time: '2 min ago', duration: '3.2 min' },
{ id: 2, project: 'API Service', status: 'Success', time: '15 min ago', duration: '4.1 min' },
{ id: 3, project: 'Database Migration', status: 'Failed', time: '1 hour ago', duration: '12.3 min' },
];

const projects = [
{ name: 'Frontend App', status: 'Active', deployments: 45, lastDeploy: '2 min ago' },
{ name: 'API Service', status: 'Active', deployments: 32, lastDeploy: '15 min ago' },
{ name: 'Analytics Dashboard', status: 'Active', deployments: 28, lastDeploy: '3 hours ago' },
];

return (
<div className="min-h-screen bg-[#0e1117]">
{/* Header */}
<header className="bg-[#161b22] border-b border-[#30363d]">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center py-4">
<Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center">
    <span className="text-black font-bold text-sm">SD</span>
  </div>
  <span className="text-xl font-bold text-white">SoftDeploy</span>
</Link>
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

{/* Main Body */}
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
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
{stats.map((stat, index) => (
<div key={index} className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg">
<p className="text-sm text-gray-400">{stat.label}</p>
<p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
{stat.trend !== 'neutral' && (
<p className={`mt-1 text-sm ${
stat.trend === 'up' ? 'text-green-400' :
stat.trend === 'down' ? 'text-red-400' :
'text-gray-400'
}`}>
{stat.change}
</p>
)}
</div>
))}
</div>

{/* Panels for Test User */}
{isTestUser && (
<>
<section className="grid lg:grid-cols-2 gap-8 mb-10">
{/* Recent Deployments */}
<div className="bg-[#161b22] border border-[#30363d] rounded-lg">
<div className="p-6 border-b border-[#30363d]">
<h2 className="text-lg font-semibold text-white">Recent Deployments</h2>
</div>
<div className="p-6 space-y-4">
{recentDeployments.map((dep) => (
<div key={dep.id} className="flex justify-between p-4 bg-[#0d1117] text-white rounded-lg">
<div>
<p className="font-medium">{dep.project}</p>
<p className="text-sm text-gray-400">{dep.time}</p>
</div>
<div className="text-right">
<p className={`text-sm font-medium ${dep.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
{dep.status}
</p>
<p className="text-xs text-gray-400">{dep.duration}</p>
</div>
</div>
))}
</div>
</div>

{/* Projects */}
<div className="bg-[#161b22] border border-[#30363d] rounded-lg">
<div className="p-6 border-b border-[#30363d] flex justify-between items-center">
<h2 className="text-lg font-semibold text-white">Projects</h2>
<button className="text-sm px-4 py-2 rounded bg-cyan-500 font-medium text-black transition hover:bg-cyan-400">
+ New Project
</button>
</div>
<div className="p-6 space-y-4">
{projects.map((project, index) => (
<div key={index} className="flex justify-between items-center p-4 bg-[#0d1117] text-white rounded-lg">
<div>
<p className="font-medium">{project.name}</p>
<p className="text-sm text-gray-400">
{project.deployments} deploys • {project.lastDeploy}
</p>
</div>
<span className={`text-xs px-3 py-1 rounded-full ${
project.status === 'Active'
? 'bg-green-500/10 text-green-400'
: 'bg-gray-500/10 text-gray-400'
}`}>
{project.status}
</span>
</div>
))}
</div>
</div>
</section>
</>
)}

{/* Empty State for Real Users */}
{!isTestUser && (
<div className="border border-dashed border-cyan-400 p-8 rounded text-center text-white/70">
<p>No activity yet. Click <strong>+ New Project</strong> to begin testing SoftDeploy.</p>
</div>
)}
</main>
</div>
);
}

export default Dashboard;