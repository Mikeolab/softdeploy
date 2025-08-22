// src/pages/FeaturesPage.jsx

export default function FeaturesPage() {
  return (
    <main className="w-full bg-[#141516] text-white min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Core Features</h1>
      <p className="mb-8 text-white/70">
        Everything your engineering team needs to build, test, deploy, and scale faster.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "One-click Deployments",
            description: "Push code to staging or production with pre-flight health checks and rollback on failure."
          },
          {
            title: "Live Test Logging",
            description: "Stream real-time Cypress, Playwright or unit test logs directly in your dashboard."
          },
          {
            title: "Scheduled Test Runs",
            description: "Run E2E/API tests every night (or afternoon). Visualized pass history included."
          },
          {
            title: "Slack & Email Notifications",
            description: "Critical updates reach your team instantly with actionable summaries and diff insights."
          },
          {
            title: "AI Failure Insights",
            description: "Catch flakiness and receive smart fixes when deployments or tests break."
          },
          {
            title: "GitHub/GitLab Pipelines",
            description: "CI/CD integration for every team with YAML or visual pipeline creation."
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-white/10 bg-[#1e1f24] p-5"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-white/70">{f.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}