// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CheckCircleIcon as CheckCircleOutlineIcon
} from '@heroicons/react/24/outline';
import { supabase } from "../lib/supabaseClient";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      // 1) Create auth user
      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: form.fullName }
        }
      });
      if (signErr) throw signErr;

      const user = signData.user;

      // If email confirmation is ON, user will be null until verified
      if (!user) {
        setStatus({
          loading: false,
          error: "",
          success: "Account created. Please check your email to confirm before logging in."
        });
        return;
      }

      // 2) Upsert profile row
      const { error: profErr } = await supabase.from("profiles").upsert({
        id: user.id,
        email: form.email,
        full_name: form.fullName
      });
      if (profErr) throw profErr;

      setStatus({ loading: false, error: "", success: "Account created successfully!" });
      navigate("/dashboard");
    } catch (err) {
      setStatus({ loading: false, error: err.message ?? "Sign up failed", success: "" });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-center">
        {/* Left Side - Info */}
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              <SparklesIcon className="h-4 w-4" />
              Join the Future
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Create your <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">SoftDeploy</span> Account
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Access your client dashboard to monitor automation workflows and track performance.
            </p>
          </div>

            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your dashboard includes:</h3>
            <div className="space-y-3">
              {[
                { icon: ChatBubbleLeftRightIcon, text: "Monitor lead responses and follow-up sequences" },
                { icon: CalendarDaysIcon, text: "Track bookings, reminders, and no-shows" },
                { icon: ArrowTrendingUpIcon, text: "View automation performance and ROI metrics" },
                { icon: SparklesIcon, text: "Real-time alerts when automations need attention" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Client Dashboard Access
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Monitor your automation workflows:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">View all automation activity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Track leads and conversions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Performance reports & insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Account</h2>

            {!!status.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{status.error}</p>
              </div>
            )}

            {!!status.success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm">{status.success}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    required
                    type="text"
                    className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    type="email"
                    className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status.loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
