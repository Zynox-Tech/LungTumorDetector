import React from 'react';
import { auth } from '../../config/firebase';


export function saveScanToHistory(result, imageFileName) {
  try {
    const history = getScanHistory();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      fileName: imageFileName || 'Unknown',
      prediction: result.prediction,
      confidence: result.confidence,
      cancer_probability: result.cancer_probability,
      risk_level: result.risk_level,
    };
    const updated = [entry, ...history].slice(0, 50);
    localStorage.setItem('lungdetect_scan_history', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save scan history', e);
  }
}

export function getScanHistory() {
  try {
    return JSON.parse(localStorage.getItem('lungdetect_scan_history') || '[]');
  } catch { return []; }
}

export function clearScanHistory() {
  localStorage.removeItem('lungdetect_scan_history');
}

function Avatar({ name, size = 40 }) {
  const initials = (name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1D4ED8', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      fontFamily: "'Inter', sans-serif",
    }}>
      {initials}
    </div>
  );
}

function ProfileDrawer({ open, onClose, user, onNavigate }) {
  if (!open) return null;

  const handleNav = (page) => {
    onClose();
    onNavigate(page);
  };

  return (
    <>
      <div onClick={onClose} style={s.backdrop} />
      <div style={s.panel}>

        <div style={s.userRow}>
          <Avatar name={user?.displayName || user?.email} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={s.userName}>
              {user?.displayName || 'User'}
            </div>
            <div style={s.userEmail}>{user?.email}</div>
          </div>
        </div>

        <div style={s.divider} />

        <button onClick={() => handleNav('profile')} style={s.navBtn}>
          <div style={s.navIconWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#1D4ED8" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div style={s.navLabel}>Visit Profile</div>
            <div style={s.navSub}>Edit your name, email & password</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#CBD5E1" strokeWidth="2" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <button onClick={() => handleNav('history')} style={s.navBtn}>
          <div style={s.navIconWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#1D4ED8" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div style={s.navLabel}>View Scan History</div>
            <div style={s.navSub}>Browse your past analyses</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#CBD5E1" strokeWidth="2" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <div style={s.divider} />

        <button onClick={() => auth.signOut()} style={s.signOutBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>

      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 1000,
  },
  panel: {
    position: 'fixed', top: 68, right: 24,
    width: 300, background: '#fff',
    borderRadius: 12, border: '1px solid #E2E8F0',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    zIndex: 1001, overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  userRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px',
  },
  userName:  { fontSize: 13, fontWeight: 600, color: '#1E293B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  userEmail: { fontSize: 11, color: '#94A3B8', marginTop: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  divider:   { height: 1, background: '#F1F5F9' },
  navBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 16px', background: 'none', border: 'none',
    cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.15s',
  },
  navIconWrap: {
    width: 32, height: 32, background: '#EFF6FF', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  navLabel: { fontSize: 13, fontWeight: 600, color: '#1E293B' },
  navSub:   { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  signOutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#EF4444',
  },
};

export default ProfileDrawer;