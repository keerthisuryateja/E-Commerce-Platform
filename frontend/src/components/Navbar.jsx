import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { ShoppingCart, LogOut, User as UserIcon, ShieldAlert, Activity, Leaf, ShoppingBag, Heart, Moon, Sun } from 'lucide-react';

const Navbar = ({ currentPage, onNavigate }) => {
  const { user, cart, logout, wsConnected, darkMode, toggleDarkMode } = useContext(AppContext);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav style={{
      backgroundColor: darkMode ? 'rgba(15, 26, 17, 0.92)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 24px',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo and branding */}
        <div 
          onClick={() => onNavigate('store')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-head)',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: 'var(--primary)'
          }}
        >
          <Leaf size={28} strokeWidth={2.5} fill="#4caf50" color="#2e7d32" />
          <span style={{ color: 'var(--text-primary)' }}>Sprout</span>
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Cove Co.</span>
        </div>

        {/* Navigation actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <span 
            onClick={() => onNavigate('store')}
            style={{
              fontWeight: 600,
              cursor: 'pointer',
              color: currentPage === 'store' || currentPage === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'var(--transition)'
            }}
          >
            Shop Plants
          </span>

          {user && (
            <>
              {/* User role specific routes */}
              {user.role === 'admin' ? (
                <>
                  <span 
                    onClick={() => onNavigate('admin')}
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: currentPage === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <ShieldAlert size={18} />
                    Admin Panel
                  </span>
                  <span 
                    onClick={() => onNavigate('apistatus')}
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: currentPage === 'apistatus' ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Activity size={18} />
                    API Health
                  </span>
                </>
              ) : (
                <>
                  <span 
                    onClick={() => onNavigate('dashboard')}
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: currentPage === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    Shipping Address
                  </span>
                  <span 
                    onClick={() => onNavigate('wishlist')}
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: currentPage === 'wishlist' ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Heart size={16} />
                    Wishlist
                  </span>
                  <span 
                    onClick={() => onNavigate('orders')}
                    style={{
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: currentPage === 'orders' ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <ShoppingBag size={18} />
                    My Orders
                  </span>
                </>
              )}
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '7px 9px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              transition: 'var(--transition)'
            }}
          >
            {darkMode ? <Sun size={18} color="#f9a825" /> : <Moon size={18} />}
          </button>

          {/* Cart Icon & Pill */}
          {(!user || user.role !== 'admin') && (
            <div 
              onClick={() => onNavigate('checkout')}
              style={{
                position: 'relative',
                cursor: 'pointer',
                color: currentPage === 'checkout' ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Cart / Checkout"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          )}

          {/* User Profile / Login actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '20px'
          }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => user.role !== 'admin' && onNavigate('profile')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: user.role !== 'admin' ? 'pointer' : 'default' }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.email}
                  </span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: user.role === 'admin' ? 'var(--error)' : 'var(--primary)',
                    backgroundColor: user.role === 'admin' ? 'var(--error-bg)' : 'var(--primary-light)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    lineHeight: 1
                  }}>
                    {user.role}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    onNavigate('store');
                  }} 
                  className="btn btn-danger" 
                  style={{ padding: '8px 12px' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
