// src/components/Navigation.jsx
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  PlayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 text-decoration-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">SoftDeploy</span>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                QA & CI/CD Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Features
            </Link>
            <Link to="/subscription" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Pricing
            </Link>
            <Link to="/integrations" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Integrations
            </Link>
            <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
              Dashboard
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/docs" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <BookOpenIcon className="h-4 w-4" />
              Docs
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
              <PlayIcon className="h-4 w-4" />
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;