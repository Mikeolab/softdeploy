import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheckIcon,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: LockClosedIcon,
      title: "Data Protected",
      description: "Your customer data is encrypted and secure",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CheckBadgeIcon,
      title: "Proven Results",
      description: "Trusted by businesses across industries",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: ClockIcon,
      title: "Quick Setup",
      description: "Automation live in 1-2 weeks, not months",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const integrations = [
    { name: "GoHighLevel", logo: "GHL" },
    { name: "Calendly", logo: "📅" },
    { name: "Zapier", logo: "Z" },
    { name: "Make", logo: "M" },
    { name: "n8n", logo: "n8n" },
    { name: "Google Calendar", logo: "📆" },
    { name: "Slack", logo: "💬" },
    { name: "Email", logo: "✉️" }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-cyan-500 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Integration Logos */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6">
            Works with your existing tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-cyan-500 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {integration.logo}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {integration.name}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            And 100+ more integrations available
          </p>
        </div>
      </div>
    </section>
  );
}
