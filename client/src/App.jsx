// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import Home from './pages/Home.jsx';
import MarketingPage from './pages/MarketingPage.jsx';
import LoginPage from './pages/Login.jsx';
import SignUpPage from './pages/Signup.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import JobsPage from './pages/Jobs.jsx';
import DeployPage from './pages/Deploy.jsx';
import RunsPage from './pages/Runs.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import DocsPage from './pages/DocsPage.jsx';
import IntegrationsPage from './pages/IntegrationsPage.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import NavigationBar from './components/Navigation.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1117] text-white text-xl font-semibold">
        Loading your workspace...
      </div>
    );
  }

  return (
    <Router>
      <div className="bg-[#0e1117] min-h-screen">
        {!user && <NavigationBar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deploy"
            element={
              <ProtectedRoute>
                <DeployPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/runs"
            element={
              <ProtectedRoute>
                <RunsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <main className="text-white text-center py-24 px-6">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="text-white/70 mt-2">Page not found. Please check the URL or go back to <a href="/" className="underline text-cyan-400">home</a>.</p>
              </main>
            }
          />
        </Routes>

        {/* Show AI Chatbot when user is logged in */}
        {user && <AIChatbot user={user} />}
      </div>
    </Router>
  );
}

export default App;