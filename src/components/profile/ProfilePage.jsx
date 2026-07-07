import React, { useState, useEffect } from 'react';
import {
  updateProfile, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../../config/firebase';

const SMOKING_OPTIONS = [
  { value: 'non_smoker',      label: 'Non-Smoker' },
  { value: 'ex_smoker',       label: 'Ex-Smoker' },
  { value: 'mild_smoker',     label: 'Mild Smoker (occasional / social)' },
  { value: 'moderate_smoker', label: 'Moderate Smoker (10–20 cig/day)' },
  { value: 'chain_smoker',    label: 'Chain Smoker (20+ cig/day)' },
];

const EXPOSURE_OPTIONS = [
  { value: 'not_exposed',          label: 'Not Exposed' },
  { value: 'occasionally_exposed', label: 'Occasionally Exposed (rare contact)' },
  { value: 'regularly_exposed',    label: 'Regularly Exposed (daily environment)' },
  { value: 'occupational',         label: 'Occupational Exposure (workplace fumes/chemicals)' },
];

function Avatar({ name, size = 72 }) {
  const initials = (name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1D4ED8', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ProfilePage({ user, onBack }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail]       = useState(user?.email || '');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [savingInfo, setSavingInfo]   = useState(false);
  const [savingPw, setSavingPw]       = useState(false);
  const [msg, setMsg]                 = useState(null);

  // Medical profile
  const [age, setAge]                       = useState('');
  const [smokingHistory, setSmokingHistory] = useState('non_smoker');
  const [occupationExposure, setOccupationExposure] = useState('not_exposed');
  const [savingMedical, setSavingMedical]   = useState(false);
  const [medicalLoaded, setMedicalLoaded]   = useState(false);

  useEffect(() => {
    if (!user?.uid) { setMedicalLoaded(true); return; }
    try {
      const saved = localStorage.getItem(`medical_profile_${user.uid}`);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.age)                setAge(String(d.age));
        if (d.smokingHistory)     setSmokingHistory(d.smokingHistory);
        if (d.occupationExposure) setOccupationExposure(d.occupationExposure);
      }
    } catch {}
    setMedicalLoaded(true);
  }, [user?.uid]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      if (displayName !== user.displayName)
        await updateProfile(user, { displayName });
      if (newEmail !== user.email)
        await updateEmail(user, newEmail);
      showMsg('success', 'Profile updated successfully.');
    } catch (err) {
      showMsg('error', err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign in again to change your email.'
        : 'Failed to update profile.');
    } finally { setSavingInfo(false); }
  };

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { showMsg('error', 'Passwords do not match.'); return; }
    if (newPw.length < 6)   { showMsg('error', 'Password must be at least 6 characters.'); return; }
    setSavingPw(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showMsg('success', 'Password changed successfully.');
    } catch (err) {
      showMsg('error', err.code === 'auth/wrong-password'
        ? 'Current password is incorrect.'
        : 'Failed to change password.');
    } finally { setSavingPw(false); }
  };

  const handleSaveMedical = async () => {
    if (age && (Number(age) < 1 || Number(age) > 120)) {
      showMsg('error', 'Please enter a valid age (1–120).');
      return;
    }
    setSavingMedical(true);
    try {
      const payload = {
        age: age ? Number(age) : null,
        smokingHistory,
        occupationExposure,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`medical_profile_${user.uid}`, JSON.stringify(payload));
      showMsg('success', 'Medical profile saved.');
    } catch {
      showMsg('error', 'Failed to save. Please try again.');
    } finally {
      setSavingMedical(false);
    }
  };

  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

  return (
    <div style={s.page}>
      <div style={s.container}>

        <button onClick={onBack} style={s.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </button>

        <div style={s.pageHeader}>
          <Avatar name={user?.displayName || user?.email} size={64} />
          <div>
            <h1 style={s.pageTitle}>My Profile</h1>
            <p style={s.pageSubtitle}>
              Manage your account information and security settings
            </p>
          </div>
        </div>

        {msg && (
          <div style={{ ...s.msgBox, ...(msg.type === 'success' ? s.msgSuccess : s.msgError) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              {msg.type === 'success'
                ? <polyline points="20 6 9 17 4 12"/>
                : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              }
            </svg>
            {msg.text}
          </div>
        )}

        <div style={s.grid}>

          {/* ── Personal Information ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardHeaderIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#1D4ED8" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div style={s.cardTitle}>Personal Information</div>
                <div style={s.cardSub}>Update your name and email address</div>
              </div>
            </div>
            <div style={s.cardBody}>
              <div style={s.field}>
                <label style={s.label}>Display name</label>
                <input type="text" value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  style={s.input} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email address</label>
                <input type="email" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  style={s.input}
                  disabled={isGoogleUser} />
                {isGoogleUser && (
                  <span style={s.hint}>Email is managed by Google</span>
                )}
              </div>
              <div style={s.field}>
                <label style={s.label}>Account type</label>
                <div style={s.readonlyBox}>
                  {isGoogleUser ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>Google Account</>
                  ) : 'Email / Password'}
                </div>
              </div>
              <button onClick={handleSaveInfo} disabled={savingInfo} style={s.btnPrimary}>
                {savingInfo ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardHeaderIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#1D4ED8" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div style={s.cardTitle}>Change Password</div>
                <div style={s.cardSub}>Requires your current password to confirm</div>
              </div>
            </div>
            <div style={s.cardBody}>
              {isGoogleUser ? (
                <div style={s.googleNote}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#92400E" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Password is managed by Google. Visit your Google account settings to change it.
                </div>
              ) : (
                <>
                  <div style={s.field}>
                    <label style={s.label}>Current password</label>
                    <input type="password" value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      placeholder="Enter current password"
                      style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>New password</label>
                    <input type="password" value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Confirm new password</label>
                    <input type="password" value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      style={{
                        ...s.input,
                        borderColor: confirmPw && confirmPw !== newPw ? '#FECACA' : '#E2E8F0'
                      }} />
                    {confirmPw && confirmPw !== newPw && (
                      <span style={s.hintRed}>Passwords don't match</span>
                    )}
                  </div>
                  <button
                    onClick={handleChangePw}
                    disabled={savingPw || !currentPw || !newPw}
                    style={s.btnPrimary}
                  >
                    {savingPw ? 'Updating...' : 'Update password'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Medical Profile ── */}
          <div style={{ ...s.card, gridColumn: '1 / -1' }}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardHeaderIcon, background: '#F0FDF4' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#16A34A" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <div style={s.cardTitle}>Medical Profile</div>
                <div style={s.cardSub}>
                  This information helps contextualise your scan results — it is stored securely and never shared
                </div>
              </div>
            </div>
            <div style={s.cardBody}>
              {!medicalLoaded ? (
                <div style={{ color: '#94A3B8', fontSize: 13 }}>Loading medical profile…</div>
              ) : (
                <div style={s.medicalGrid}>
                  {/* Age */}
                  <div style={s.field}>
                    <label style={s.label}>Age</label>
                    <input
                      type="number" min="1" max="120"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 45"
                      style={{ ...s.input, maxWidth: 160 }}
                    />
                    <span style={s.hint}>Years (1–120)</span>
                  </div>

                  {/* Smoking history */}
                  <div style={s.field}>
                    <label style={s.label}>Smoking history</label>
                    <div style={s.selectWrap}>
                      <select
                        value={smokingHistory}
                        onChange={e => setSmokingHistory(e.target.value)}
                        style={s.select}
                      >
                        {SMOKING_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <svg style={s.selectArrow} viewBox="0 0 24 24" fill="none"
                        stroke="#64748B" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {/* Occupation / passive smoking exposure */}
                  <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Occupational / passive smoking exposure</label>
                    <div style={s.selectWrap}>
                      <select
                        value={occupationExposure}
                        onChange={e => setOccupationExposure(e.target.value)}
                        style={s.select}
                      >
                        {EXPOSURE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <svg style={s.selectArrow} viewBox="0 0 24 24" fill="none"
                        stroke="#64748B" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    <span style={s.hint}>
                      Are you regularly exposed to second-hand smoke or occupational carcinogens
                      (dust, asbestos, chemical fumes)?
                    </span>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <button
                      onClick={handleSaveMedical}
                      disabled={savingMedical}
                      style={{ ...s.btnPrimary, width: 'auto', padding: '11px 28px' }}
                    >
                      {savingMedical ? 'Saving…' : 'Save medical profile'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Account Actions ── */}
          <div style={{ ...s.card, gridColumn: '1 / -1' }}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardHeaderIcon, background: '#FEF2F2' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#DC2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <div style={s.cardTitle}>Account Actions</div>
                <div style={s.cardSub}>Sign out of your account</div>
              </div>
            </div>
            <div style={s.cardBody}>
              <button onClick={() => auth.signOut()} style={s.btnSignOut}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out of LungDetect AI
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#F0F4F8',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: 900, margin: '0 auto', padding: '28px 24px' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8,
    padding: '8px 14px', fontSize: 12, fontWeight: 500, color: '#475569',
    cursor: 'pointer', marginBottom: 24,
  },
  pageHeader: {
    display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28,
  },
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#1E293B', letterSpacing: -0.5, margin: 0 },
  pageSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  msgBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 8, fontSize: 13,
    marginBottom: 20,
  },
  msgSuccess: { background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' },
  msgError:   { background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  medicalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: {
    background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
  },
  cardHeaderIcon: {
    width: 34, height: 34, background: '#EFF6FF', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1E293B' },
  cardSub:   { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  cardBody:  { padding: 20 },
  field:     { marginBottom: 16 },
  label:     { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 13, color: '#1E293B',
    border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
    background: '#F8FAFC', boxSizing: 'border-box',
  },
  selectWrap: { position: 'relative' },
  select: {
    width: '100%', padding: '10px 36px 10px 12px', fontSize: 13, color: '#1E293B',
    border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
    background: '#F8FAFC', boxSizing: 'border-box',
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    width: 16, height: 16, pointerEvents: 'none',
  },
  hint:    { fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'block' },
  hintRed: { fontSize: 11, color: '#EF4444', marginTop: 4, display: 'block' },
  readonlyBox: {
    padding: '10px 12px', background: '#F1F5F9', borderRadius: 8,
    border: '1px solid #E2E8F0', fontSize: 13, color: '#475569',
    display: 'flex', alignItems: 'center',
  },
  googleNote: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: '#FFFBEB', border: '1px solid #FDE68A',
    borderRadius: 8, padding: '12px', fontSize: 12, color: '#92400E',
  },
  btnPrimary: {
    width: '100%', padding: '11px', background: '#1D4ED8', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', marginTop: 4,
  },
  btnSignOut: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 20px', background: '#fff', color: '#EF4444',
    border: '1px solid #FECACA', borderRadius: 8, fontSize: 13,
    fontWeight: 500, cursor: 'pointer',
  },
};

export default ProfilePage;
