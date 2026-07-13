import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toasts } = useContext(AppContext);

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="var(--success)" />;
      case 'error':
        return <XCircle size={20} color="var(--error)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--warning)" />;
      default:
        return <Info size={20} color="var(--primary)" />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'toast toast-success';
      case 'error':
        return 'toast toast-error';
      case 'warning':
        return 'toast toast-warning';
      default:
        return 'toast';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={getToastClass(toast.type)}>
          {getIcon(toast.type)}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
