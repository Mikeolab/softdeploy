import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { EnvelopeIcon, PhoneIcon, CalendarDaysIcon, SunIcon, MoonIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Contact() {
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("");
  const [copied, setCopied] = useState(false);

  const emailContent = useMemo(() => {
    return [
      "Hi Mike,",
      "",
      "I'd like help automating parts of my business.",
      "",
      `Name: ${name || "-"}`,
      `Business: ${business || "-"}`,
      `Email: ${email || "-"}`,
      `Phone: ${phone || "-"}`,
      "",
      "What I want to automate:",
      goal || "-",
      "",
      "Best time to reach me:",
      "-",
    ].join("\n");
  }, [business, email, goal, name, phone]);

  const handleSendRequest = async () => {
    const subject = "Automation Audit Request";
    const body = emailContent;
    const mailtoLink = `mailto:mikeolab@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Try to copy email content to clipboard
    try {
      await navigator.clipboard.writeText(`To: mikeolab@gmail.com\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      
      // Also open mailto as fallback
      window.location.href = mailtoLink;
    } catch (err) {
      // Fallback: just open mailto
      window.location.href = mailtoLink;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 grid place-items-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                What we automate
              </Link>
              <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Packages
              </Link>
              <Link to="/contact" className="text-emerald-700 dark:text-emerald-300 font-medium">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full text-emerald-800 dark:text-emerald-200 text-sm font-medium">
              <CalendarDaysIcon className="h-4 w-4" />
              Book an Automation Audit
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Let’s automate the busywork in your business
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Tell me what you’re trying to automate (leads, follow-up, booking, reviews, onboarding, reporting). I’ll respond with a simple plan and next steps.
            </p>

            <div className="space-y-4">
            <a
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border border-emerald-500/60 hover:from-emerald-700 hover:to-cyan-700 transition-colors"
              href="https://calendly.com/softdeployautomation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <div>
                <div className="font-semibold">Book a 20–45min Automation Audit</div>
                <div className="text-sm text-emerald-50/80">Instant scheduling via Calendly</div>
              </div>
            </a>

              <a
                className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500 transition-colors"
                href={`mailto:mikeolab@gmail.com?subject=${encodeURIComponent("Automation Audit Request")}`}
              >
                <EnvelopeIcon className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Email</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Send your request and I’ll reply ASAP</div>
                </div>
              </a>

              <a
                className="flex items-center gap-3 p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-500 transition-colors"
                href="tel:+2340000000000"
              >
                <PhoneIcon className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Phone</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Replace this number with your business line</div>
                </div>
              </a>
            </div>

          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick intake</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Business</span>
                  <input
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Company name"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="you@company.com"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone (optional)</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="+234 ..."
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">What do you want to automate?</span>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Example: missed calls + follow-up + booking reminders + review requests + reporting..."
                />
              </label>

              <button
                onClick={handleSendRequest}
                className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Copied! Opening email...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    Send request
                  </>
                )}
              </button>

              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Your message will open in your email app. We'll respond within 24 hours.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


