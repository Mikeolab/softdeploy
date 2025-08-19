import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
        <Route path="/signup" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
        <Route path="/dashboard" element={<DashboardPage isAuthenticated={isAuthenticated} user={user} />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </Router>
  );
}
// Modern Marketing Page
function MarketingPage() {
  return (
    <div style={{ backgroundColor: '#0e1117', color: 'white', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        borderBottom: '1px solid #30363d',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0e1117',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            height: '32px',
            width: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'black', fontWeight: 'bold', fontSize: '14px' }}>SD</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>SoftDeploy</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#9ca3af',
            backgroundColor: '#161b22',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '8px'
          }}>
            QA & CI/CD Platform
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/features" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Features</Link>
          <Link to="/pricing" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Roadmap</Link>
          <Link to="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Tech</Link>
          <Link to="#" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Integrations</Link>
          <Link to="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
          
          <div style={{ display: 'flex', gap: '12px', marginLeft: '24px' }}>
            <Link to="#" style={{
              color: '#d1d5db',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '8px 16px',
              border: '1px solid #30363d',
              borderRadius: '6px'
            }}>
              Docs
            </Link>
            <Link to="/login" style={{
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              color: 'black',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '6px'
            }}>
              Try Demo
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div style={{ display: 'flex', padding: '80px 48px', gap: '80px', alignItems: 'center' }}>
        {/* Left side - Content */}
        <div style={{ flex: 1, maxWidth: '600px' }}>
          <div style={{
            fontSize: '12px',
            color: '#10b981',
            fontWeight: '600',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            QA-FIRST AUTOMATION
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            lineHeight: '1.1',
            margin: '0 0 24px 0'
          }}>
            Deliver high-quality<br />software faster
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            SoftDeploy automates your tests, integrates code continuously and deploys with confidence. Accelerate release cycles, improve code quality and respond to market changes quickly with built-in security and performance checks.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <Link to="/signup" style={{
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              color: 'black',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Try Demo
            </Link>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid #30363d',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              See How It Works
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>7 min</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Avg. deploy time</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>96%</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Success rate</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>12</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Teams onboarded</div>
            </div>
          </div>
        </div>
        {/* Right side - Dashboard Preview */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Live Pipeline */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }} />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Live Pipeline</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>View all ›</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                Staging • last run 2m ago
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Scheduled</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Nightly E2E</div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                    Passed (24/30)
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Deploy</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Staging → Prod</div>
                  <div style={{
                    backgroundColor: '#10b981',
                    color: 'black',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginTop: '8px',
                    display: 'inline-block'
                  }}>
                    One-click Deploy
                  </div>
                </div>
              </div>
            </div>
            {/* Alerts */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }} />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Alerts</span>
                <span style={{ 
                  backgroundColor: '#161b22',
                  color: '#f59e0b',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  marginLeft: 'auto'
                }}>
                  Slack + Email
                </span>
              </div>
              
              <div style={{
                backgroundColor: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px'
              }}>
                <div style={{ color: '#9ca3af', marginBottom: '4px' }}>+ E2E summary sent to</div>
                <div style={{ color: '#9ca3af', marginBottom: '4px' }}>App alerts</div>
                <div style={{ color: '#9ca3af', marginBottom: '4px' }}>+ 50% budget breach</div>
                <div style={{ color: '#9ca3af' }}>GPS > 1.5s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div style={{ padding: '80px 48px', borderTop: '1px solid #30363d' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
            Accelerate delivery without compromising quality
          </h2>
          <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
            Built for modern development teams who need speed, reliability, and confidence in their deployments.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px' }}>⚡</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Lightning Fast Deployments</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              Deploy in minutes, not hours. Our optimized pipeline reduces deployment time by 80% compared to traditional CI/CD tools.
            </p>
          </div>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px' }}>🛡️</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Built-in Security</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              Automatic security scanning, dependency checks, and compliance monitoring built into every deployment.
            </p>
          </div>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px' }}>📊</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Real-time Analytics</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              Monitor performance, track deployments, and get insights into your development workflow with detailed analytics.
            </p>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div style={{ 
        padding: '80px 48px', 
        textAlign: 'center',
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          Ready to accelerate your deployments?
        </h2>
        <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '32px' }}>
          Join thousands of developers who trust SoftDeploy with their critical deployments.
        </p>
        <Link to="/signup" style={{
          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
          color: 'black',
          textDecoration: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '18px',
          display: 'inline-block'
        }}>
          Start Free Trial
        </Link>
      </div>
    </div>
  );
}
// Enhanced Login Page
function LoginPage({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      setIsAuthenticated(true);
      setUser({ email, name: 'John Doe' });
      navigate('/dashboard');
    }, 1000);
  };
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0e1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.1), transparent, rgba(147, 51, 234, 0.1))',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            textDecoration: 'none'
          }}>
            <div style={{
              height: '40px',
              width: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>SD</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>SoftDeploy</span>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            Welcome back
          </h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Sign in to your deployment dashboard</p>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6b7280' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                color: loading ? 'white' : 'black',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard'}
            </button>
          </form>
          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              fontWeight: '500',
              color: '#60a5fa',
              textDecoration: 'none'
            }}>
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
// Enhanced SignUp Page
function SignUpPage({ setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setIsAuthenticated(true);
      setUser({ email: formData.email, name: formData.fullName });
      navigate('/dashboard');
    }, 1000);
  };
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0e1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), transparent, rgba(29, 78, 216, 0.1))',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            textDecoration: 'none'
          }}>
            <div style={{
              height: '40px',
              width: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>SD</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>SoftDeploy</span>
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            Start deploying today
          </h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>Create your free SoftDeploy account</p>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Create a password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6b7280' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                color: loading ? 'white' : 'black',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>
          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              fontWeight: '500',
              color: '#60a5fa',
              textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
// Complete Dashboard Page
function DashboardPage({ isAuthenticated, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  if (!isAuthenticated) {
    return null;
  }
  return (
    <div style={{ backgroundColor: '#0e1117', color: 'white', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #30363d',
        backgroundColor: '#161b22'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              height: '32px',
              width: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'black', fontWeight: 'bold', fontSize: '14px' }}>SD</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>SoftDeploy</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                background: activeTab === 'overview' ? '#10b981' : 'transparent',
                color: activeTab === 'overview' ? 'black' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('deployments')}
              style={{
                background: activeTab === 'deployments' ? '#10b981' : 'transparent',
                color: activeTab === 'deployments' ? 'black' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Deployments
            </button>
            <button
              onClick={() => setActiveTab('pipelines')}
              style={{
                background: activeTab === 'pipelines' ? '#10b981' : 'transparent',
                color: activeTab === 'pipelines' ? 'black' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Pipelines
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                background: activeTab === 'settings' ? '#10b981' : 'transparent',
                color: activeTab === 'settings' ? 'black' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Settings
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            color: 'black',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            New Deployment
          </button>
          <div style={{ color: '#d1d5db', fontSize: '14px' }}>
            Welcome, {user?.name || 'User'}
          </div>
        </div>
      </nav>
      {/* Dashboard Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'deployments' && <DeploymentsTab />}
        {activeTab === 'pipelines' && <PipelinesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>
        Dashboard Overview
      </h1>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Total Deployments</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>247</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>+12% from last month</div>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Success Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>96.2%</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>+2.1% from last month</div>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Avg Deploy Time</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>6.4min</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>-1.2min from last month</div>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Active Pipelines</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>8</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>2 running now</div>
        </div>
      </div>
      {/* Recent Activity */}
      <div style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Deployments</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { app: 'frontend-app', branch: 'main', status: 'success', time: '2 min ago' },
            { app: 'api-service', branch: 'develop', status: 'success', time: '15 min ago' },
            { app: 'mobile-backend', branch: 'feature/auth', status: 'failed', time: '1 hour ago' },
            { app: 'analytics-service', branch: 'main', status: 'success', time: '2 hours ago' }
          ].map((deployment, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{deployment.app}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Branch: {deployment.branch}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: deployment.status === 'success' ? '#10b981' : '#ef4444',
                  color: deployment.status === 'success' ? 'black' : 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {deployment.status}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{deployment.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Deployments Tab Component
function DeploymentsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Deployments</h1>
        <button style={{
          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
          color: 'black',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          New Deployment
        </button>
      </div>
      <div style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 150px 100px 120px 100px',
          gap: '16px',
          padding: '16px 24px',
          borderBottom: '1px solid #30363d',
          backgroundColor: '#0d1117'
        }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#d1d5db' }}>Application</div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#d1d5db' }}>Branch</div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#d1d5db' }}>Status</div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#d1d5db' }}>Environment</div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#d1d5db' }}>Time</div>
        </div>
        {[
          { app: 'frontend-app', branch: 'main', status: 'success', env: 'production', time: '2m ago' },
          { app: 'api-service', branch: 'develop', status: 'running', env: 'staging', time: '5m ago' },
          { app: 'mobile-backend', branch: 'feature/auth', status: 'failed', env: 'development', time: '1h ago' },
          { app: 'analytics-service', branch: 'main', status: 'success', env: 'production', time: '2h ago' },
          { app: 'notification-service', branch: 'hotfix/email', status: 'success', env: 'production', time: '4h ago' }
        ].map((deployment, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 100px 120px 100px',
            gap: '16px',
            padding: '16px 24px',
            borderBottom: i < 4 ? '1px solid #30363d' : 'none',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '500', fontSize: '14px' }}>{deployment.app}</div>
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>{deployment.branch}</div>
            <div>
              <span style={{
                backgroundColor: 
                  deployment.status === 'success' ? '#10b981' : 
                  deployment.status === 'running' ? '#f59e0b' : '#ef4444',
                color: 
                  deployment.status === 'success' ? 'black' : 
                  deployment.status === 'running' ? 'black' : 'white',
                fontSize: '10px',
                fontWeight: '600',
                padding: '4px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {deployment.status}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>{deployment.env}</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>{deployment.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// Pipelines Tab Component
function PipelinesTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>CI/CD Pipelines</h1>
        <button style={{
          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
          color: 'black',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Create Pipeline
        </button>
      </div>
      <div style={{ display: 'grid', gap: '24px' }}>
        {[
          { name: 'Frontend Production Pipeline', status: 'active', lastRun: '2 min ago', success: '96%' },
          { name: 'API Staging Pipeline', status: 'running', lastRun: 'Running now', success: '94%' },
          { name: 'Mobile App Pipeline', status: 'failed', lastRun: '1 hour ago', success: '89%' },
          { name: 'Analytics Service Pipeline', status: 'active', lastRun: '2 hours ago', success: '98%' }
        ].map((pipeline, i) => (
          <div key={i} style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{pipeline.name}</h3>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Last run: {pipeline.lastRun}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: 
                    pipeline.status === 'active' ? '#10b981' : 
                    pipeline.status === 'running' ? '#f59e0b' : '#ef4444',
                  color: 
                    pipeline.status === 'active' ? 'black' : 
                    pipeline.status === 'running' ? 'black' : 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {pipeline.status}
                </span>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>Success: {pipeline.success}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Build', 'Test', 'Security Scan', 'Deploy'].map((stage, j) => (
                <div key={j} style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: j < 3 ? '#10b981' : '#30363d',
                  borderRadius: '4px'
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// Settings Tab Component
function SettingsTab() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>Settings</h1>
      
      <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Account Settings</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                Display Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                defaultValue="john@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Notification Preferences</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {['Deployment Success', 'Deployment Failures', 'Pipeline Status', 'Security Alerts'].map((notification, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', color: '#d1d5db' }}>{notification}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ef4444' }}>Danger Zone</h3>
          <button style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
// Features Page
function FeaturesPage() {
  return (
    <div style={{ backgroundColor: '#0e1117', color: 'white', minHeight: '100vh', padding: '80px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Features
          </h1>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>
            Everything you need to deploy with confidence
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          {[
            {
              title: 'Automated CI/CD',
              description: 'Set up continuous integration and deployment pipelines in minutes, not hours.',
              icon: '🚀'
            },
            {
              title: 'Security First',
              description: 'Built-in security scanning, dependency checks, and compliance monitoring.',
              icon: '🛡️'
            },
            {
              title: 'Real-time Monitoring',
              description: 'Monitor your deployments in real-time with detailed analytics and alerts.',
              icon: '📊'
            },
            {
              title: 'Team Collaboration',
              description: 'Work together with your team using shared pipelines and deployment workflows.',
              icon: '👥'
            },
            {
              title: 'Multi-Cloud Support',
              description: 'Deploy to any cloud provider with our unified deployment interface.',
              icon: '☁️'
            },
            {
              title: 'Rollback Protection',
              description: 'Automatic rollbacks and deployment protection with health checks.',
              icon: '🔄'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '32px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>{feature.description}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Link to="/signup" style={{
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            color: 'black',
            textDecoration: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '18px',
            display: 'inline-block'
          }}>
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}
// Pricing Page
function PricingPage() {
  return (
    <div style={{ backgroundColor: '#0e1117', color: 'white', minHeight: '100vh', padding: '80px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>
            Choose the plan that fits your team's needs
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {[
            {
              name: 'Starter',
              price: 'Free',
              description: 'Perfect for personal projects',
              features: ['5 deployments/month', '1 pipeline', 'Community support', 'Basic analytics']
            },
            {
              name: 'Professional',
              price: '$29/month',
              description: 'Great for small teams',
              features: ['Unlimited deployments', '10 pipelines', 'Priority support', 'Advanced analytics', 'Team collaboration']
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'For large organizations',
              features: ['Everything in Professional', 'Unlimited pipelines', 'SSO integration', 'Dedicated support', 'Custom integrations']
            }
          ].map((plan, i) => (
            <div key={i} style={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
                {plan.price}
              </div>
              <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{plan.description}</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px' }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{ padding: '8px 0', color: '#d1d5db' }}>✓ {feature}</li>
                ))}
              </ul>
              <button style={{
                background: i === 1 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'transparent',
                color: i === 1 ? 'black' : 'white',
                border: i === 1 ? 'none' : '1px solid #30363d',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default App;