import { 
  InboxArrowDownIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function WorkflowDiagram() {
  const steps = [
    {
      id: 1,
      title: "Lead Captured",
      description: "Form, ad, DM, or call",
      icon: InboxArrowDownIcon,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
      id: 2,
      title: "AI Chatbot Replies",
      description: "Instant 24/7 response",
      icon: SparklesIcon,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-900/20"
    },
    {
      id: 3,
      title: "Auto Follow-up",
      description: "SMS/email sequences",
      icon: ChatBubbleLeftRightIcon,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      id: 4,
      title: "Booked & Reminded",
      description: "Calendar + reminders",
      icon: CalendarDaysIcon,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    }
  ];

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Desktop View - Horizontal Flow */}
        <div className="hidden lg:block relative">
          <div className="flex items-center justify-between relative">
            {/* Connection Lines */}
            <svg className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 z-0" style={{ height: '2px' }}>
              {steps.slice(0, -1).map((_, index) => {
                const startX = (index + 1) * (100 / steps.length) + '%';
                const endX = (index + 2) * (100 / steps.length) + '%';
                return (
                  <line
                    key={index}
                    x1={startX}
                    y1="50%"
                    x2={endX}
                    y2="50%"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="33%" stopColor="#8b5cf6" />
                  <stop offset="66%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Step Nodes */}
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                  {/* Arrow Indicator */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 left-full -translate-y-1/2 -translate-x-1/2 z-20">
                      <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Step Card */}
                  <div className={`${step.bgColor} rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300 w-full max-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105`}>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {step.description}
                    </p>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                      {step.id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View - Vertical Flow */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-cyan-500 via-violet-500 via-emerald-500 to-blue-500 z-0">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-t-4 border-t-blue-500 border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                  </div>
                )}
                
                {/* Step Card */}
                <div className={`${step.bgColor} rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 relative shadow-lg`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          {step.id}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
