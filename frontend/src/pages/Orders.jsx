import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Calendar, Tag, CheckCircle2, AlertCircle, XCircle, Package, Truck, ClipboardList, CircleDot, MapPin } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

// ─── Order Timeline ────────────────────────────────────────────
const STATUS_STEPS = ['Pending', 'Packed', 'Picked Up', 'Delivered', 'Completed'];

const getStepIcon = (step, size = 18) => {
  switch (step) {
    case 'Pending':   return <ClipboardList size={size} />;
    case 'Packed':    return <Package size={size} />;
    case 'Picked Up': return <Truck size={size} />;
    case 'Delivered': return <MapPin size={size} />;
    case 'Completed': return <CheckCircle2 size={size} />;
    default:          return <CircleDot size={size} />;
  }
};

const OrderTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === 'Cancelled';
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--error-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid #ffcdd2'
      }}>
        <XCircle size={22} color="var(--error)" />
        <div>
          <span style={{ fontWeight: 700, color: 'var(--error)', fontSize: '0.95rem' }}>Order Cancelled</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            This order has been cancelled and items restocked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '20px 10px',
      position: 'relative'
    }}>
      {/* Background track */}
      <div style={{
        position: 'absolute', top: '40px', left: '10%', right: '10%',
        height: '3px', backgroundColor: '#e8e8e8', borderRadius: '2px', zIndex: 0
      }} />
      {/* Progress fill */}
      <div style={{
        position: 'absolute', top: '40px', left: '10%',
        width: `${Math.max(0, currentIndex) / (STATUS_STEPS.length - 1) * 80}%`,
        height: '3px', backgroundColor: 'var(--primary)', borderRadius: '2px',
        zIndex: 1, transition: 'width 0.5s ease'
      }} />

      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isCurrent   = idx === currentIndex;
        return (
          <div key={step} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '8px', zIndex: 2, flex: 1, position: 'relative'
          }}>
            <div style={{
              width: isCurrent ? '40px' : '34px',
              height: isCurrent ? '40px' : '34px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isCompleted ? 'var(--primary)' : '#f5f5f5',
              color: isCompleted ? '#ffffff' : '#bdbdbd',
              border: isCurrent
                ? '3px solid var(--primary-light)'
                : isCompleted ? 'none' : '2px solid #e0e0e0',
              transition: 'all 0.3s ease',
              boxShadow: isCurrent ? '0 0 0 4px rgba(46,125,50,0.12)' : 'none'
            }}>
              {getStepIcon(step, isCurrent ? 18 : 15)}
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: isCurrent ? 700 : 600,
              color: isCompleted ? 'var(--primary)' : 'var(--text-secondary)',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Orders Page ───────────────────────────────────────────────
const Orders = ({ onNavigate }) => {
  const { orders, cancelOrder, getImageUrl } = useContext(AppContext);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirm, setConfirm]           = useState({ open: false, orderId: null });

  const handleCancelClick = (orderId) =>
    setConfirm({ open: true, orderId });

  const handleConfirm = async () => {
    const orderId = confirm.orderId;
    setConfirm({ open: false, orderId: null });
    setCancellingId(orderId);
    await cancelOrder(orderId);
    setCancellingId(null);
  };

  const handleDismiss = () =>
    setConfirm({ open: false, orderId: null });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: 'var(--success-bg)', color: 'var(--success)',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <CheckCircle2 size={14} /> {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: 'var(--error-bg)', color: 'var(--error)',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <XCircle size={14} /> Cancelled
          </span>
        );
      case 'Packed':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: '#eef5f0', color: '#1b5e20',
            border: '1px solid #c8e6c9',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <Package size={14} /> Packed
          </span>
        );
      case 'Picked Up':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: '#e3f2fd', color: '#0d47a1',
            border: '1px solid #bbdefb',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <Truck size={14} /> Picked Up
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: 'var(--warning-bg)', color: 'var(--warning)',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
          }}>
            <AlertCircle size={14} /> {status}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Reusable confirm dialog */}
      <ConfirmDialog
        isOpen={confirm.open}
        title={`Cancel Order #SPROUT-${confirm.orderId}?`}
        message={
          <>
            This will permanently cancel your order and return all items back to stock.{' '}
            <strong style={{ color: 'var(--error)' }}>This action cannot be undone.</strong>
          </>
        }
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={handleDismiss}
      />

      <h2 style={{ fontSize: '2rem' }}>Your Plant Orders</h2>

      {orders.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center', padding: '60px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
        }}>
          <Package size={48} color="var(--primary)" />
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Once you purchase plants from the checkout page, they will show up here.
          </p>
          <button onClick={() => onNavigate('store')} className="btn btn-primary">
            Visit Botanist Store
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '24px' }}>

              {/* Order Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '15px',
                borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Order Placed
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
                      <Calendar size={14} color="var(--primary)" />
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Order Reference
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
                      <Tag size={14} color="var(--primary)" />
                      #SPROUT-{order.id}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Amount
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Timeline */}
              <OrderTimeline currentStatus={order.status} />

              {/* Cancel button — only for Pending orders */}
              {order.status === 'Pending' && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleCancelClick(order.id)}
                    className="btn btn-danger"
                    style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={cancellingId === order.id}
                  >
                    <XCircle size={15} />
                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}

              {/* Order Items */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '12px',
                marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px'
              }}>
                {order.items && order.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '16px'
                  }}>
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100'; }}
                      style={{
                        width: '50px', height: '50px',
                        borderRadius: '6px', objectFit: 'cover',
                        backgroundColor: 'var(--bg-tertiary)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
