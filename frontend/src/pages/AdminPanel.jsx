import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {
  Package, ClipboardList, XCircle, RefreshCw, BarChart2,
  TrendingUp, DollarSign, Edit3, Check, X,
  AlertTriangle, CheckCircle2, Plus, Trash2, ImageOff, ShoppingBag, Download
} from 'lucide-react';

const TAB_STYLES = (active) => ({
  padding: '10px 22px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: active ? 'var(--primary)' : 'transparent',
  color: active ? '#ffffff' : 'var(--text-secondary)',
  transition: 'var(--transition)',
});

// ─── Analytics Tab ────────────────────────────────────────────
const AnalyticsTab = ({ orders, products }) => {
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  // Best selling: products that appear most across all orders
  const salesMap = {};
  orders.forEach(order => {
    if (order.status === 'Cancelled') return;
    (order.items || []).forEach(item => {
      salesMap[item.name] = (salesMap[item.name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const metricCard = (icon, label, value, color = 'var(--primary)', sub = null) => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {React.cloneElement(icon, { size: 22, color })}
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* KPI Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {metricCard(<DollarSign />, 'Total Revenue', `$${totalRevenue.toFixed(2)}`, '#2e7d32', 'From completed orders')}
        {metricCard(<ShoppingBag />, 'Total Orders', totalOrders, '#1565c0', `${activeOrders} active`)}
        {metricCard(<CheckCircle2 />, 'Completed', completedOrders, '#388e3c')}
        {metricCard(<XCircle />, 'Cancelled', cancelledOrders, '#d32f2f')}
        {metricCard(<Package />, 'Total Stock', totalStock, '#7b1fa2', `${outOfStock} out of stock`)}
        {metricCard(<AlertTriangle />, 'Low Stock', lowStock, '#f57c00', 'Items with ≤5 units')}
      </div>

      {/* Order Status Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="var(--primary)" />
          Order Status Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Pending', 'Packed', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'].map(status => {
            const count = statusCounts[status] || 0;
            const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            const colors = {
              Pending: '#f57c00', Packed: '#1976d2', 'Picked Up': '#0288d1',
              Delivered: '#388e3c', Completed: '#2e7d32', Cancelled: '#d32f2f'
            };
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '90px', fontSize: '0.85rem', fontWeight: 600, color: colors[status] }}>{status}</span>
                <div style={{ flex: 1, height: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: colors[status],
                    borderRadius: '5px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                <span style={{ width: '32px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" />
          Best Selling Plants
        </h3>
        {topProducts.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No sales data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.map(([name, qty], idx) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--bg-secondary)',
                  color: idx < 3 ? '#333' : 'var(--text-secondary)',
                  fontWeight: 800, fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{name}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Inventory Tab ─────────────────────────────────────────────
const InventoryTab = ({ products, stockInputs, priceInputs, onStockChange, onPriceChange, onStockUpdate, onPriceUpdate, onAddProduct, onDeleteProduct }) => {
  const [editingPrice, setEditingPrice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '' });

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    if (!form.name || !form.price || form.stock === '') return;
    setSaving(true);
    const result = await onAddProduct({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      image_url: form.image_url || null
    });
    setSaving(false);
    if (result) {
      setForm({ name: '', description: '', price: '', stock: '', image_url: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Add Product Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className={showAddForm ? 'btn btn-secondary' : 'btn btn-primary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px' }}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div style={{
          border: '1px dashed var(--primary)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> New Product Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name *</label>
              <input className="form-input" placeholder="e.g. Peace Lily" value={form.name} onChange={e => handleFormChange('name', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Image URL</label>
              <input className="form-input" placeholder="/assets/plant.jpg" value={form.image_url} onChange={e => handleFormChange('image_url', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price ($) *</label>
              <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => handleFormChange('price', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Initial Stock *</label>
              <input className="form-input" type="number" min="0" placeholder="0" value={form.stock} onChange={e => handleFormChange('stock', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="form-input" placeholder="Brief description of the plant..." value={form.description} onChange={e => handleFormChange('description', e.target.value)} rows={2} style={{ padding: '8px 12px', fontSize: '0.9rem', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
            <button
              onClick={handleAdd}
              className="btn btn-primary"
              style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={saving || !form.name || !form.price || form.stock === ''}
            >
              <Check size={15} />
              {saving ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {/* Product List */}
      {products.map(product => {
        const currentStock = stockInputs[product.id] !== undefined ? stockInputs[product.id] : product.stock;
        const currentPrice = priceInputs[product.id] !== undefined ? priceInputs[product.id] : product.price;
        const isOutOfStock = product.stock === 0;
        const isLowStock = product.stock > 0 && product.stock <= 5;

        return (
          <div key={product.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            borderRadius: 'var(--radius)',
            border: `1px solid ${isOutOfStock ? '#ffcdd2' : isLowStock ? '#ffe0b2' : 'var(--border)'}`,
            backgroundColor: isOutOfStock ? 'var(--error-bg)' : isLowStock ? 'var(--warning-bg)' : 'var(--bg-secondary)',
            flexWrap: 'wrap',
            transition: 'var(--transition)'
          }}>
            {/* Product Image + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'var(--bg-tertiary)' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageOff size={20} color="var(--text-secondary)" />
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{product.name}</h4>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: isOutOfStock ? 'var(--error-bg)' : isLowStock ? 'var(--warning-bg)' : 'var(--success-bg)',
                  color: isOutOfStock ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)'
                }}>
                  {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock: ${product.stock}` : `In Stock: ${product.stock}`}
                </span>
              </div>
            </div>

            {/* Price Editor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price:</span>
              {editingPrice === product.id ? (
                <>
                  <input
                    type="number" min="0" step="0.01"
                    className="form-input"
                    style={{ width: '80px', padding: '6px 8px', fontSize: '0.9rem', textAlign: 'center' }}
                    value={currentPrice}
                    onChange={(e) => onPriceChange(product.id, e.target.value)}
                  />
                  <button onClick={() => { onPriceUpdate(product.id); setEditingPrice(null); }} className="btn btn-primary" style={{ padding: '6px 10px' }} title="Save">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingPrice(null)} className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Cancel">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>${parseFloat(product.price).toFixed(2)}</span>
                  <button onClick={() => setEditingPrice(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }} title="Edit price">
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Stock Editor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock:</span>
              <input
                type="number" min="0"
                className="form-input"
                style={{ width: '72px', padding: '6px 8px', fontSize: '0.9rem', textAlign: 'center' }}
                value={currentStock}
                onChange={(e) => onStockChange(product.id, e.target.value)}
              />
              <button onClick={() => onStockUpdate(product.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Update
              </button>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteProduct(product.id, product.name)}
              className="btn btn-danger"
              style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
              title={`Delete ${product.name}`}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ─── Orders Tab ────────────────────────────────────────────────
const OrdersTab = ({ adminOrders, loadingOrders, onRefresh, onExportCSV, onStatusChange, onCancelOrder }) => {
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = filterStatus === 'All'
    ? adminOrders
    : adminOrders.filter(o => o.status === filterStatus);

  const statusColor = {
    Pending: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    Packed: { bg: '#e3f2fd', color: '#1565c0' },
    'Picked Up': { bg: '#e1f5fe', color: '#01579b' },
    Delivered: { bg: '#e8f5e9', color: '#2e7d32' },
    Completed: { bg: 'var(--success-bg)', color: 'var(--success)' },
    Cancelled: { bg: 'var(--error-bg)', color: 'var(--error)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter + Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Packed', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border)',
                backgroundColor: filterStatus === s ? 'var(--primary)' : 'var(--bg-primary)',
                color: filterStatus === s ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onRefresh} className="btn btn-secondary" style={{ padding: '6px 12px' }} title="Refresh orders">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onExportCSV}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}
            title="Export orders as CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {loadingOrders && filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No orders found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(order => {
            const sc = statusColor[order.status] || statusColor['Pending'];
            return (
              <div key={order.id} style={{
                padding: '20px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                backgroundColor: order.status === 'Cancelled' ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                opacity: order.status === 'Cancelled' ? 0.85 : 1
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                      #SPROUT-{order.id}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 700,
                      backgroundColor: sc.bg, color: sc.color,
                      padding: '4px 10px', borderRadius: '12px'
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  {(order.items || []).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Status control + Cancel button */}
                {order.status !== 'Cancelled' && order.status !== 'Completed' ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="form-input"
                      style={{ flex: 1, minWidth: '160px', padding: '8px 10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderRadius: '8px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Packed">Packed</option>
                      <option value="Picked Up">Picked Up (Shipped)</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => onCancelOrder(order.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <XCircle size={14} />
                      Cancel & Restock
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {order.status === 'Completed' ? 'Order completed — no further actions available.' : 'Order cancelled — items restocked.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main AdminPanel ───────────────────────────────────────────
const AdminPanel = () => {
  const { products, orders, updateProductStock, updateProductPrice, addProduct, deleteProduct, cancelOrder, updateOrderStatus, showToast, API_URL, token } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('analytics');
  const [stockInputs, setStockInputs] = useState({});
  const [priceInputs, setPriceInputs] = useState({});
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ── Custom confirm dialog state ──────────────────────────────
  const [confirm, setConfirm] = useState({ open: false });

  const openConfirm = (opts) =>
    setConfirm({ open: true, cancelLabel: 'Cancel', variant: 'danger', ...opts });

  const closeConfirm = () =>
    setConfirm(prev => ({ ...prev, open: false, onConfirm: null, onCancel: null }));

  useEffect(() => {
    const si = {}, pi = {};
    products.forEach(p => { si[p.id] = p.stock; pi[p.id] = p.price; });
    setStockInputs(si);
    setPriceInputs(pi);
  }, [products]);

  const fetchAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAdminOrders(await res.json());
    } catch (err) {
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => { if (token) fetchAllOrders(); }, [token]);

  const handleStockUpdate = async (productId) => {
    const val = stockInputs[productId];
    if (val === undefined || val === '' || val < 0) {
      showToast('Enter a valid stock level', 'warning'); return;
    }
    await updateProductStock(productId, parseInt(val));
  };

  const handlePriceUpdate = async (productId) => {
    const val = priceInputs[productId];
    if (val === undefined || val === '' || val < 0) {
      showToast('Enter a valid price', 'warning'); return;
    }
    await updateProductPrice(productId, parseFloat(val));
  };

  const handleDeleteProduct = (productId, productName) => {
    openConfirm({
      title:        'Delete Product',
      message:      `Remove "${productName}" from the catalog permanently? This action cannot be undone.`,
      confirmLabel: 'Delete Product',
      variant:      'danger',
      onConfirm: async () => {
        closeConfirm();
        await deleteProduct(productId, productName);
      },
      onCancel: closeConfirm,
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      openConfirm({
        title:        'Cancel Order',
        message:      `Cancel Order #SPROUT-${orderId}? All items will be returned to inventory.`,
        confirmLabel: 'Yes, Cancel Order',
        variant:      'danger',
        onConfirm: async () => {
          closeConfirm();
          const success = await updateOrderStatus(orderId, newStatus);
          if (success) fetchAllOrders();
        },
        onCancel: () => { closeConfirm(); fetchAllOrders(); },
      });
      return;
    }
    updateOrderStatus(orderId, newStatus).then(success => {
      if (success) fetchAllOrders();
    });
  };

  const handleCancelOrder = (orderId) => {
    openConfirm({
      title:        'Cancel Order',
      message:      `Cancel Order #SPROUT-${orderId}? All items will be returned to inventory.`,
      confirmLabel: 'Yes, Cancel Order',
      variant:      'danger',
      onConfirm: async () => {
        closeConfirm();
        const success = await cancelOrder(orderId);
        if (success) fetchAllOrders();
      },
      onCancel: closeConfirm,
    });
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Status', 'Total Amount', 'Items', 'Date'];
    const rows = adminOrders.map(o => [
      `#SPROUT-${o.id}`,
      o.status,
      `$${parseFloat(o.total_amount).toFixed(2)}`,
      (o.items || []).map(i => `${i.name} x${i.quantity}`).join(' | '),
      new Date(o.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sprout-orders-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${adminOrders.length} orders to CSV`, 'success');
  };

  const TABS = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={16} /> },
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Confirm Dialog — replaces all window.confirm() calls */}
      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        variant={confirm.variant}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel || closeConfirm}
      />

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Administrator Control Panel
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage inventory, pricing, orders and view real-time store analytics.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        alignSelf: 'flex-start'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={TAB_STYLES(activeTab === tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'analytics' && (
        <AnalyticsTab orders={adminOrders} products={products} />
      )}
      {activeTab === 'inventory' && (
        <div className="card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <Package size={20} color="var(--primary)" />
            Product Inventory & Pricing
          </h3>
          <InventoryTab
            products={products}
            stockInputs={stockInputs}
            priceInputs={priceInputs}
            onStockChange={(id, v) => setStockInputs(prev => ({ ...prev, [id]: v }))}
            onPriceChange={(id, v) => setPriceInputs(prev => ({ ...prev, [id]: v }))}
            onStockUpdate={handleStockUpdate}
            onPriceUpdate={handlePriceUpdate}
            onAddProduct={addProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      )}
      {activeTab === 'orders' && (
        <div className="card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <ClipboardList size={20} color="var(--primary)" />
            Customer Orders
          </h3>
          <OrdersTab
            adminOrders={adminOrders}
            loadingOrders={loadingOrders}
            onRefresh={fetchAllOrders}
            onExportCSV={handleExportCSV}
            onStatusChange={handleStatusChange}
            onCancelOrder={handleCancelOrder}
          />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
