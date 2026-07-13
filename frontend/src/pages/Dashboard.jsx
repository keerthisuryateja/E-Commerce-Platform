import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Search, MapPin, Plus, ShoppingCart, Loader2, AlertTriangle, Heart, Eye } from 'lucide-react';
import ProductModal from '../components/ProductModal.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';

const Dashboard = ({ onNavigate, currentPage }) => {
  const { products, addToCart, addresses, addAddress, user, toggleWishlist, isInWishlist, recentlyViewed, addToRecentlyViewed, productsLoaded } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Shipping Address Form State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Address tab selection for users
  const [viewTab, setViewTab] = useState(currentPage === 'dashboard' ? 'addresses' : 'shop'); // 'shop' or 'addresses'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Synchronize viewTab when currentPage changes
  useEffect(() => {
    if (currentPage === 'dashboard') {
      setViewTab('addresses');
    } else {
      setViewTab('shop');
    }
  }, [currentPage]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'All') return matchesSearch;
    
    if (selectedCategory === 'Lush Foliage') {
      return matchesSearch && ['Fiddle Leaf Fig', 'Monstera Deliciosa', 'Boston Fern'].includes(product.name);
    }
    if (selectedCategory === 'Succulents') {
      return matchesSearch && ['Snake Plant', 'Echeveria Succulent'].includes(product.name);
    }
    if (selectedCategory === 'Easy Care') {
      return matchesSearch && ['Snake Plant', 'Golden Pothos', 'Echeveria Succulent'].includes(product.name);
    }
    return matchesSearch;
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !stateName || !zip) return;
    
    setSavingAddress(true);
    const success = await addAddress({ street, city, state: stateName, zip });
    setSavingAddress(false);
    
    if (success) {
      setStreet('');
      setCity('');
      setStateName('');
      setZip('');
    }
  };

  const handleProductClick = (product) => {
    addToRecentlyViewed(product);
    setSelectedProduct(product);
  };

  // Build recently viewed with live product data
  const enrichedRecentlyViewed = recentlyViewed
    .map(rv => products.find(p => p.id === rv.id) || rv)
    .slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Welcome banner with Search and Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        backgroundColor: 'var(--bg-primary)',
        padding: '30px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {user ? `Hello, Gardener!` : 'Welcome to Sprout Cove Co.'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Bring nature indoors with our handpicked premium plants.
          </p>
        </div>

        {/* Action Toggle Tabs for Customer */}
        {user && user.role === 'user' && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <button 
              onClick={() => setViewTab('shop')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: viewTab === 'shop' ? 'var(--bg-primary)' : 'transparent',
                color: viewTab === 'shop' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: viewTab === 'shop' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              Browse Plants
            </button>
            <button 
              onClick={() => setViewTab('addresses')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: viewTab === 'addresses' ? 'var(--bg-primary)' : 'transparent',
                color: viewTab === 'addresses' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: viewTab === 'addresses' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'var(--transition)'
              }}
            >
              Shipping Addresses
            </button>
          </div>
        )}
      </div>

      {/* Main sections */}
      {viewTab === 'shop' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Search bar & Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <Search 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} 
              />
              <input 
                type="text" 
                placeholder="Search leafy products..." 
                className="form-input"
                style={{ width: '100%', paddingLeft: '44px', fontSize: '0.9rem', padding: '10px 16px 10px 44px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Pills/Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Lush Foliage', 'Succulents', 'Easy Care'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of plants */}
          {!productsLoaded ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <AlertTriangle size={48} color="var(--warning)" />
              <h3 style={{ marginTop: '10px' }}>No plants found matching "{searchTerm}"</h3>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                
                return (
                  <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Image */}
                    <div
                      onClick={() => handleProductClick(product)}
                      style={{
                        height: '240px',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius)',
                        marginBottom: '16px',
                        position: 'relative',
                        backgroundColor: 'var(--bg-tertiary)',
                        cursor: 'pointer'
                      }}
                    >
                      <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500'} 
                        alt={product.name} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'var(--transition)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {isOutOfStock && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(211, 47, 47, 0.9)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          Out of Stock
                        </div>
                      )}
                      {/* Wishlist heart button */}
                      {user && user.role !== 'admin' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            width: '34px',
                            height: '34px',
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
                          title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart 
                            size={16} 
                            fill={isInWishlist(product.id) ? '#e53935' : 'none'} 
                            color={isInWishlist(product.id) ? '#e53935' : '#999'}
                          />
                        </button>
                      )}
                    </div>

                    {/* Meta */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>{product.name}</h3>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.15rem' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>
                        {product.description}
                      </p>
                      <button
                        onClick={() => handleProductClick(product)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '0', marginTop: '4px'
                        }}
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {/* Stock label */}
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {isOutOfStock ? (
                          <span style={{ color: 'var(--error)' }}>Temporarily Out of Stock</span>
                        ) : isLowStock ? (
                          <span style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)', padding: '4px 8px', borderRadius: '6px' }}>
                            Only {product.stock} units left!
                          </span>
                        ) : (
                          <span style={{ color: 'var(--success)', backgroundColor: 'var(--success-bg)', padding: '4px 8px', borderRadius: '6px' }}>
                            {product.stock} units in stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '20px' }}>
                      {user?.role === 'admin' ? (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%' }}
                          onClick={() => onNavigate('admin')}
                        >
                          Modify Stock in Admin Panel
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%' }}
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock}
                        >
                          <ShoppingCart size={18} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recently Viewed */}
          {enrichedRecentlyViewed.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Eye size={18} color="var(--primary)" /> Recently Viewed
              </h3>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {enrichedRecentlyViewed.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    style={{
                      minWidth: '160px', maxWidth: '160px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      overflow: 'hidden', cursor: 'pointer',
                      transition: 'var(--transition)',
                      flexShrink: 0,
                      boxShadow: 'var(--shadow)'
                    }}
                  >
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=200'}
                      alt={product.name}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=200'; }}
                      style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Shipping Address Dashboard */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          alignItems: 'start',
          flexWrap: 'wrap'
        }}>
          {/* Current Addresses */}
          <div className="card" style={{ minHeight: '300px' }}>
            <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={22} color="var(--primary)" />
              Saved Shipping Addresses
            </h3>

            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <p>No shipping addresses added yet.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Fill out the form to add your first destination.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {addresses.map((address) => (
                  <div 
                    key={address.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)',
                      transition: 'var(--transition)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px', color: 'var(--primary)' }}>
                      Address #{address.id}
                    </div>
                    <p style={{ fontWeight: 500 }}>{address.street}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {address.city}, {address.state} - {address.zip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Address Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={22} color="var(--primary)" />
              Add New Address
            </h3>

            <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input 
                  type="text"
                  placeholder="e.g. 456 Plant Way"
                  className="form-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input 
                    type="text"
                    placeholder="e.g. Portland"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input 
                    type="text"
                    placeholder="e.g. OR"
                    className="form-input"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input 
                  type="text"
                  placeholder="e.g. 97201"
                  className="form-input"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="pulse-green" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving Address...
                  </>
                ) : (
                  'Save Shipping Address'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
