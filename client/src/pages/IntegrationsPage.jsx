// src/pages/IntegrationsPage.jsx

export default function IntegrationsPage() {
  return (
    <main className="px-6 py-12 text-white min-h-screen bg-[#141516]">
      <h1 className="text-3xl font-bold">Integrations</h1>
      <p className="text-white/70 mt-2 mb-6">
        Easily connect SoftDeploy with your favorite tools and platforms.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "GitHub",
            description: "Run builds, track PR status, trigger deploys from webhooks.",
          },
          {
            name: "Slack",
            description: "Send build summaries, failures, and alerts into your channels.",
          },
          {
            name: "GitLab",
            description: "Trigger test pipelines or deploys through GitLab events.",
          },
          {
            name: "Docker Hub",
            description: "Push images and deploy containers from pipeline stages.",
          },
          {
            name: "Email (SMTP)",
            description: "Send reports and alerts to team members after deploy/tests.",
          },
          {
            name: "PagerDuty",
            description: "Get alerts when staging/production fails via incident automation.",
          },
        ].map((integration) => (
          <div
            key={integration.name}
            className="rounded-xl border border-white/10 bg-[#1e1f24] p-5"
          >
            <h3 className="text-xl font-semibold">{integration.name}</h3>
            <p className="text-white/70 mt-2 text-sm">{integration.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}