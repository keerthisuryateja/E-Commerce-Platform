import React, { useState, useContext } from 'react'
import { AppProvider, AppContext } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import Toast from './components/Toast.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ApiStatus from './pages/ApiStatus.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Profile from './pages/Profile.jsx'

const PROTECTED_PAGES = ['dashboard', 'checkout', 'orders', 'admin', 'apistatus', 'wishlist', 'profile'];
const ADMIN_ONLY_PAGES = ['admin', 'apistatus'];

const VALID_PAGES = ['store', 'dashboard', 'checkout', 'orders', 'admin', 'apistatus', 'wishlist', 'login', 'signup', 'profile'];

function AppContent() {
  const { user } = useContext(AppContext);

  // Restore last visited page from sessionStorage on mount
  const getInitialPage = () => {
    try {
      const saved = sessionStorage.getItem('currentPage') || 'store';
      // Reject any unknown/invalid page keys
      if (!VALID_PAGES.includes(saved)) return 'store';
      // Re-validate the restored page against auth state
      if (PROTECTED_PAGES.includes(saved) && !user) return 'store';
      if (ADMIN_ONLY_PAGES.includes(saved) && user?.role !== 'admin') return 'store';
      return saved;
    } catch {
      return 'store';
    }
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const navigateTo = (page) => {
    // Read latest user from localStorage if context state is still updating (stale closure)
    let currentUser = user;
    if (!currentUser) {
      try {
        const saved = localStorage.getItem('user');
        if (saved) currentUser = JSON.parse(saved);
      } catch {}
    }

    // Guards
    if (PROTECTED_PAGES.includes(page) && !currentUser) {
      setCurrentPage('login');
      sessionStorage.setItem('currentPage', 'login');
      return;
    }
    if (ADMIN_ONLY_PAGES.includes(page) && currentUser?.role !== 'admin') {
      setCurrentPage('store');
      sessionStorage.setItem('currentPage', 'store');
      return;
    }
    setCurrentPage(page);
    sessionStorage.setItem('currentPage', page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={navigateTo} />;
      case 'signup':
        return <Signup onNavigate={navigateTo} />;
      case 'store':
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} currentPage={currentPage} />;
      case 'checkout':
        return <Checkout onNavigate={navigateTo} />;
      case 'orders':
        return <Orders onNavigate={navigateTo} />;
      case 'wishlist':
        return <Wishlist onNavigate={navigateTo} />;
      case 'admin':
        return <AdminPanel onNavigate={navigateTo} />;
      case 'apistatus':
        return <ApiStatus onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} currentPage="store" />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Toast />
      
      {/* Premium Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <strong>Sprout Cove Co.</strong> © 2026. Premium botanical vibes.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => navigateTo('store')}>Store</span>
            {user?.role === 'admin' && (
              <>
                <span style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => navigateTo('admin')}>Admin</span>
                <span style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => navigateTo('apistatus')}>Developer API</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
