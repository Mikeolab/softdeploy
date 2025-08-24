// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient"; // ⬅️ make sure this file exists

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

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
    <main className="relative bg-[#0e1117] min-h-screen flex items-center justify-center px-6 py-16">
      {/* Floating emojis/icons beside form */}
      <div className="absolute top-20 left-6 opacity-10 animate-bounce text-white text-3xl">🚀</div>
      <div className="absolute bottom-36 right-8 opacity-10 animate-pulse text-white text-2xl">🧪</div>
      <div className="absolute bottom-10 left-[45%] opacity-10 animate-spin-slow text-white text-xl">⚙️</div>

      <section className="flex flex-col md:flex-row gap-12 max-w-6xl w-full relative z-10">
        {/* LEFT CONTENT */}
        <div className="md:w-1/2 text-white space-y-5">
          <span className="inline-block text-sm bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60">
            Sign up for early access
          </span>
          <h1 className="text-4xl font-bold leading-tight">
            Create your SoftDeploy Account
          </h1>
          <p className="text-white/70 max-w-md">
            Automate your tests, deploy with AI, and build full QA pipelines in just a few clicks.
          </p>

          <ul className="space-y-3 text-sm text-white/60 mt-2">
            <li className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
              Real-time test alerts
            </li>
            <li className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
              AI-powered bug reports
            </li>
            <li className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
              Cloud-native staging deploys
            </li>
          </ul>
        </div>

        {/* FORM PANEL */}
        <form
          onSubmit={handleSubmit}
          className="md:w-1/2 bg-[#191a1f] border border-white/10 rounded-xl p-8 shadow-lg backdrop-blur-lg"
        >
          <h2 className="text-white text-2xl font-semibold mb-6">Sign Up</h2>

          {!!status.error && (
            <div className="mb-4 text-sm text-red-400">{status.error}</div>
          )}
          {!!status.success && (
            <div className="mb-4 text-sm text-emerald-400">{status.success}</div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                required
                placeholder="e.g. Ani Dev"
                className="w-full px-4 py-2 rounded-md bg-[#1d1f24] text-white border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                placeholder="you@company.com"
                className="w-full px-4 py-2 rounded-md bg-[#1d1f24] text-white border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="w-full px-4 py-2 rounded-md bg-[#1d1f24] text-white border border-white/10 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="w-full py-2.5 rounded-md font-semibold bg-cyan-500 hover:bg-cyan-400 transition transform hover:-translate-y-[1px] disabled:opacity-60"
            >
              {status.loading ? "Creating…" : "Create Account"}
            </button>
          </div>

          <div className="text-white/60 text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline">
              Log in
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
