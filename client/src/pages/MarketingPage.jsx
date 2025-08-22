import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';

function MarketingPage() {
  return (
    <div style={{ backgroundColor: '#0e1117', color: 'white', minHeight: '100vh' }}>
      <Navigation />
      
      {/* Hero Section */}
      <div style={{ display: 'flex', padding: '100px 48px', gap: '80px', alignItems: 'center' }}>
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
            AI-POWERED DEPLOYMENT
          </div>
          
          <h1 style={{
            fontSize: '52px',
            fontWeight: 'bold',
            lineHeight: '1.1',
            margin: '0 0 24px 0',
            background: 'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ship code with<br />AI confidence
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#9ca3af',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Automate testing, accelerate deployments, and scale with confidence. Our AI-powered platform ensures 99.9% uptime while reducing deployment time by 80%.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <Link to="/signup" style={{
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              color: 'black',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Start Free Trial
            </Link>
            <button style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid #30363d',
              padding: '14px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>3.2 min</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Avg. deploy time</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>99.9%</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Success rate</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>2.4k+</div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>Teams deployed</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview - I'll keep this shorter for the example */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ color: '#10b981', marginBottom: '16px', fontWeight: '600' }}>
              🤖 Live AI Pipeline
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              Production deployed 30s ago with 100% success rate
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of your marketing content... */}
    </div>
  );
}

export default MarketingPage;