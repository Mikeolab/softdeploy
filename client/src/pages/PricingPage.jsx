// src/pages/PricingPage.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon,
  MoonIcon,
  CheckIcon,
  RocketLaunchIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();

  const pricingTiers = [
    {
      name: "Automation Audit",
      price: "$0",
      period: "one-time",
      description: "A quick, risk-free review of your current lead, booking, and follow-up process.",
      features: [
        "30–45min call to understand your business",
        "Map how leads, calls, and bookings work today",
        "Identify the 2–3 highest ROI automations",
        "Simple written plan you can keep",
        "No obligation to move forward"
      ],
      cta: "Book free audit",
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Core Automation System",
      price: "Custom",
      period: "one-time",
      description: "Done-for-you setup of your core lead, follow-up, booking, and review automations.",
      features: [
        "Lead capture & pipeline setup",
        "Instant reply & multi-day follow-up sequences",
        "Missed call text-back & booking link flows",
        "Calendar booking & reminder system",
        "Review & reactivation campaigns",
        "Basic reporting for leads, bookings, and reviews"
      ],
      cta: "Get implementation quote",
      popular: true,
      color: "from-cyan-500 to-blue-600"
    },
    {
      name: "Ongoing Optimization",
      price: "Custom",
      period: "month",
      description: "We monitor, tweak, and expand your automations as your business grows.",
      features: [
        "Monthly performance review & reporting",
        "Campaign tweaks to improve conversion",
        "New workflows as offers/services change",
        "Monitoring for broken automations",
        "Collaboration with your internal team",
        "Priority support"
      ],
      cta: "Contact for monthly retainer",
      popular: false,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                What we automate
              </Link>
              <Link to="/pricing" className="text-cyan-600 dark:text-cyan-400 font-medium">
                Packages
              </Link>
              <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
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

              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Contact
                </Link>
                <a
                  href="https://calendly.com/softdeployautomation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Book Audit
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Service Packages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start with a free automation audit, then choose whether you want a one-time build, ongoing help, or both.
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

              <a
                href="https://calendly.com/softdeployautomation"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transform hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tier.name === "Automation Audit" ? (
                  <>
                    <RocketLaunchIcon className="h-5 w-5" />
                    {tier.cta}
                  </>
                ) : (
                  <>
                    <CommandLineIcon className="h-5 w-5" />
                    {tier.cta}
                  </>
                )}
              </a>
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
                question: "Who is this for?",
                answer: "Local services, agencies, clinics, coaches, and any business that gets leads and books appointments and wants that process automated."
              },
              {
                question: "Do you need to change my tools?",
                answer: "Not necessarily. We prefer to plug into what you already use (GoHighLevel, CRMs, calendars, etc.) and only add tools if there’s a clear benefit."
              },
              {
                question: "How long does the Core Automation System take to implement?",
                answer: "Most installs take 1–2 weeks depending on complexity and how many flows you want live in the first version."
              },
              {
                question: "Can you also help with software QA and testing?",
                answer: "Yes. SoftDeploy started as a QA and deployment platform, so we can support both business automation and testing if you ship software."
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
            Not sure which package you need?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start with a free audit. We’ll map your current process, highlight the biggest wins, and you can decide if you want help implementing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/softdeployautomation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Book Free Audit
            </a>
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
