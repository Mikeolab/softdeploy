// src/pages/FeaturesPage.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon,
  MoonIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  ClockIcon,
  BellIcon,
  LightBulbIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function FeaturesPage() {
  const { theme, toggleTheme } = useTheme();

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
              <Link to="/features" className="text-cyan-600 dark:text-cyan-400 font-medium">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/integrations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
            Core Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything your engineering team needs to build, test, deploy, and scale faster.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: RocketLaunchIcon,
              title: "One-click Deployments",
              description: "Push code to staging or production with pre-flight health checks and rollback on failure.",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: BeakerIcon,
              title: "Live Test Logging",
              description: "Stream real-time Cypress, Playwright or unit test logs directly in your dashboard.",
              color: "from-green-500 to-emerald-500"
            },
            {
              icon: ClockIcon,
              title: "Scheduled Test Runs",
              description: "Run E2E/API tests every night (or afternoon). Visualized pass history included.",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: BellIcon,
              title: "Slack & Email Notifications",
              description: "Critical updates reach your team instantly with actionable summaries and diff insights.",
              color: "from-orange-500 to-red-500"
            },
            {
              icon: LightBulbIcon,
              title: "AI Failure Insights",
              description: "Catch flakiness and receive smart fixes when deployments or tests break.",
              color: "from-yellow-500 to-amber-500"
            },
            {
              icon: CodeBracketIcon,
              title: "GitHub/GitLab Pipelines",
              description: "CI/CD integration for every team with YAML or visual pipeline creation.",
              color: "from-indigo-500 to-purple-500"
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers who trust SoftDeploy to ship faster and more reliably.
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