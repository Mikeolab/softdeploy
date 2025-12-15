// src/pages/FeaturesPage.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  SunIcon,
  MoonIcon,
  InboxArrowDownIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  PhoneArrowUpRightIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function FeaturesPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Navigation */}
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
              <Link to="/features" className="text-cyan-600 dark:text-cyan-400 font-medium">
                What we automate
              </Link>
              <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
            What we automate for your business
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            These are the workflows we install in almost every client account — no matter the niche.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: InboxArrowDownIcon,
            title: "New lead capture & qualification",
            description: "Forms, ads, DMs and calls flow into one pipeline with basic qualification and tagging.",
              color: "from-blue-500 to-cyan-500"
          },
          {
            icon: ChatBubbleLeftRightIcon,
            title: "Speed-to-lead & nurturing",
            description: "Instant SMS/email replies plus structured follow-up over days so you stop losing warm leads.",
              color: "from-green-500 to-emerald-500"
          },
          {
            icon: CalendarDaysIcon,
            title: "Booking, reminders & no-show reduction",
            description: "Calendar booking, confirmations, reminders, and easy reschedules to reduce no-shows.",
              color: "from-purple-500 to-pink-500"
          },
          {
            icon: PhoneArrowUpRightIcon,
            title: "Missed call text-back",
            description: "When you miss a call, we text back automatically, answer simple questions, and send your booking link.",
              color: "from-orange-500 to-red-500"
          },
          {
            icon: ArrowTrendingUpIcon,
            title: "Reviews, referrals & reactivation",
            description: "Request reviews from happy customers, trigger referral requests, and revive old leads with targeted campaigns.",
            color: "from-yellow-500 to-amber-500"
          },
          {
            icon: SparklesIcon,
            title: "AI-powered chatbot",
            description: "24/7 AI receptionist handles calls, answers questions, books appointments, and captures leads even when you're offline.",
            color: "from-violet-500 to-purple-500"
          },
          {
            icon: UserGroupIcon,
            title: "Simple reporting & dashboard (coming soon)",
            description: "See leads, bookings, no-shows, and reviews at a glance, plus alerts when automations break.",
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

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to see this mapped to your business?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Tell me how leads come in today and how you handle booking, follow-up, and reviews. I’ll send back a simple automation plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/softdeployautomation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Book Automation Audit
            </a>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300"
            >
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}