// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Define user object w/ hardcoded logic for test vs real user
    const user = {
      name: normalizedEmail === 'testuser@softdeploy.dev' ? 'Mike Scott' : 'Test User',
      email: normalizedEmail,
      role: normalizedEmail === 'testuser@softdeploy.dev' ? 'demo' : 'member',
    };

    login(user);
    navigate('/dashboard');
  };

  return (
    <main className="bg-[#0e1117] min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-10">
        <div className="text-white md:w-1/2 space-y-4">
          <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/60 bg-white/5 inline-block">
            Welcome Back
          </span>
          <h1 className="text-3xl font-bold">Log in to SoftDeploy</h1>
          <p className="text-white/70">Your workspace for AI-powered QA and observability.</p>
          <ul className="text-sm text-white/60 space-y-2">
            <li>📈 View test insights in real-time</li>
            <li>🧠 Let AI recommend auto-fixes</li>
            <li>🚀 Promote builds safely to production</li>
          </ul>
          <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">🧪 Test Account</h3>
            <p className="text-sm text-white/70">Use this to try things out quickly:</p>
            <div className="mt-2 text-sm space-y-1">
              <p><strong>Email:</strong> testuser@softdeploy.dev</p>
              <p><strong>Password:</strong> password1234</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-8 w-full max-w-md backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">Log In</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                className="w-full mt-1 p-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                className="w-full mt-1 p-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-cyan-500 text-black py-2 rounded font-semibold hover:bg-cyan-400"
          >
            Log In
          </button>
          <p className="text-sm text-white/50 mt-4 text-center">
            Don’t have an account?{' '}
            <a href="/signup" className="text-cyan-400 hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </main>
  );
}