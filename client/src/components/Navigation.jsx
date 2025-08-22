// src/components/Navigation.jsx
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 48px',
      borderBottom: '1px solid #30363d',
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(14, 17, 23, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 100
    }}>
      {/* 👇 Replaced static block with Link */}
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
  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>SoftDeploy</span>
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
</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/features" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Features</Link>
        <Link to="/subscription" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
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
  );
}

export default Navigation;