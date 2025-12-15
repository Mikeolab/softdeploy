// src/App.jsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';

// Pages
import Home from './pages/Home.jsx';
import MarketingPage from './pages/MarketingPage.jsx';
import LoginPage from './pages/Login.jsx';
import SignUpPage from './pages/Signup.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import ProjectsPage from './pages/Projects.jsx';
import ProjectDetailPage from './pages/ProjectDetail.jsx';
import TestManagementPage from './pages/TestManagement.jsx';
import JobsPage from './pages/Jobs.jsx';
import DeployPage from './pages/Deploy.jsx';
import RunsPage from './pages/Runs.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import IntegrationsPage from './pages/IntegrationsPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import DocsPage from './pages/DocsPage.jsx';
import SettingsPage from './pages/Settings.jsx';
import SampleDataEditor from './pages/SampleDataEditor.jsx';
import ProjectMembers from './pages/ProjectMembers.jsx';
import InvitationAccept from './pages/InvitationAccept.jsx';
import Contact from './pages/Contact.jsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import NavigationBar from './components/Navigation.jsx';
import Sidebar from './components/Sidebar.jsx';
import AccountSwitcher from './components/AccountSwitcher.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white text-xl font-semibold">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          Loading your workspace...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          {/* NavigationBar removed to prevent duplication with Home page header */}

          {/* Layout for authenticated users */}
          {user && (
            <div className="relative">
              <Sidebar />
              <main className="w-full transition-all duration-300 lg:pl-16">
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  
                  {/* Project-scoped routes */}
                  <Route path="/projects/:projectId" element={
                    <ProjectProvider>
                      <ProjectDetailPage />
                    </ProjectProvider>
                  } />
                  <Route path="/projects/:projectId/test-management" element={
                    <ProjectProvider>
                      <TestManagementPage />
                    </ProjectProvider>
                  } />
                  <Route path="/projects/:projectId/test-management/:folderId" element={
                    <ProjectProvider>
                      <TestManagementPage />
                    </ProjectProvider>
                  } />
                  <Route path="/projects/:projectId/deploy" element={
                    <ProjectProvider>
                      <DeployPage />
                    </ProjectProvider>
                  } />
                  <Route path="/projects/:projectId/runs" element={
                    <ProjectProvider>
                      <RunsPage />
                    </ProjectProvider>
                  } />
                  <Route path="/projects/:projectId/members" element={
                    <ProjectProvider>
                      <ProjectMembers />
                    </ProjectProvider>
                  } />
                  
                  {/* Invitation routes */}
                  <Route path="/accept-invitation/:token" element={<InvitationAccept />} />
                  
                  {/* Legacy routes - redirect to projects */}
                  <Route path="/test-management" element={<ProjectsPage />} />
                  <Route path="/test-management/:folderId" element={<ProjectsPage />} />
                  <Route path="/deploy" element={<ProjectsPage />} />
                  <Route path="/runs" element={<ProjectsPage />} />
                  
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/sample-data" element={<SampleDataEditor />} />
                  <Route path="/" element={<DashboardPage />} />
                </Routes>
              </main>
            </div>
          )}

          {/* Public routes */}
          {!user && (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/login"
                element={
                  <RedirectIfAuthenticated>
                    <LoginPage />
                  </RedirectIfAuthenticated>
                }
              />
              <Route
                path="/signup"
                element={
                  <RedirectIfAuthenticated>
                    <SignUpPage />
                  </RedirectIfAuthenticated>
                }
              />
            </Routes>
          )}

          {/* 🤖 AI Chatbot shown only when authenticated */}
          {user && <AIChatbot user={user} />}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;