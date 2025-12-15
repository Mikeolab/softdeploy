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
  InboxArrowDownIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4">
        <a
          href="https://calendly.com/softdeployautomation"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300"
        >
          <CalendarDaysIcon className="h-5 w-5" />
          Book Free Audit
        </a>
      </div>

      {/* Header with Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
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

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
              Get instant replies to every lead, automated follow-up sequences, and booking reminders — 
              <span className="font-semibold text-gray-900 dark:text-white">save 5+ hours per week</span> on admin work.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span>Free 20-min audit</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-cyan-500" />
                <span>Setup in 1-2 weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                <span>No long-term contracts</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://calendly.com/softdeployautomation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/50"
              >
                <CalendarDaysIcon className="h-6 w-6" />
                Book Free Automation Audit
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
              ⚡ Limited spots this week — Book your free audit now
            </p>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  A simple automation engine for your entire front office
                </h3>
                
                {/* Visual Workflow with Arrows */}
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Step 1 */}
                    <div className="relative flex flex-col items-center text-center group">
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <InboxArrowDownIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 w-full border border-gray-200 dark:border-gray-600">
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
                          New lead captured
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Web form, ad, DM, or missed call
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 z-0">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-violet-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex flex-col items-center text-center group">
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <SparklesIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 w-full border border-gray-200 dark:border-gray-600">
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
                          AI chatbot replies
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          24/7 instant answers & booking
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-violet-500 to-emerald-500 z-0">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-emerald-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex flex-col items-center text-center group">
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 w-full border border-gray-200 dark:border-gray-600">
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
                          Auto follow-up
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          SMS/email sequences for days
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 z-0">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="relative flex flex-col items-center text-center group">
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <CalendarDaysIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 w-full border border-gray-200 dark:border-gray-600">
                        <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
                          Booked & reminded
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Calendar booking + reminders
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile arrows (vertical) */}
                  <div className="lg:hidden flex flex-col items-center gap-4 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-0.5 h-8 bg-gradient-to-b from-cyan-500 via-violet-500 via-emerald-500 to-blue-500 relative">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-t-4 border-t-blue-500 border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Before vs. After Automation
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See the difference automation makes in your daily workflow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-red-200 dark:border-red-900/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-2xl">😰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Before Automation</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Leads wait hours for a response",
                  "Missed calls = lost opportunities",
                  "Manual follow-up emails every day",
                  "No-shows waste your time",
                  "Reviews? You have to ask manually",
                  "5+ hours/week on admin tasks"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">After Automation</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Leads get instant replies 24/7",
                    "Missed calls auto-text back & book",
                    "Follow-up sequences run automatically",
                    "Reminders reduce no-shows by 40%+",
                    "Reviews requested automatically",
                    "Focus on delivery, not admin"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 mt-1">✓</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple 3-Step Process */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to automate your business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Free audit call",
                description: "We map your current lead flow, booking process, and identify the biggest automation wins.",
                icon: CalendarDaysIcon,
                color: "from-cyan-500 to-blue-500"
              },
              {
                step: "2",
                title: "We build & install",
                description: "Our team sets up your automation system in 1-2 weeks. You approve each workflow before it goes live.",
                icon: RocketLaunchIcon,
                color: "from-emerald-500 to-cyan-500"
              },
              {
                step: "3",
                title: "You save time",
                description: "Leads reply instantly, bookings confirm automatically, reviews come in — you focus on delivery.",
                icon: CheckCircleIcon,
                color: "from-blue-500 to-purple-500"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-6 mx-auto`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Who we help
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We've automated workflows for businesses across industries
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Local Services", icon: "🔧" },
              { name: "Agencies", icon: "💼" },
              { name: "Clinics", icon: "🏥" },
              { name: "Coaches", icon: "🎯" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by businesses like yours
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                quote: "We went from chasing leads to filling our calendar 2 weeks out. The missed-call text-back alone captured 40% more leads.",
                author: "Sarah M.",
                role: "Local Service Business Owner",
                rating: 5
              },
              {
                quote: "Setup took 10 days. Now I spend zero time on follow-ups — everything runs automatically. Best investment I made this year.",
                author: "James T.",
                role: "Agency Founder",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
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
                icon: SparklesIcon,
                title: "AI-powered chatbot",
                description: "24/7 AI receptionist answers calls, books appointments, and captures leads even when you're offline.",
                color: "from-violet-500 to-purple-500"
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

      {/* Final CTA with urgency */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to stop losing leads?
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Book your free 20-minute automation audit. We'll map your current process and show you the 2-3 automations that will save you the most time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="https://calendly.com/softdeployautomation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-cyan-600 hover:bg-gray-50 font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <CalendarDaysIcon className="h-6 w-6" />
              Book Free Audit Now
            </a>
          </div>
          <p className="text-sm text-cyan-100">
            ⚡ Limited availability this week — Reserve your spot
          </p>
        </div>
      </section>
      {/* Bottom padding for mobile CTA */}
      <div className="h-20 md:h-0"></div>
    </main>
  );
}