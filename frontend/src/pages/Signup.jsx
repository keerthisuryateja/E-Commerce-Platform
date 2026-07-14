import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Signup = ({ onNavigate }) => {
  const { showToast } = useContext(AppContext);
  const [attemptedEdit, setAttemptedEdit] = useState({
    username: false,
    email: false,
    password: false
  });

  const placeholderValues = {
    username: 'sprout_gardener',
    email: 'new_gardener@sprout.com',
    password: 'securePassword123'
  };

  const handleAttempt = (field) => {
    showToast('Signup is in read-only showcase mode.', 'warning');
    setAttemptedEdit(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setAttemptedEdit(prev => ({ ...prev, [field]: false }));
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Account Created Successfully! (Showcase Mode)', 'success');
    // Redirect to login after a brief delay so the user sees the toast
    setTimeout(() => {
      onNavigate('login');
    }, 1500);
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
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>Join Sprout & Co.</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Signup is read-only for this demonstration</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text"
              className={`form-input-restricted ${attemptedEdit.username ? 'attempted-edit' : ''}`}
              style={{
                width: '100%',
                cursor: 'not-allowed',
                backgroundColor: attemptedEdit.username ? 'var(--border)' : 'var(--bg-secondary)',
                borderColor: attemptedEdit.username ? 'var(--error)' : 'var(--border)'
              }}
              value={placeholderValues.username}
              readOnly
              onKeyDown={(e) => { e.preventDefault(); handleAttempt('username'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAttempt('username'); }}
              onChange={(e) => { e.preventDefault(); handleAttempt('username'); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email"
              className={`form-input-restricted ${attemptedEdit.email ? 'attempted-edit' : ''}`}
              style={{
                width: '100%',
                cursor: 'not-allowed',
                backgroundColor: attemptedEdit.email ? 'var(--border)' : 'var(--bg-secondary)',
                borderColor: attemptedEdit.email ? 'var(--error)' : 'var(--border)'
              }}
              value={placeholderValues.email}
              readOnly
              onKeyDown={(e) => { e.preventDefault(); handleAttempt('email'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAttempt('email'); }}
              onChange={(e) => { e.preventDefault(); handleAttempt('email'); }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Password</label>
            <input 
              type="text"
              className={`form-input-restricted ${attemptedEdit.password ? 'attempted-edit' : ''}`}
              style={{
                width: '100%',
                cursor: 'not-allowed',
                backgroundColor: attemptedEdit.password ? 'var(--border)' : 'var(--bg-secondary)',
                borderColor: attemptedEdit.password ? 'var(--error)' : 'var(--border)'
              }}
              value={placeholderValues.password}
              readOnly
              onKeyDown={(e) => { e.preventDefault(); handleAttempt('password'); }}
              onMouseDown={(e) => { e.preventDefault(); handleAttempt('password'); }}
              onChange={(e) => { e.preventDefault(); handleAttempt('password'); }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
          >
            <UserPlus size={18} />
            Sign Up
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => onNavigate('login')} 
          className="btn btn-secondary"
          style={{ display: 'inline-flex', gap: '8px', fontSize: '0.9rem', padding: '10px 20px' }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
