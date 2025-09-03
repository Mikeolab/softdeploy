// src/pages/IntegrationsPage.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon,
  MoonIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CodeBracketIcon,
  CloudIcon,
  ServerIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function IntegrationsPage() {
  const { theme, toggleTheme } = useTheme();

  const integrations = [
    {
      category: "Version Control",
      items: [
        { name: "GitHub", icon: "🐙", description: "Connect your GitHub repositories for seamless CI/CD" },
        { name: "GitLab", icon: "🦊", description: "Integrate with GitLab for automated deployments" },
        { name: "Bitbucket", icon: "🪣", description: "Sync with Bitbucket repositories and pipelines" }
      ]
    },
    {
      category: "Cloud Platforms",
      items: [
        { name: "AWS", icon: "☁️", description: "Deploy to AWS services with automatic scaling" },
        { name: "Google Cloud", icon: "🌐", description: "Integrate with Google Cloud Platform services" },
        { name: "Azure", icon: "🔷", description: "Connect to Microsoft Azure for cloud deployments" },
        { name: "Vercel", icon: "▲", description: "Deploy frontend applications to Vercel" },
        { name: "Netlify", icon: "🌍", description: "Host static sites with Netlify integration" }
      ]
    },
    {
      category: "Testing Tools",
      items: [
        { name: "Cypress", icon: "🟡", description: "Run Cypress E2E tests with real-time reporting" },
        { name: "Jest", icon: "🟢", description: "Execute Jest unit tests with coverage reports" },
        { name: "Playwright", icon: "🔵", description: "Run Playwright tests across multiple browsers" },
        { name: "Selenium", icon: "🔴", description: "Integrate Selenium WebDriver for web testing" },
        { name: "k6", icon: "🟣", description: "Performance testing with k6 load testing" }
      ]
    },
    {
      category: "Communication",
      items: [
        { name: "Slack", icon: "💬", description: "Get real-time notifications in Slack channels" },
        { name: "Discord", icon: "🎮", description: "Send deployment updates to Discord servers" },
        { name: "Microsoft Teams", icon: "💼", description: "Integrate with Teams for team notifications" },
        { name: "Email", icon: "📧", description: "Receive detailed email reports and alerts" }
      ]
    },
    {
      category: "Monitoring",
      items: [
        { name: "DataDog", icon: "🐕", description: "Send metrics and logs to DataDog" },
        { name: "New Relic", icon: "📊", description: "Monitor application performance with New Relic" },
        { name: "Sentry", icon: "🚨", description: "Track errors and exceptions with Sentry" },
        { name: "Grafana", icon: "📈", description: "Visualize metrics and create dashboards" }
      ]
    },
    {
      category: "Security",
      items: [
        { name: "Snyk", icon: "🔒", description: "Scan for vulnerabilities in dependencies" },
        { name: "SonarQube", icon: "🔍", description: "Code quality analysis and security scanning" },
        { name: "OWASP ZAP", icon: "🛡️", description: "Automated security testing for web applications" }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Navigation */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/integrations" className="text-cyan-600 dark:text-cyan-400 font-medium">
                Integrations
              </Link>
              <Link to="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Docs
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Integrations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connect with your favorite tools and services. SoftDeploy integrates with everything you need to build, test, and deploy faster.
          </p>
        </div>

        {/* Integration Categories */}
        <div className="space-y-12">
          {integrations.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                {category.category}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((integration, integrationIndex) => (
                  <div
                    key={integrationIndex}
                    className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {integration.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium transition-colors">
                        Connect →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Integration Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <CodeBracketIcon className="mx-auto h-12 w-12 text-cyan-600 dark:text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need a Custom Integration?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Don't see your favorite tool? We can build custom integrations for your specific needs. 
              Our API is designed to be flexible and extensible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
              >
                <CommandLineIcon className="h-5 w-5" />
                Request Integration
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-cyan-500 transition-all duration-300"
              >
                <ChartBarIcon className="h-5 w-5" />
                View API Docs
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Connect Your Tools?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start integrating your development workflow with SoftDeploy today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300"
            >
              <CommandLineIcon className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}