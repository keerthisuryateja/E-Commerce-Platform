import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Heart, ShoppingCart, Trash2, Leaf, Clock } from 'lucide-react';

const Wishlist = ({ onNavigate }) => {
  const { products, wishlist, toggleWishlist, addToCart, getImageUrl } = useContext(AppContext);

  // Get full product data for wishlist items
  const wishlistProducts = wishlist.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, addedAt: item.addedAt } : null;
  }).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '6px' }}>My Wishlist</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'plant' : 'plants'} saved for later
          </p>
        </div>
        <button 
          onClick={() => onNavigate('store')} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Leaf size={16} />
          Continue Shopping
        </button>
      </div>

      {/* Wishlist Content */}
      {wishlistProducts.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '80px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Heart size={56} color="var(--primary)" strokeWidth={1.5} />
          <h3 style={{ marginTop: '12px', fontSize: '1.3rem' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>
            Start adding your favorite botanical plants by clicking the heart icon on any product card.
          </p>
          <button 
            onClick={() => onNavigate('store')} 
            className="btn btn-primary"
            style={{ marginTop: '8px' }}
          >
            Explore Plants
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {wishlistProducts.map(product => (
            <div 
              key={product.id} 
              className="card" 
              style={{
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative' }}>
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500'; }}
                />
                {/* Remove from wishlist */}
                <button
                  onClick={() => toggleWishlist(product)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'var(--transition)'
                  }}
                  title="Remove from wishlist"
                >
                  <Heart size={18} fill="#e53935" color="#e53935" />
                </button>

                {/* Stock badge */}
                {product.stock <= 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'var(--error)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {product.description}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    Added {new Date(product.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => addToCart(product)}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: product.stock <= 0 ? 0.5 : 1,
                      pointerEvents: product.stock <= 0 ? 'none' : 'auto'
                    }}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart size={16} />
                    {product.stock <= 0 ? 'Unavailable' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="btn btn-danger"
                    style={{
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
