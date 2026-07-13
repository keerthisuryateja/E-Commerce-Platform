import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import {
  User, ShoppingBag, Heart, MapPin, TrendingUp,
  Package, Star, Award, Clock, CreditCard, Leaf
} from 'lucide-react';

const Profile = ({ onNavigate }) => {
  const { user, orders, wishlist, cart, addresses } = useContext(AppContext);

  if (!user) {
    onNavigate('login');
    return null;
  }

  // Computed stats
  const totalOrders     = orders.length;
  const totalSpent      = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const activeOrders    = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const recentOrders    = orders.slice(0, 4);

  // Avatar initials
  const initials = user.email.slice(0, 2).toUpperCase();

  const statusColor = (s) => {
    if (s === 'Completed') return { bg: 'var(--success-bg)', color: 'var(--success)' };
    if (s === 'Cancelled') return { bg: 'var(--error-bg)',   color: 'var(--error)'   };
    if (s === 'Pending')   return { bg: 'var(--warning-bg)', color: 'var(--warning)'  };
    return { bg: '#e3f2fd', color: '#1565c0' };
  };

  const StatCard = ({ icon, label, value, color = 'var(--primary)', sub }) => (
    <div style={{
      backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px',
      display: 'flex', gap: '16px', alignItems: 'center',
      boxShadow: 'var(--shadow)', transition: 'var(--transition)'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {React.cloneElement(icon, { size: 22, color })}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Hero Card ─────────────────────────────────────── */}
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.9rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 20px rgba(46,125,50,0.35)'
          }}>
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {user.email.split('@')[0]}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
              {user.email}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                backgroundColor: user.role === 'admin' ? 'var(--error-bg)' : 'var(--primary-light)',
                color: user.role === 'admin' ? 'var(--error)' : 'var(--primary)',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {user.role === 'admin' ? <Award size={13} /> : <Leaf size={13} />}
                {user.role === 'admin' ? 'Administrator' : 'Plant Enthusiast'}
              </span>
              {completedOrders >= 3 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                  backgroundColor: '#fff8e1', color: '#f9a825',
                  border: '1px solid #ffe082'
                }}>
                  <Star size={13} /> Loyal Customer
                </span>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('store')}  className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Browse Store</button>
            <button onClick={() => onNavigate('orders')} className="btn btn-primary"   style={{ fontSize: '0.85rem' }}>
              <ShoppingBag size={16} /> My Orders
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
        <StatCard icon={<TrendingUp />} label="Total Spent"     value={`$${totalSpent.toFixed(2)}`} color="#2e7d32" sub="Across all orders" />
        <StatCard icon={<ShoppingBag />} label="Total Orders"   value={totalOrders}   color="#1565c0" sub={`${activeOrders} active`} />
        <StatCard icon={<Star />}        label="Completed"      value={completedOrders} color="#388e3c" />
        <StatCard icon={<Package />}     label="Active Orders"  value={activeOrders}  color="#f57c00" />
        <StatCard icon={<Heart />}       label="Wishlist"       value={wishlist.length} color="#e53935" />
        <StatCard icon={<MapPin />}      label="Addresses"      value={addresses.length} color="#7b1fa2" />
      </div>

      {/* ── Spending breakdown ────────────────────────────── */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <CreditCard size={20} color="var(--primary)" /> Order Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Completed', count: completedOrders, color: '#2e7d32' },
            { label: 'Active',    count: activeOrders,    color: '#f57c00' },
            { label: 'Cancelled', count: cancelledOrders, color: '#d32f2f' },
          ].map(({ label, count, color }) => {
            const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '80px', fontSize: '0.85rem', fontWeight: 600, color }}>{label}</span>
                <div style={{ flex: 1, height: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '5px', transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ width: '28px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--primary)" /> Recent Orders
          </h3>
          {orders.length > 4 && (
            <button onClick={() => onNavigate('orders')} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              View All
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <ShoppingBag size={40} color="var(--border)" style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p>No orders yet. Start shopping!</p>
            <button onClick={() => onNavigate('store')} className="btn btn-primary" style={{ marginTop: '16px' }}>
              Browse Plants
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentOrders.map(order => {
              const sc = statusColor(order.status);
              return (
                <div key={order.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)',
                  flexWrap: 'wrap', gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      #SPROUT-{order.id}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {order.items && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                      backgroundColor: sc.bg, color: sc.color
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Saved Addresses ───────────────────────────────── */}
      {addresses.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <MapPin size={20} color="var(--primary)" /> Saved Addresses
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{
                padding: '16px', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{addr.street}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {addr.city}, {addr.state} — {addr.zip}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn btn-secondary"
            style={{ marginTop: '14px', fontSize: '0.85rem' }}
          >
            <MapPin size={15} /> Manage Addresses
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
