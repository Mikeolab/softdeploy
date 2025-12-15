import { useState } from 'react';
import { CalculatorIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(50);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculations
  const timeSavedPerWeek = hoursPerWeek;
  const timeSavedPerMonth = timeSavedPerWeek * 4;
  const timeValuePerMonth = timeSavedPerMonth * hourlyRate;
  const timeValuePerYear = timeValuePerMonth * 12;

  // Lead conversion improvements (conservative estimates)
  const currentResponseRate = 0.3; // 30% respond to manual follow-up
  const automatedResponseRate = 0.6; // 60% respond to instant automated follow-up
  const conversionImprovement = (automatedResponseRate - currentResponseRate) * leadsPerMonth;
  const avgDealValue = 500; // Conservative estimate
  const additionalRevenue = conversionImprovement * avgDealValue;

  const totalValuePerYear = timeValuePerYear + additionalRevenue;

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <CalculatorIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-800 dark:text-emerald-300 font-semibold">ROI Calculator</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Calculate your automation ROI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how much time and revenue automation can save your business
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Your business metrics
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Leads per month
                </label>
                <input
                  type="number"
                  value={leadsPerMonth}
                  onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hours spent on admin per week
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your hourly rate ($)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Time Saved */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Time Saved</h3>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {timeSavedPerWeek} hrs/week
                </div>
                <div className="text-emerald-100">
                  {timeSavedPerMonth} hours per month
                </div>
                <div className="text-lg font-semibold mt-4">
                  Value: ${timeValuePerMonth.toLocaleString()}/month
                </div>
              </div>
            </div>

            {/* Revenue Impact */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <ArrowTrendingUpIcon className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Revenue Impact</h3>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-cyan-100 mb-2">
                  Better lead response = more conversions
                </div>
                <div className="text-3xl font-bold">
                  +{conversionImprovement.toFixed(0)} more deals/month
                </div>
                <div className="text-lg font-semibold mt-4">
                  Additional revenue: ${additionalRevenue.toLocaleString()}/month
                </div>
              </div>
            </div>

            {/* Total ROI */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl border-4 border-white/20">
              <h3 className="text-xl font-bold mb-4">Total Annual Value</h3>
              <div className="text-5xl font-bold mb-2">
                ${totalValuePerYear.toLocaleString()}
              </div>
              <div className="text-purple-100 text-sm">
                Time value + Additional revenue per year
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Ready to start saving time and increasing revenue?
          </p>
          <a
            href="https://calendly.com/softdeployautomation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Book Your Free Audit
          </a>
        </div>
      </div>
    </section>
  );
}
