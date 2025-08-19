import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

// inside the hero actions:
const Section = ({ id, title, subtitle, children }) => (
  <section id={id} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="mb-8">
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white/90">{title}</h2>
      {subtitle && <p className="mt-2 text-white/60 max-w-3xl">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 ${className}`}>{children}</div>
);

const Stat = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-2xl font-semibold text-white">{value}</span>
    <span className="text-white/50 text-sm">{label}</span>
  </div>
);

const Feature = ({ title, desc }) => (
  <Card>
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-xl bg-white/10 text-sm">◆</div>
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-white/60 text-sm mt-1">{desc}</p>
      </div>
    </div>
  </Card>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs ring-1 ring-emerald-400/20">
    {children}
  </span>
);

const TimelineItem = ({ phase, period, items }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-2 h-full w-px bg-white/10"/>
    <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400"/>
    <div className="mb-3 flex items-center gap-2">
      <h4 className="text-white font-medium">{phase}</h4>
      <Pill>{period}</Pill>
    </div>
    <ul className="space-y-2 list-disc marker:text-white/40 text-white/70 ml-5">
      {items.map((it, idx) => <li key={idx}>{it}</li>)}
    </ul>
  </div>
);

const StackRow = ({ layer, tools }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 items-center py-3 border-b border-white/10">
    <div className="text-white/60 text-sm col-span-2 sm:col-span-2">{layer}</div>
    <div className="col-span-1 sm:col-span-4 flex flex-wrap gap-2">
      {tools.map((t, i) => (
        <span key={i} className="text-xs text-white/80 bg-white/5 rounded-full px-3 py-1 ring-1 ring-white/10">{t}</span>
      ))}
    </div>
  </div>
);

const Badge = ({ children }) => (
  <span className="text-[10px] uppercase tracking-wide text-white/60 bg-white/5 rounded px-2 py-1 ring-1 ring-white/10">{children}</span>
);

function HeroCTA() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -inset-32 opacity-30 -z-10" aria-hidden="true">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"/>
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"/>
      </div>

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 grid place-items-center ring-1 ring-white/20">
            <span className="text-black/80 text-sm">SD</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold tracking-tight">SoftDeploy</span>
            <span className="text-xs text-white/50">QA & CI/CD Platform</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-white/70 text-sm">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#roadmap" className="hover:text-white">Roadmap</a>
          <a href="#tech" className="hover:text-white">Tech</a>
          <a href="#integrations" className="hover:text-white">Integrations</a>
          <a href="#dashboard" className="hover:text-white">Dashboard</a>
        </nav>
        <div className="flex gap-3">
          <button className="rounded-xl px-3.5 py-2 text-sm bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10">Docs</button>
          <button className="rounded-xl px-3.5 py-2 text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:brightness-95">Try Demo</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge>QA-first automation</Badge>
            <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Deliver high‑quality software faster
            </h1>
            <p className="mt-4 text-white/70 max-w-xl">
              SoftDeploy automates your tests, integrates code continuously and deploys with confidence. Accelerate release cycles, improve code quality and respond to market changes quickly with built‑in security and performance checks.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
  <Link
    to="/signup"
    className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400"
  >
    Get Started
  </Link>
  <Link
    to="/login"
    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
  >
    Log in
  </Link>
  <Link
    to="/app"
    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white"
  >
    Open Dashboard
  </Link>
</div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <Stat label="Avg. deploy time" value="7 min"/>
              <Stat label="Test pass rate" value="96%"/>
              <Stat label="Teams onboarded" value="12"/>
            </div>
          </div>

          <Card className="lg:ml-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 grid place-items-center">⏱</div>
                <div>
                  <h4 className="text-white font-medium leading-tight">Live Pipeline</h4>
                  <p className="text-white/50 text-xs">Staging • last run 2m ago</p>
                </div>
              </div>
              <button className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1">View all ▶</button>
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-white/10 grid place-items-center">🗓</div>
                  <div>
                    <p className="text-xs text-white/60">Scheduled</p>
                    <p className="text-white font-medium">Nightly E2E</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full bg-white/10 rounded-full">
                  <div className="h-2 bg-emerald-400 rounded-full w-4/5"/>
                </div>
                <p className="mt-2 text-xs text-emerald-300">Passed (24/30)</p>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-white/10 grid place-items-center">🚀</div>
                  <div>
                    <p className="text-xs text-white/60">Deploy</p>
                    <p className="text-white font-medium">Staging → Prod</p>
                  </div>
                </div>
                <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold py-2">One-click Deploy</button>
                <p className="mt-2 text-xs text-white/60">Protected with approvals + rollback</p>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-lg bg-white/10 grid place-items-center">🔔</div>
                  <div>
                    <p className="text-xs text-white/60">Alerts</p>
                    <p className="text-white font-medium">Slack + Email</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-white/70">
                  <li>• E2E summary sent to <span className="text-white">#qa-alerts</span></li>
                  <li>• Perf budget breach (p95 &gt; 1.5s)</li>
                  <li>• Failed smoke test on <span className="text-white">/checkout</span></li>
                </ul>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { title: "Automated test pipelines", desc: "Schedule unit, API, E2E and performance tests to run on every commit and nightly, catching issues early." },
    { title: "Continuous deployment", desc: "Deploy confidently to dev, staging and production with one click. Approvals and rollbacks protect you against bad releases." },
    { title: "Smart alerts", desc: "Get actionable Slack/email summaries with diffs, flaky-test hints and owners so the right person can fix issues fast." },
    { title: "Dashboards & history", desc: "View pass rates, failure frequency and deployment history across environments to spot trends and drive improvement." },
    { title: "Role-based access control", desc: "Permissions, approvals and audit events built in to keep your team secure and compliant." },
    { title: "Built-in security", desc: "Integrate security checks directly into your pipeline to catch vulnerabilities early and improve performance." },
  ];
  return (
    <Section id="features" title="Accelerate delivery without compromising quality" subtitle="Mature CI/CD pipelines that shorten deployment time from hours to minutes, enabling teams to react to customer needs quickly.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f, i) => <Feature key={i} {...f}/>)}
      </div>
    </Section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
      <h2 className="text-2xl font-semibold text-white">How SoftDeploy works</h2>
      <p className="mt-2 text-white/70 max-w-3xl">
        Connect your repo, define tests, and ship with guardrails. SoftDeploy automates build, test
        and deploy steps so teams release faster with fewer regressions.
      </p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none">
        {[
          { n: "1", title: "Connect your stack", desc: "Link GitHub/GitLab and your cloud environments (AWS/GCP/Azure)." },
          { n: "2", title: "Define tests & schedules", desc: "Run unit, API, E2E and performance suites on every PR and nightly." },
          { n: "3", title: "Gate & deploy safely", desc: "Auto-checks block risky merges; one-click deploy with approvals & rollback." },
          { n: "4", title: "See results & improve", desc: "Dashboards, logs and alerts show pass-rate, failures and trends across envs." }
        ].map(step => (
          <li key={step.n} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">{step.n}</div>
            <h3 className="text-base font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-white/70">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
function Roadmap() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
  <h2 className="text-2xl font-semibold text-white">How SoftDeploy works</h2>
  <p className="mt-2 text-white/70 max-w-3xl">
    Connect your repo, define tests, and ship with guardrails. SoftDeploy automates build, test
    and deploy steps so teams release faster with fewer regressions.
  </p>

  <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none counter-reset">
    {[
      {
        n: "1",
        title: "Connect your stack",
        desc: "Link GitHub/GitLab and your cloud environments (AWS/GCP/Azure)."
      },
      {
        n: "2",
        title: "Define tests & schedules",
        desc: "Run unit, API, E2E and performance suites on every PR and nightly."
      },
      {
        n: "3",
        title: "Gate & deploy safely",
        desc: "Auto-checks block risky merges; one-click deploy with approvals & rollback."
      },
      {
        n: "4",
        title: "See results & improve",
        desc: "Dashboards, logs and alerts show pass-rate, failures and trends across envs."
      }
    ].map(step => (
      <li key={step.n} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">{step.n}</div>
        <h3 className="text-base font-semibold text-white">{step.title}</h3>
        <p className="mt-2 text-sm text-white/70">{step.desc}</p>
      </li>
    ))}
  </ol>

  <div className="mt-8 grid gap-4 sm:grid-cols-3">
    {[
      { k: "Faster releases", v: "Shorter cycle time with automated pipelines" },
      { k: "Higher quality", v: "Issues caught earlier by CI tests" },
      { k: "Lower risk", v: "Approvals, health checks & instant rollback" }
    ].map(x => (
      <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/60">{x.k}</div>
        <div className="text-lg font-semibold text-white">{x.v}</div>
      </div>
    ))}
  </div>
</section>
  );
}

function TechStack() {
  return (
    <section id="use-cases" className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
  <h2 className="text-2xl font-semibold text-white">What teams use SoftDeploy for</h2>
  <p className="mt-2 text-white/70 max-w-3xl">
    Practical workflows that increase confidence on every release.
  </p>

  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[
      {
        title: "PR checks that prevent regressions",
        desc: "Run unit, API and E2E suites on every pull request; block merges when critical paths fail."
      },
      {
        title: "Nightly E2E & API health",
        desc: "Schedule Playwright/Cypress & API checks; trend pass-rate, p95 and error spikes over time."
      },
      {
        title: "Performance budgets",
        desc: "Catch slowdowns early with thresholds (e.g., p95, TTFB); alert on breaches."
      },
      {
        title: "Staging → Prod with guardrails",
        desc: "One-click deploy with approvals, /health probes and quick rollback if anything degrades."
      },
      {
        title: "Incident-ready alerts",
        desc: "Slack/email summaries with diffs, flaky-test hints and owners so the right person fixes fast."
      },
      {
        title: "Audit & compliance",
        desc: "Approvals, change logs and run history to satisfy audits and internal reviews."
      }
    ].map(card => (
      <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-base font-semibold text-white">{card.title}</h3>
        <p className="mt-2 text-sm text-white/70">{card.desc}</p>
      </div>
    ))}
  </div>
</section>
  );
}

function Integrations() {
  const items = [
    { title: "GitHub", desc: "Repos, PRs, status checks, Actions triggers." },
    { title: "GitLab", desc: "Pipelines and status checks for self-hosted users." },
    { title: "Docker", desc: "Spin up clean containers for each test run." },
  ];
  return (
    <Section id="integrations" title="Integrations" subtitle="Connect your source control, runners, and messaging in minutes.">
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10">🔗</div>
              <div>
                <h4 className="text-white font-medium leading-tight">{it.title}</h4>
                <p className="text-white/60 text-sm">{it.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function DemoDashboard() {
  const [env, setEnv] = useState("staging");
  return (
    <Section id="dashboard" title="Manager-friendly Dashboard" subtitle="Monitor tests and deployments across environments at a glance.">
      <div className="flex flex-wrap gap-3 mb-4">
        {["dev","staging","prod"].map((e) => (
          <button key={e} onClick={() => setEnv(e)}
            className={`px-3 py-1.5 rounded-lg text-sm ring-1 ring-white/15 ${env===e?"bg-white text-black":"bg-white/5 text-white hover:bg-white/10"}`}>
            {e.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10">✅</div>
              <h4 className="text-white font-medium">Test Summary</h4>
            </div>
            <span className="text-xs text-white/60">{env}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-semibold text-emerald-300">124</p><p className="text-xs text-white/60">Passed</p></div>
            <div><p className="text-2xl font-semibold text-white">8</p><p className="text-xs text-white/60">Failed</p></div>
            <div><p className="text-2xl font-semibold text-white">6</p><p className="text-xs text-white/60">Flaky</p></div>
          </div>
          <div className="mt-4 h-2 w-full bg-white/10 rounded-full">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" style={{width:"84%"}}/>
          </div>
          <p className="mt-2 text-xs text-white/60">Pass rate last 24h</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">🚚</div>
            <h4 className="text-white font-medium">Recent Deployments</h4>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li className="flex items-center justify-between"><span>v1.8.2 • checkout-hotfix</span><span className="text-emerald-300">Success</span></li>
            <li className="flex items-center justify-between"><span>v1.8.1 • perf-budget</span><span className="text-emerald-300">Success</span></li>
            <li className="flex items-center justify-between"><span>v1.8.0 • feature-alerts</span><span className="text-yellow-300">Needs review</span></li>
          </ul>
          <button className="mt-4 w-full rounded-lg bg-white/5 text-white ring-1 ring-white/15 py-2 hover:bg-white/10 inline-flex items-center justify-center gap-2">
            View pipeline
          </button>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">🔔</div>
            <h4 className="text-white font-medium">Latest Alerts</h4>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/80">E2E summary posted to <span className="text-white">#qa-alerts</span></div>
            <div className="flex items-center gap-2 text-white/80">Perf test exceeded p95 in <span className="text-white">/search</span></div>
            <div className="flex items-center gap-2 text-white/80">Smoke test failed on <span className="text-white">/auth</span></div>
          </div>
        </Card>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-medium">Ready to pilot SoftDeploy?</h3>
          <p className="text-white/60 text-sm">Start free, invite your QA team, and ship with confidence.</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl px-4 py-2 text-sm bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10">Contact Sales</button>
          <button className="rounded-xl px-4 py-2 text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold">Launch Demo</button>
        </div>
      </div>
      <p className="mt-6 text-center text-white/40 text-xs">© {new Date().getFullYear()} SoftDeploy • Built for QA-first teams</p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#141516] text-white">
      <HeroCTA />
      <Features />
      <Roadmap />
      <TechStack />
      <Integrations />
      <DemoDashboard />
      <Footer />
    </div>
  );
}