// src/pages/SubscriptionPage.jsx

export default function SubscriptionPage() {
  return (
    <main className="w-full bg-[#141516] text-white min-h-screen px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
      <p className="mb-10 text-white/70">
        Choose a plan that fits your stage—from solo devs to enterprise QA teams.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Starter",
            price: "$0/mo",
            features: ["Unlimited projects", "Local runners", "Basic email alerts"]
          },
          {
            name: "Pro",
            price: "$49/mo",
            features: ["Slack alerts", "AI insights", "Scheduled runs", "Up to 5 team members"]
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: ["SSO/OAuth", "Advanced analytics", "Priority support", "Custom runner scaling"]
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-white/10 bg-[#1e1f24] p-6"
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-white/80 text-sm">
              {plan.features.map((feat, i) => (
                <li key={i}>✓ {feat}</li>
              ))}
            </ul>
            <button className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-2 text-black font-semibold hover:bg-cyan-400">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}