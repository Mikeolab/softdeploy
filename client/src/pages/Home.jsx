// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useTheme } from '../context/ThemeContext';
import { 
  RocketLaunchIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  PhoneArrowUpRightIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  InboxArrowDownIcon
} from '@heroicons/react/24/outline';

export default function Home() {
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
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
                <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Business Automation Systems
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
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
                <Link
                to="/contact"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Book Audit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-cyan-700 dark:text-cyan-300 text-sm font-medium">
              <BoltIcon className="h-4 w-4" />
              AI-Powered Business Automation
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Stop losing leads.
              <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Start running on autopilot.
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              SoftDeploy builds business automation systems that reply to leads instantly,
              follow up for you, book appointments, request reviews, and send simple reports —
              so you can focus on delivery instead of chasing admin work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="https://calendly.com/softdeployautomation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                Book Automation Audit
              </a>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105"
              >
                <RocketLaunchIcon className="h-5 w-5" />
                See What We Automate
              </Link>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  A simple automation engine for your entire front office
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center mb-3">
                      <InboxArrowDownIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      New lead captured
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Web form, ad, DM, or missed call.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3">
                      <ChatBubbleLeftRightIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Instant reply & nurture
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      SMS/email answer common questions & follow up for days.
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
                      <CalendarDaysIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Booked & reminded
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Calendar booking, reminders, and no-show reduction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What we automate for you
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A reusable automation system that fits local services, agencies, clinics, and coaches —
              without you learning any new tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: InboxArrowDownIcon,
                title: "Lead capture & routing",
                description: "Turn forms, ads, and DMs into contacts in one place, with automatic assignment to the right pipeline.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: ChatBubbleLeftRightIcon,
                title: "Instant reply & follow-up",
                description: "Reply to every new lead in seconds, then run structured SMS/email follow-up for days so you stop losing warm leads.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: CalendarDaysIcon,
                title: "Booking & reminders",
                description: "Offer self-serve booking, confirmations, reminders, and easy reschedules to reduce no-shows.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: PhoneArrowUpRightIcon,
                title: "Missed call text-back",
                description: "When you miss a call, we text back automatically, answer basic questions, and send your booking link.",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: ArrowTrendingUpIcon,
                title: "Reviews & reactivation",
                description: "Request reviews from happy customers and re-open conversations with past leads that went quiet.",
                color: "from-yellow-500 to-amber-500"
              },
              {
                icon: UserGroupIcon,
                title: "Simple reporting & dashboard (coming soon)",
                description: "See leads, bookings, no-shows, and reviews at a glance — with alerts when automations break.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
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
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5–10x", label: "Faster lead response" },
              { number: "30–50%", label: "Fewer no-shows" },
              { number: "2–3x", label: "More reviews" },
              { number: "5+ hrs/week", label: "Admin time saved" }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-cyan-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to automate the busywork in your business?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Tell me how leads come in today, how you book clients, and where you’re losing time.
            I’ll map a simple automation system you can grow with.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/softdeployautomation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Book Automation Audit
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}