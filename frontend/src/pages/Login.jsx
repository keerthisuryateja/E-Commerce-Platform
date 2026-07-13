import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { ShieldAlert, User, LogIn, Lock } from 'lucide-react';

const Login = ({ onNavigate }) => {
  const { login, showToast } = useContext(AppContext);
  const [profile, setProfile] = useState('user'); // 'user' or 'admin'
  const [attemptedEditEmail, setAttemptedEditEmail] = useState(false);
  const [attemptedEditPassword, setAttemptedEditPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Predefined credentials
  const credentials = {
    user: {
      email: 'user@ecommerce.com',
      password: 'user123'
    },
    admin: {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    }
  };

  const handleAttempt = (field) => {
    // Show toast warning
    showToast('Default credentials only. Editing is restricted.', 'warning');
    
    // Set edit attempt state to trigger gray styling / shake animation
    if (field === 'email') {
      setAttemptedEditEmail(true);
      setTimeout(() => setAttemptedEditEmail(false), 800);
    } else {
      setAttemptedEditPassword(true);
      setTimeout(() => setAttemptedEditPassword(false), 800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = credentials[profile].email;
    const password = credentials[profile].password;
    
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      if (profile === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('store');
      }
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log in using our pre-seeded accounts</p>
        </div>

        {/* Profile Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <button 
            type="button"
            onClick={() => setProfile('user')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: profile === 'user' ? 'var(--bg-primary)' : 'transparent',
              color: profile === 'user' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: profile === 'user' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <User size={16} />
            Customer
          </button>
          <button 
            type="button"
            onClick={() => setProfile('admin')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: profile === 'admin' ? 'var(--bg-primary)' : 'transparent',
              color: profile === 'admin' ? 'var(--error)' : 'var(--text-secondary)',
              boxShadow: profile === 'admin' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <ShieldAlert size={16} />
            Administrator
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                className={`form-input-restricted ${attemptedEditEmail ? 'attempted-edit' : ''}`}
                style={{
                  width: '100%',
                  cursor: 'not-allowed',
                  backgroundColor: attemptedEditEmail ? '#e9ecef' : '#f8fdf9',
                  borderColor: attemptedEditEmail ? 'var(--error)' : 'var(--border)'
                }}
                value={credentials[profile].email}
                readOnly
                onKeyDown={(e) => {
                  e.preventDefault();
                  handleAttempt('email');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAttempt('email');
                }}
                onChange={(e) => {
                  e.preventDefault();
                  handleAttempt('email');
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" // Using text so they can see password, or password
                className={`form-input-restricted ${attemptedEditPassword ? 'attempted-edit' : ''}`}
                style={{
                  width: '100%',
                  cursor: 'not-allowed',
                  backgroundColor: attemptedEditPassword ? '#e9ecef' : '#f8fdf9',
                  borderColor: attemptedEditPassword ? 'var(--error)' : 'var(--border)'
                }}
                value={credentials[profile].password}
                readOnly
                onKeyDown={(e) => {
                  e.preventDefault();
                  handleAttempt('password');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAttempt('password');
                }}
                onChange={(e) => {
                  e.preventDefault();
                  handleAttempt('password');
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              backgroundColor: profile === 'admin' ? '#2e7d32' : 'var(--primary)' 
            }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : `Log In as ${profile === 'admin' ? 'Admin' : 'User'}`}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <span 
            onClick={() => onNavigate('signup')} 
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Showcase Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
