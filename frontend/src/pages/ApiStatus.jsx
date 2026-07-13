import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { Activity, Play, Terminal, Database, Server, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const ENDPOINT_CONFIG = {
  auth:     { name: 'Authentication REST Endpoint',           path: '/health/auth' },
  products: { name: 'Products Database REST Endpoint',        path: '/health/products' },
  orders:   { name: 'Orders Pipeline REST Endpoint',          path: '/health/orders' },
  users:    { name: 'User Shipping Profiles REST Endpoint',   path: '/health/users' }
};

const ApiStatus = () => {
  const { API_URL, wsConnected } = useContext(AppContext);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [dbInfo, setDbInfo] = useState({ status: 'Unknown', type: 'Unknown' });
  const [generalStats, setGeneralStats] = useState({ latency: '-', timestamp: '-' });
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);

  // Endpoints state initialised from the static config
  const [endpoints, setEndpoints] = useState(() =>
    Object.fromEntries(
      Object.entries(ENDPOINT_CONFIG).map(([key, cfg]) => [
        key,
        { ...cfg, status: 'Idle', code: '-', latency: '-' }
      ])
    )
  );

  const logToTerminal = useCallback((msg) => {
    const time = new Date().toLocaleTimeString();
    setDiagnosticLogs(prev => [...prev, `[${time}] ${msg}`]);
  }, []);

  const runHealthCheck = useCallback(async () => {
    setDiagnosticRunning(true);
    setDiagnosticLogs([]);
    logToTerminal('[SYS] Initiating System Health Diagnostics...');

    // Reset status fields
    setEndpoints(
      Object.fromEntries(
        Object.entries(ENDPOINT_CONFIG).map(([key, cfg]) => [
          key,
          { ...cfg, status: 'Testing', code: '-', latency: '-' }
        ])
      )
    );

    // 1. Check Global Server & Database
    try {
      logToTerminal('Calling server health status dashboard...');
      const start = Date.now();
      const res = await fetch(API_URL + '/health');
      const latency = Date.now() - start;

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();

      setDbInfo(data.database);
      setGeneralStats({
        latency: `${latency}ms`,
        timestamp: data.timestamp
      });
      logToTerminal(`Database Node reported: ${data.database.status} (Driver: ${data.database.type})`);
      logToTerminal(`Central Server API responding. Latency: ${latency}ms`);
    } catch (err) {
      logToTerminal(`[ERROR] System health check error: ${err.message}`);
      setDbInfo({ status: 'OFFLINE', type: 'None' });
    }

    // 2. Ping individual REST nodes using the static config (no stale-closure risk)
    for (const [key, cfg] of Object.entries(ENDPOINT_CONFIG)) {
      logToTerminal(`Pinging ${cfg.name}...`);

      const epStart = Date.now();
      try {
        const res = await fetch(API_URL + cfg.path);
        const epLatency = Date.now() - epStart;
        const resData = await res.json();

        setEndpoints(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: res.status === 200 ? 'Active' : 'Degraded',
            code: res.status,
            latency: `${epLatency}ms`
          }
        }));

        if (res.status === 200) {
          logToTerminal(`[SUCCESS] ${cfg.name} returned 200 OK. Responded in ${epLatency}ms (${resData.service || 'Ready'})`);
        } else {
          logToTerminal(`[WARN] ${cfg.name} degraded status. Code: ${res.status}`);
        }
      } catch (err) {
        setEndpoints(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'Offline',
            code: 'Err',
            latency: 'N/A'
          }
        }));
        logToTerminal(`[OFFLINE] ${cfg.name} OFFLINE: ${err.message}`);
      }
      // Brief pause to simulate progression
      await new Promise(r => setTimeout(r, 400));
    }

    logToTerminal('[SYS] Health check diagnostic reports finalized.');
    setDiagnosticRunning(false);
  }, [API_URL, logToTerminal]);

  // Run automatically on mount once
  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={32} color="var(--primary)" />
            Developer API Health check
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time latency check and diagnostic reports of server routes.
          </p>
        </div>

        <button
          onClick={runHealthCheck}
          className="btn btn-primary"
          disabled={diagnosticRunning}
          style={{ display: 'flex', gap: '8px' }}
        >
          <Play size={16} />
          {diagnosticRunning ? 'Diagnostics Running...' : 'Execute API Health Check'}
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        {/* Database Status */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
            <Database size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Database Node Connection
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', color: dbInfo.status === 'OK' ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>
              {dbInfo.status === 'OK' && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />}
              {dbInfo.status === 'OK' ? 'Active' : dbInfo.status}
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {dbInfo.type}
            </span>
          </div>
        </div>

        {/* WebSocket Connection */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
            <Server size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              WebSocket Server Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', color: wsConnected ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: wsConnected ? 'var(--success)' : 'var(--error)' }} />
              {wsConnected ? 'Connected' : 'Offline'}
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Port 5000 Live Sync
            </span>
          </div>
        </div>

        {/* Average API Latency */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
            <Activity size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Diagnostics Latency
            </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
              {generalStats.latency}
            </strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Response timing
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Route details and Terminal log */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '30px',
        alignItems: 'start',
        flexWrap: 'wrap'
      }}>
        {/* Endpoints Table */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            REST API Endpoints status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(endpoints).map(key => {
              const ep = endpoints[key];

              let statusColor = 'var(--text-secondary)';
              let statusIcon = <AlertCircle size={16} color="var(--text-secondary)" />;
              if (ep.status === 'Active') {
                statusColor = 'var(--success)';
                statusIcon = <CheckCircle2 size={16} color="var(--success)" />;
              } else if (ep.status === 'Testing') {
                statusColor = 'var(--warning)';
                statusIcon = <LoaderIcon />;
              } else if (ep.status === 'Offline') {
                statusColor = 'var(--error)';
                statusIcon = <XCircle size={16} color="var(--error)" />;
              }

              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{ep.name}</h4>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      GET {ep.path}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Latency */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Latency
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {ep.latency}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: statusColor,
                      minWidth: '95px',
                      justifyContent: 'center'
                    }}>
                      {statusIcon}
                      {ep.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="card" style={{ backgroundColor: '#1b3024', color: '#a5d6a7', border: '1px solid #2e7d32' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', borderBottom: '1px solid #2e7d32', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} color="#66bb6a" />
            Diagnostic Output
          </h3>

          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            minHeight: '265px',
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px',
            backgroundColor: '#122018',
            borderRadius: '8px'
          }}>
            {diagnosticLogs.map((log, index) => (
              <div key={index} style={{ whiteSpace: 'pre-wrap' }}>{log}</div>
            ))}
            {diagnosticRunning && <div style={{ display: 'inline-block', color: '#ffb74d', fontWeight: 600 }}>Checking...</div>}
            {diagnosticLogs.length === 0 && <div style={{ color: '#81c784' }}>Terminal ready. Start a diagnostics run...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick spinning loader icon for tests
const LoaderIcon = () => (
  <svg
    style={{ animation: 'spin 1s linear infinite' }}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--warning)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <style>{`
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </svg>
);

export default ApiStatus;
