import { 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  CalendarDaysIcon,
  PhoneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AutomationUIPreview() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            See your automation in action
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Real examples of how automation works across channels
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SMS/Text Automation Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 flex items-center gap-3">
              <PhoneIcon className="h-6 w-6 text-white" />
              <h4 className="text-white font-bold text-lg">SMS Automation</h4>
            </div>
            <div className="p-6 space-y-4">
              {/* Incoming Message */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">👤</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none p-3 mb-1">
                    <p className="text-sm text-gray-900 dark:text-white">Hi, I need a quote for plumbing work</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">2:34 PM</span>
                </div>
              </div>

              {/* Auto Reply */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl rounded-tr-none p-3 mb-1">
                    <p className="text-sm text-white">Hi! Thanks for reaching out. I'd be happy to help with your plumbing needs. Can you tell me what type of work you need?</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Auto-replied instantly</span>
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl rounded-tr-none p-3 mb-1">
                    <p className="text-sm text-white">Here's a link to book a free consultation: [Booking Link]</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sent 2 hours later</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Automation Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 flex items-center gap-3">
              <EnvelopeIcon className="h-6 w-6 text-white" />
              <h4 className="text-white font-bold text-lg">Email Automation</h4>
            </div>
            <div className="p-6 space-y-4">
              {/* Email 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <EnvelopeIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Welcome Email</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Instant</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject: Thanks for your interest!</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Sent immediately after form submission</p>
              </div>

              {/* Email 2 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <EnvelopeIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Day 2 Follow-up</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">+2 days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject: Still interested? Here's what we offer...</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Value-added content + booking link</p>
              </div>

              {/* Email 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <EnvelopeIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Day 5 Reminder</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">+5 days</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject: Last chance - Special offer expires soon</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Urgency + final booking opportunity</p>
              </div>
            </div>
          </div>

          {/* Booking Automation Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden lg:col-span-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center gap-3">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
              <h4 className="text-white font-bold text-lg">Booking & Reminder Automation</h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                    <CalendarDaysIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white mb-2">Client Books</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Self-serve calendar booking</p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">📅 Dec 20, 2:00 PM</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">Confirmed</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <EnvelopeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white mb-2">24hr Reminder</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Auto-sent day before</p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">📧 "Reminder: Your appointment tomorrow at 2 PM"</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Sent</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white mb-2">2hr Reminder</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Final SMS reminder</p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">💬 "See you in 2 hours at 2 PM!"</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Auto-sent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
