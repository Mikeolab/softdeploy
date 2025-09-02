// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  RocketLaunchIcon,
  BeakerIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  CodeBracketIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Animation for CI/CD flow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const ciCdSteps = [
    { icon: CodeBracketIcon, text: "Code Push", color: "text-blue-500" },
    { icon: BeakerIcon, text: "Test Run", color: "text-green-500" },
    { icon: CheckCircleIcon, text: "Quality Check", color: "text-emerald-500" },
    { icon: RocketLaunchIcon, text: "Deploy", color: "text-purple-500" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-cyan-700 dark:text-cyan-300 text-sm font-medium">
              <BoltIcon className="h-4 w-4" />
              AI-Powered CI/CD Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Ship Faster with
              <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              SoftDeploy revolutionizes your development workflow with AI-powered testing, 
              automated deployments, and intelligent monitoring. Build, test, and deploy with 
              unprecedented speed and reliability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-5 w-5" />
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105"
              >
                <CommandLineIcon className="h-5 w-5" />
                Sign In
              </Link>
            </div>

            {/* CI/CD Flow Animation */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  Complete CI/CD Pipeline
                </h3>
                <div className="flex items-center justify-between">
                  {ciCdSteps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`relative ${index < ciCdSteps.length - 1 ? 'w-full' : ''}`}>
                        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                          index <= currentStep 
                            ? 'border-cyan-500 bg-cyan-500 text-white' 
                            : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}>
                          <step.icon className={`h-6 w-6 ${index <= currentStep ? 'text-white' : step.color}`} />
                        </div>
                        {index < ciCdSteps.length - 1 && (
                          <div className={`absolute top-8 left-16 w-24 h-0.5 transition-all duration-500 ${
                            index < currentStep ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}></div>
                        )}
                      </div>
                      <span className={`text-sm font-medium mt-2 transition-all duration-500 ${
                        index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Ship Faster
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From code push to production deployment, SoftDeploy handles every step of your development workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BeakerIcon,
                title: "Intelligent Testing",
                description: "AI-powered test generation and execution with smart flakiness detection and parallel test runs.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: CogIcon,
                title: "Automated CI/CD",
                description: "Visual pipeline builder with YAML support, automated deployments, and rollback capabilities.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: ChartBarIcon,
                title: "Real-time Analytics",
                description: "Comprehensive dashboards with deployment metrics, test coverage, and performance insights.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: ShieldCheckIcon,
                title: "Security & Compliance",
                description: "Built-in security scanning, vulnerability detection, and compliance reporting.",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: BoltIcon,
                title: "Lightning Fast",
                description: "Optimized for speed with parallel processing, intelligent caching, and CDN integration.",
                color: "from-yellow-500 to-amber-500"
              },
              {
                icon: PlayIcon,
                title: "One-Click Deploy",
                description: "Deploy to any environment with a single click. Staging, production, and custom environments.",
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

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10x", label: "Faster Deployments" },
              { number: "99.9%", label: "Uptime Guarantee" },
              { number: "50%", label: "Less Testing Time" },
              { number: "24/7", label: "AI Monitoring" }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-cyan-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of developers who trust SoftDeploy to ship faster and more reliably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <RocketLaunchIcon className="h-5 w-5" />
              Get Started Free
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all duration-300"
            >
              <PlayIcon className="h-5 w-5" />
              Watch Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}