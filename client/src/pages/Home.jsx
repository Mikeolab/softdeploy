// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="bg-[#0e1117] text-white min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 text-sm bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.1] text-white/60">
            🧠 AI-native CI/CD · QA-first automation
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
          Ship faster with <span className="text-cyan-400">AI-enabled dev workflows</span>
        </h1>

        <p className="mt-4 max-w-2xl text-white/70 text-lg">
          SoftDeploy helps your team build, test, and deploy with confidence — powered by test automation & intelligent agents.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/signup"
            className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold px-5 py-3 rounded-lg transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="text-sm px-5 py-3 rounded-lg border border-white/15 hover:bg-white/10 transition"
          >
            Log In
          </Link>
          <Link
            to="/dashboard"
            className="text-sm px-5 py-3 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition text-white/80"
          >
            Open Dashboard
          </Link>
        </div>

        {/* AI Assistant Bling */}
        <div className="absolute top-[10rem] right-[-3rem] hidden md:block opacity-20 pointer-events-none">
          <img src="/ai-agent-avatar-glow.svg" alt="AI Agent visual" className="w-[250px]" />
        </div>
      </section>

      {/* Features preview section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-white/[0.05]">
        <h2 className="text-2xl font-bold mb-8">What SoftDeploy powers for your team:</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Live test execution",
              desc: "Run suites instantly with CI agent pipelines powered by Playwright and Cypress.",
            },
            {
              title: "AI bug triage",
              desc: "Our assistant summarizes failed logs and suggests fix PRs or YAML patch reductions.",
            },
            {
              title: "24/7 health-aware deploys",
              desc: "Click once. Auto rollback if healthcheck fails. Staging + prod in perfect sync.",
            },
            {
              title: "Flaky test analyzer",
              desc: "We'll detect spec flakiness across runs and tell you before your team finds it.",
            },
            {
              title: "Slack & Email alerts built-in",
              desc: "Stay in flow. Your tests post status summaries and alerts via integrations.",
            },
            {
              title: "Visual Pipelines",
              desc: "Design your CI/CD like a workflow builder, or drop in raw YAML."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-5"
            >
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-white/70 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}