import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase.js';
import './styles/App.css';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import ProfilePage from './components/profile/ProfilePage.jsx';
import ScanHistoryPage from './components/profile/ScanHistoryPage.jsx';
import DoctorFinder from './components/DoctorFinder.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import { getScanHistory } from './components/profile/ProfileDrawer.jsx';

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  doctor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

function Sidebar({ user, page, onNavigate }) {
  const history  = getScanHistory();
  const positives = history.filter(s => s.prediction === 'Cancerous').length;
  const clears    = history.length - positives;
  const initials  = (user.displayName || user.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const nav = [
    { key: 'dashboard', label: 'Dashboard',    icon: 'dashboard' },
    { key: 'history',   label: 'Scan History', icon: 'history',   badge: history.length || null },
    { key: 'profile',   label: 'My Profile',   icon: 'profile' },
    { key: 'doctors',   label: 'Find Doctor',  icon: 'doctor',    chip: 'NEW' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          {ICONS.pulse}
        </div>
        <div>
          <div className="sidebar-logo-name">LungDetect</div>
          <div className="sidebar-logo-tag">AI Screening</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>

        {nav.map(({ key, label, icon, badge, chip }) => (
          <button
            key={key}
            className={`sidebar-item ${page === key || (key === 'doctors' && page === 'doctors-urgent') ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            {ICONS[icon]}
            {label}
            {badge ? (
              <span style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700,
                padding: '1px 7px', borderRadius: 10,
              }}>{badge}</span>
            ) : chip ? (
              <span style={{
                marginLeft: 'auto', background: 'rgba(0,200,150,0.15)',
                color: 'var(--mint)', fontSize: 8, fontWeight: 800,
                padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px',
              }}>{chip}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="sidebar-stats-box">
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Total Scans</span>
          <span className="sidebar-stat-val">{history.length}</span>
        </div>
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Positive</span>
          <span className={`sidebar-stat-val ${positives > 0 ? 'red' : ''}`}>{positives}</span>
        </div>
        <div className="sidebar-stat-row">
          <span className="sidebar-stat-label">Clear</span>
          <span className={`sidebar-stat-val ${clears > 0 ? 'mint' : ''}`}>{clears}</span>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-user-name">{user.displayName || 'User'}</div>
            <div className="sidebar-user-email">{(user.email || '').slice(0, 24)}</div>
          </div>
        </div>
        <button className="sidebar-signout" onClick={() => auth.signOut()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function StatsStrip() {
  const history   = getScanHistory();
  const positives = history.filter(s => s.prediction === 'Cancerous').length;
  const last      = history[0];
  const lastDate  = last
    ? new Date(last.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(0,200,150,0.1)' }}>
          {ICONS.pulse}
        </div>
        <div>
          <div className="stat-label">Total Scans</div>
          <div className="stat-value">{history.length}</div>
          <div className="stat-sub">All time analyses</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(255,59,59,0.1)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" width="18" height="18">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <div className="stat-label">Positive Results</div>
          <div className="stat-value">{positives}</div>
          <div className="stat-sub">Flagged for review</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(0,200,150,0.08)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" width="18" height="18">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <div className="stat-label">Last Scan</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{lastDate}</div>
          <div className="stat-sub">{last?.prediction ?? 'No scans yet'}</div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(0,200,150,0.15)',
          borderTopColor: 'var(--mint)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          margin: '0 auto 14px',
        }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>
          Loading…
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [authPage, setAuthPage] = useState('landing');
  const [page, setPage]         = useState('dashboard');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) setPage('dashboard');
    });
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user) {
    if (authPage === 'register')
      return <Register onSwitchToLogin={() => setAuthPage('login')} onBack={() => setAuthPage('landing')} />;
    if (authPage === 'login')
      return <Login onSwitchToRegister={() => setAuthPage('register')} onBack={() => setAuthPage('landing')} />;
    return <LandingPage onGetStarted={() => setAuthPage('register')} onLogin={() => setAuthPage('login')} />;
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} onNavigate={setPage} />

      <div className="main-content">
        {page === 'profile' && (
          <ProfilePage user={user} onBack={() => setPage('dashboard')} />
        )}

        {page === 'history' && (
          <ScanHistoryPage onBack={() => setPage('dashboard')} />
        )}

        {(page === 'doctors' || page === 'doctors-urgent') && (
          <DoctorFinder onBack={() => setPage('dashboard')} urgent={page === 'doctors-urgent'} />
        )}

        {page === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Dashboard</div>
                <div className="page-subtitle">Upload a chest X-ray for AI-powered lung cancer screening</div>
              </div>
              <div className="page-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                ResNet50 · 91.35% acc.
              </div>
            </div>

            <div className="page-body">
              <StatsStrip />
              <ImageUpload user={user} onFindDoctor={() => setPage('doctors-urgent')} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
