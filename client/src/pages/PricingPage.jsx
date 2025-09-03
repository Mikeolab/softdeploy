// src/pages/PricingPage.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon,
  MoonIcon,
  CheckIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();

  const pricingTiers = [
    {
      name: "Starter",
      price: "$0",
      period: "month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 3 projects",
        "Basic test automation",
        "Manual deployments",
        "Email notifications",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "For growing teams that need more power",
      features: [
        "Unlimited projects",
        "Advanced test automation",
        "Automated deployments",
        "Slack & email notifications",
        "AI failure insights",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "from-cyan-500 to-blue-600"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "month",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Advanced analytics",
        "Dedicated support",
        "SLA guarantees",
        "On-premise deployment",
        "Custom branding"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-purple-500 to-pink-600"
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
              <Link to="/pricing" className="text-cyan-600 dark:text-cyan-400 font-medium">
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that's right for your team. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                tier.popular 
                  ? 'border-cyan-500 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="text-gray-600 dark:text-gray-400">/{tier.period}</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === "Enterprise" ? "/contact" : "/signup"}
                className={`w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transform hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tier.name === "Enterprise" ? (
                  <>
                    <CommandLineIcon className="h-5 w-5" />
                    {tier.cta}
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-5 w-5" />
                    {tier.cta}
                  </>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! Start with our free plan and upgrade when you're ready for more features."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
              },
              {
                question: "Do you offer discounts for startups?",
                answer: "Yes, we offer special pricing for qualified startups and educational institutions."
              }
            ].map((faq, index) => (
              <div key={index} className="text-left bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
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
              to="/contact"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300"
            >
              <CommandLineIcon className="h-5 w-5" />
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
