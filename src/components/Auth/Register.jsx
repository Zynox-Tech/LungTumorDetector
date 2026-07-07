import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email':        'Invalid email address.',
  'auth/weak-password':        'Password is too weak (min. 6 characters).',
};

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.2" width="16" height="16">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function pwStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6)  return { label: 'Too short', color: '#FF3B3B', w: '20%' };
  if (pw.length < 8)  return { label: 'Weak',      color: '#F59E0B', w: '45%' };
  if (pw.match(/[A-Z]/) && pw.match(/[0-9]/))
                      return { label: 'Strong',    color: '#00C896', w: '100%' };
  return               { label: 'Fair',       color: '#2563EB', w: '70%' };
}

const inputSt = {
  width: '100%', padding: '11px 14px', fontSize: 13, color: '#FAFAFA',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const labelSt = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px',
  textTransform: 'uppercase', marginBottom: 8,
};

function Register({ onSwitchToLogin, onBack }) {
  const [form,    setForm]    = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const ch = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)  { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)        { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: `${form.firstName} ${form.lastName}`.trim() });
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const googleSignIn = async () => {
    setError(''); setLoading(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) { setError(AUTH_ERRORS[err.code] || 'Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  const st = pwStrength(form.password);

  const focusMint  = e => { e.target.style.borderColor = 'var(--mint)'; };
  const blurNormal = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: 380, background: 'var(--navy-2)',
        display: 'flex', flexDirection: 'column', padding: '48px 40px',
        borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative',
      }}>
        {onBack && (
          <button onClick={onBack} style={{
            position: 'absolute', top: 28, left: 28,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 500,
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        )}

        <div style={{ marginTop: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 32, height: 32, background: 'var(--mint)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PulseIcon />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.2px' }}>LungDetect</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--mint)', letterSpacing: '1px', textTransform: 'uppercase' }}>AI SCREENING</div>
            </div>
          </div>

          <div style={{ fontSize: 26, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 12 }}>
            Start your<br />free account
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
            AI-powered lung cancer screening — get instant results from chest X-rays.
          </div>
        </div>

        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['91.35%', 'Validated detection accuracy'],
            ['Instant', 'Grad-CAM heatmap analysis'],
            ['Free',   'Doctor finder with location'],
          ].map(([val, desc]) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 6, height: 6, background: 'var(--mint)', borderRadius: '50%', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{val}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.15)', lineHeight: 1.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" width="12" height="12">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>Encrypted · HIPAA compliant</span>
          </div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ fontSize: 22, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Create account
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>
            Fill in your details to get started
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,59,59,0.25)',
              borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelSt}>First name</label>
                <input name="firstName" type="text" placeholder="Ali" value={form.firstName}
                  onChange={ch} required style={inputSt} onFocus={focusMint} onBlur={blurNormal} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelSt}>Last name</label>
                <input name="lastName" type="text" placeholder="Khan" value={form.lastName}
                  onChange={ch} required style={inputSt} onFocus={focusMint} onBlur={blurNormal} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email}
                onChange={ch} required style={inputSt} onFocus={focusMint} onBlur={blurNormal} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>Password</label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={ch} required style={{ ...inputSt, paddingRight: 44 }}
                  onFocus={focusMint} onBlur={blurNormal} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.3)',
                }}>
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {st && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: st.w, background: st.color, borderRadius: 99, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 10, color: st.color, marginTop: 4, display: 'block', fontWeight: 600 }}>{st.label}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelSt}>Confirm Password</label>
              <input name="confirm" type="password" placeholder="Repeat your password" value={form.confirm}
                onChange={ch} required style={{
                  ...inputSt,
                  borderColor: form.confirm && form.confirm !== form.password ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.1)',
                }} onFocus={focusMint} onBlur={blurNormal} />
              {form.confirm && form.confirm !== form.password && (
                <span style={{ fontSize: 10, color: 'var(--red)', marginTop: 5, display: 'block', fontWeight: 600 }}>
                  Passwords don't match
                </span>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: 'var(--mint)', color: 'var(--navy)',
              border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit', letterSpacing: '-0.2px',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(8,13,26,0.2)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <button onClick={googleSignIn} disabled={loading} style={{
            width: '100%', padding: '11px', background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 9, fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'inherit',
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 22 }}>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 12, fontWeight: 600, color: 'var(--mint)', fontFamily: 'inherit',
            }}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Register;
