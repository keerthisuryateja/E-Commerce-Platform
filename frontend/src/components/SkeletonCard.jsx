import React from 'react';

const SkeletonCard = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    {/* Image placeholder */}
    <div className="skeleton-shimmer" style={{ height: '240px', borderRadius: 'var(--radius)', marginBottom: '16px' }} />

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton-shimmer" style={{ height: '20px', width: '55%', borderRadius: '6px' }} />
        <div className="skeleton-shimmer" style={{ height: '20px', width: '22%', borderRadius: '6px' }} />
      </div>
      <div className="skeleton-shimmer" style={{ height: '13px', width: '95%', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '13px', width: '80%', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '13px', width: '65%', borderRadius: '4px' }} />
      <div className="skeleton-shimmer" style={{ height: '28px', width: '48%', borderRadius: '6px', marginTop: '4px' }} />
    </div>

    <div className="skeleton-shimmer" style={{ height: '44px', borderRadius: 'var(--radius)', marginTop: '20px' }} />
  </div>
);

export default SkeletonCard;
