import { ChevronDownIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does it take to set up automation?",
      answer: "Most automation systems are set up in 1-2 weeks. We start with a free audit call to map your current process, then build and install your automation workflows. You approve each step before it goes live."
    },
    {
      question: "Do I need to learn new software?",
      answer: "No! We prefer to work with tools you already use (like GoHighLevel, CRMs, calendars). We handle all the technical setup and configuration. You just approve the workflows and start saving time."
    },
    {
      question: "What if I want to change something later?",
      answer: "All automations are fully customizable. We can adjust workflows, update messaging, add new steps, or pause automations anytime. Ongoing support is available for updates and optimizations."
    },
    {
      question: "How much time will this actually save me?",
      answer: "Most clients save 5+ hours per week on admin tasks. You'll stop manually replying to leads, sending follow-ups, booking appointments, and requesting reviews. That time goes back to delivering your service."
    },
    {
      question: "What if my business is different from the examples?",
      answer: "Our automation system is flexible and works across industries. Whether you're a local service, agency, clinic, coach, or something else, we customize the workflows to fit your specific process and goals."
    },
    {
      question: "Is there a long-term contract?",
      answer: "No long-term contracts required. We offer flexible packages - you can start with a one-time setup or choose ongoing optimization. You're in control of what you need."
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about business automation
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="https://calendly.com/softdeployautomation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Book a free audit call
          </a>
        </div>
      </div>
    </section>
  );
}
