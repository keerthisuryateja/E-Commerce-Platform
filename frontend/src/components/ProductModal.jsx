import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { X, ShoppingCart, Heart, Package } from 'lucide-react';

const ProductModal = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist, user, getImageUrl } = useContext(AppContext);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;
  const inWishlist   = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 900, padding: '20px',
        animation: 'pmFadeIn 0.15s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '20px',
          maxWidth: '800px', width: '100%',
          overflow: 'hidden',
          boxShadow: '0 28px 80px rgba(0,0,0,0.28)',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          maxHeight: '90vh',
          border: '1px solid var(--border)',
          animation: 'pmSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)'
        }}
      >
        {/* Left — Image */}
        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', minHeight: '380px' }}>
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {isOutOfStock && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              backgroundColor: 'rgba(211,47,47,0.9)', color: '#fff',
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
            }}>Out of Stock</div>
          )}
          {isLowStock && !isOutOfStock && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              backgroundColor: 'rgba(245,124,0,0.9)', color: '#fff',
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
            }}>Only {product.stock} left!</div>
          )}
        </div>

        {/* Right — Details */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '6px',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              transition: 'var(--transition)'
            }} title="Close">
              <X size={22} />
            </button>
          </div>

          {/* Name & Price */}
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>
              {product.name}
            </h2>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {product.description}
          </p>

          {/* Stock badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: 'var(--radius)',
            backgroundColor: isOutOfStock ? 'var(--error-bg)' : isLowStock ? 'var(--warning-bg)' : 'var(--success-bg)',
            border: `1px solid ${isOutOfStock ? '#ffcdd2' : isLowStock ? '#ffe0b2' : '#c8e6c9'}`
          }}>
            <Package size={16} color={isOutOfStock ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)'} />
            <span style={{
              fontSize: '0.9rem', fontWeight: 600,
              color: isOutOfStock ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)'
            }}>
              {isOutOfStock
                ? 'Currently out of stock'
                : isLowStock
                  ? `Hurry! Only ${product.stock} units left`
                  : `${product.stock} units available`}
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Indoor Plant', 'Air Purifying', 'Premium Quality'].map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: '20px',
                backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--accent-light)'
              }}>{tag}</span>
            ))}
          </div>

          {/* Actions */}
          {user && user.role !== 'admin' ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: '13px' }}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  padding: '13px 16px', borderRadius: 'var(--radius)',
                  border: `1px solid ${inWishlist ? '#e53935' : 'var(--border)'}`,
                  backgroundColor: inWishlist ? 'var(--error-bg)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'var(--transition)'
                }}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={20} fill={inWishlist ? '#e53935' : 'none'} color={inWishlist ? '#e53935' : 'var(--text-secondary)'} />
              </button>
            </div>
          ) : !user ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'auto' }}>
              <strong>Log in</strong> to add items to your cart or wishlist.
            </p>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideUp {
          from { transform: translateY(28px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
