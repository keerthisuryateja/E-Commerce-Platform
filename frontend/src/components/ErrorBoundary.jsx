import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '40px', backgroundColor: '#f9fafb', fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '560px', width: '100%', backgroundColor: '#fff',
            border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '12px', fontSize: '1.4rem' }}>Something went wrong</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
              The application crashed during render. Open the browser console (F12) for details.
            </p>
            <pre style={{
              backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px',
              fontSize: '0.78rem', overflowX: 'auto', color: '#374151',
              maxHeight: '200px', overflow: 'auto'
            }}>
              {this.state.error?.toString()}
              {'\n'}
              {this.state.info?.componentStack}
            </pre>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                marginTop: '20px', padding: '10px 24px', backgroundColor: '#2e7d32',
                color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.9rem'
              }}
            >
              Clear State & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
