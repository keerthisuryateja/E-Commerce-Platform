import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { ShoppingCart, CreditCard, ChevronRight, AlertTriangle, Home, Trash2, Tag, X } from 'lucide-react';

const Checkout = ({ onNavigate }) => {
  const { cart, addresses, updateCartQuantity, removeFromCart, processCheckout, showToast, appliedCoupon, validateCoupon, removeCoupon } = useContext(AppContext);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paying, setPaying] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const tax = subtotal * 0.08;

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!selectedAddressId && addresses.length > 0) {
      showToast('Please select a shipping address', 'warning');
      return;
    }

    if (addresses.length === 0) {
      showToast('Please add a shipping address before purchasing', 'warning');
      return;
    }

    setPaying(true);
    
    // Process order pipeline
    const success = await processCheckout();
    setPaying(false);
    
    if (success) {
      // Upon clicking 'Pay', immediate redirect to the 'Orders' page
      onNavigate('orders');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShoppingCart size={28} color="var(--primary)" />
        Your Shopping Cart & Checkout
      </h2>

      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ShoppingCart size={48} color="var(--primary)" />
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Fill it with beautiful houseplants to proceed.</p>
          <button onClick={() => onNavigate('store')} className="btn btn-primary">
            Browse Plant Store
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '30px',
          alignItems: 'start',
          flexWrap: 'wrap'
        }}>
          {/* Cart items list & address selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Cart Items ({cart.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100'; }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                        ${parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', borderRadius: '4px' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', borderRadius: '4px' }}
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px', borderRadius: '8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Selection */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Home size={20} color="var(--primary)" />
                Shipping Destination
              </h3>

              {addresses.length === 0 ? (
                <div style={{
                  padding: '20px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--warning-bg)',
                  border: '1px solid rgba(245, 124, 0, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <AlertTriangle size={32} color="var(--warning)" />
                  <div>
                    <h4 style={{ fontWeight: 700 }}>No shipping addresses found</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      You must add a shipping address in your Dashboard before you can place an order.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('dashboard')} 
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    Go to Shipping Dashboard
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select a saved shipping address:</p>
                  {addresses.map((address) => (
                    <label 
                      key={address.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius)',
                        border: selectedAddressId === address.id.toString() ? '2px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: selectedAddressId === address.id.toString() ? 'var(--primary-light)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="address_select" 
                        value={address.id}
                        checked={selectedAddressId === address.id.toString()}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>{address.street}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          ({address.city}, {address.state})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              Checkout Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {/* Coupon Code Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--success-bg)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #c8e6c9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={16} color="var(--success)" />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>{appliedCoupon.code}</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '4px'
                      }}
                      title="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (couponCode.trim()) validateCoupon(couponCode);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                      onClick={() => { if (couponCode.trim()) validateCoupon(couponCode); }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Discount line */}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', my: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: 'var(--primary)' }}>
                <span>Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Payment notification - automated */}
              <div style={{
                backgroundColor: 'var(--primary-light)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
                border: '1px solid var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CreditCard size={18} />
                Automated Demo Payment Sandbox Active
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px' }}
                disabled={paying || addresses.length === 0 || cart.length === 0}
              >
                {paying ? 'Authorizing Sandbox Payment...' : 'Pay & Complete Order'}
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
