import React, { useState, useEffect } from 'react';

/* ─── Concrete color palette — no rgba for text ──────────── */
const NAVY    = '#080D1A';
const NAVY2   = '#0D1426';
const MINT    = '#00D4A8';
const INK     = '#0A0C14';
const WHITE   = '#FAFAFA';
const STONE   = '#F4F2EE';

/* Dark-bg text scale */
const T1 = '#FAFAFA';      /* primary: headlines */
const T2 = '#B8C4D4';      /* secondary: body text */
const T3 = '#7A8BA0';      /* tertiary: captions, labels */
const T4 = '#4A5568';      /* disabled / decorative */

/* Light-bg text scale */
const L1 = '#0A0C14';      /* primary */
const L2 = '#3D4560';      /* body */
const L3 = '#6B7280';      /* captions */

/* ─── Scan Terminal ──────────────────────────────────────── */
function ScanTerminal() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = setTimeout(() => setPhase(3), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const bars = [0.8, 0.5, 0.9, 0.3, 0.7, 0.6, 0.85, 0.4, 0.75, 0.55];

  return (
    <div style={{
      background: NAVY2,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 4,
      overflow: 'hidden',
      fontFamily: "'SF Mono','Cascadia Code','Fira Code',monospace",
      width: '100%',
      maxWidth: 420,
    }}>
      {/* Chrome bar */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{ fontSize: 10, color: T3, letterSpacing: '0.3px' }}>
          ldc_analysis — patient_scan_001.dcm
        </span>
      </div>

      {/* X-ray view */}
      <div style={{
        background: '#000', height: 160,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 260 150" width="260" height="150" style={{ opacity: 0.55 }}>
          <line x1="130" y1="10" x2="130" y2="140" stroke="#888" strokeWidth="4"/>
          <path d="M130 30 Q100 20 70 35" stroke="#999" strokeWidth="2" fill="none"/>
          <path d="M130 30 Q160 20 190 35" stroke="#999" strokeWidth="2" fill="none"/>
          {[40,55,70,85,100,115].map((y,i) => (
            <g key={i}>
              <path d={`M130 ${y} Q100 ${y+6} 65 ${y+14}`} stroke="#777" strokeWidth="1.5" fill="none" opacity={1-i*0.06}/>
              <path d={`M130 ${y} Q160 ${y+6} 195 ${y+14}`} stroke="#777" strokeWidth="1.5" fill="none" opacity={1-i*0.06}/>
            </g>
          ))}
          <ellipse cx="95" cy="80" rx="38" ry="52" stroke="#555" strokeWidth="1.5" fill="rgba(255,255,255,0.03)"/>
          <ellipse cx="165" cy="80" rx="38" ry="52" stroke="#555" strokeWidth="1.5" fill="rgba(255,255,255,0.03)"/>
          <path d="M115 75 Q112 65 122 65 Q130 65 130 73 Q130 65 138 65 Q148 65 145 75 L130 92 Z"
            fill="rgba(200,50,50,0.35)" stroke="rgba(200,80,80,0.6)" strokeWidth="1"/>
        </svg>
        {phase === 3 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70px 60px at 55% 50%, rgba(0,212,168,0.15) 0%, transparent 100%)',
            animation: 'fadeIn 0.8s ease',
          }}/>
        )}
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, color: T3, letterSpacing: '1px' }}>PA · 120kV</div>
        <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, color: T3, letterSpacing: '1px' }}>2024.11.14</div>
      </div>

      {/* Metrics */}
      <div style={{ padding: '14px 16px' }}>
        {/* Status + progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: MINT, letterSpacing: '1px', fontWeight: 700 }}>
              {phase === 0 ? 'IDLE' : phase === 1 ? 'VALIDATING IMAGE' : phase === 2 ? 'RUNNING RESNET50' : 'ANALYSIS COMPLETE'}
            </span>
            <span style={{ fontSize: 9, color: T3, fontWeight: 600 }}>
              {['0%','23%','71%','100%'][phase]}
            </span>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: phase === 3 ? MINT : 'rgba(0,212,168,0.7)',
              width: ['0%','23%','71%','100%'][phase],
              transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
            }}/>
          </div>
        </div>

        {/* Frequency bars */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28, marginBottom: 12 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 1,
              background: phase >= 2 ? `rgba(0,212,168,${0.2 + h * 0.6})` : 'rgba(255,255,255,0.08)',
              height: `${h * 100}%`,
              transition: `height 0.4s ease ${i*0.04}s, background 0.3s ease`,
            }}/>
          ))}
        </div>

        {/* Result rows */}
        {[
          { k: 'PREDICTION', v: phase >= 3 ? 'NON-CANCEROUS' : '···', c: phase >= 3 ? MINT    : T4 },
          { k: 'CONFIDENCE', v: phase >= 3 ? '96.2%'         : '···', c: phase >= 3 ? T1      : T4 },
          { k: 'RISK LEVEL', v: phase >= 3 ? 'VERY LOW'      : '···', c: phase >= 3 ? MINT    : T4 },
          { k: 'LUNG GATE',  v: phase >= 1 ? 'PASSED ✓'     : '···', c: phase >= 1 ? '#7A8BA0': T4 },
        ].map(({ k, v, c }) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 9, color: T3, letterSpacing: '0.8px', fontWeight: 500 }}>{k}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: c, letterSpacing: '0.5px' }}>{v}</span>
          </div>
        ))}

        {phase === 3 && (
          <div style={{
            marginTop: 10, padding: '7px 10px',
            background: 'rgba(0,212,168,0.1)',
            border: '1px solid rgba(0,212,168,0.25)',
            borderRadius: 3, fontSize: 9, color: MINT,
            letterSpacing: '0.5px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
            animation: 'fadeIn 0.5s ease',
          }}>
            <div style={{ width: 5, height: 5, background: MINT, borderRadius: '50%' }}/>
            GRAD-CAM HEATMAP GENERATED · 224×224 px
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ onLogin, onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center',
      padding: '0 52px', height: 60,
      background: scrolled ? 'rgba(8,13,26,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'background 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={MINT} strokeWidth="2.5" width="18" height="18">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:800, color:WHITE, letterSpacing:'-0.3px' }}>
          LUNGDETECT<span style={{ color: MINT }}>·AI</span>
        </span>
      </div>

      <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
        <button onClick={onLogin} style={{
          fontFamily:"'Inter',sans-serif",
          padding:'6px 16px', background:'none',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:3, color: T2,
          fontSize:12, fontWeight:500, cursor:'pointer',
        }}>
          Sign in
        </button>
        <button onClick={onGetStarted} style={{
          fontFamily:"'Inter',sans-serif",
          padding:'6px 18px', background:MINT, color:NAVY,
          border:'none', borderRadius:3, fontSize:12, fontWeight:800, cursor:'pointer',
        }}>
          Get started →
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero({ onGetStarted, onLogin }) {
  return (
    <section style={{
      minHeight:'100vh', background:NAVY,
      display:'grid', gridTemplateColumns:'1fr 1fr',
      alignItems:'center', padding:'100px 52px 60px',
      gap:80, position:'relative', overflow:'hidden',
    }}>
      {/* Grid texture */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize:'52px 52px',
      }}/>

      {/* Left: Typography */}
      <div style={{ position:'relative' }}>
        {/* Eyebrow label */}
        <div style={{
          fontFamily:"'SF Mono',monospace",
          fontSize:10, fontWeight:700,
          color: MINT, letterSpacing:'3px', textTransform:'uppercase',
          marginBottom:28,
          display:'flex', alignItems:'center', gap:10,
        }}>
          <div style={{ width:24, height:1, background:MINT }}/>
          Clinical-grade AI · ResNet50
        </div>

        {/* Stacked headline */}
        <div style={{ marginBottom:28, lineHeight:1 }}>
          {/* Outlined ghost line */}
          <div style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:'clamp(52px,6.5vw,90px)', fontWeight:900,
            letterSpacing:'-4px', color:'transparent',
            WebkitTextStroke:'1.5px #2E3D55',   /* visible but recessive */
            display:'block', lineHeight:0.95, userSelect:'none',
          }}>
            CHEST
          </div>
          {/* Solid white */}
          <div style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:'clamp(52px,6.5vw,90px)', fontWeight:900,
            letterSpacing:'-4px', color: WHITE,
            display:'block', lineHeight:0.95,
          }}>
            LUNG SCAN
          </div>
          {/* Mint accent */}
          <div style={{
            fontFamily:"'Inter',sans-serif",
            fontSize:'clamp(52px,6.5vw,90px)', fontWeight:900,
            letterSpacing:'-4px', color: MINT,
            display:'block', lineHeight:0.95,
          }}>
            ANALYSIS.
          </div>
        </div>

        {/* Body — T2 for readability, weight 400 */}
        <p style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:15, fontWeight:400, color: T2,
          lineHeight:1.85, maxWidth:360, marginBottom:36,
        }}>
          Upload a chest X-ray or CT scan. A two-stage AI pipeline validates the image
          and runs ResNet50 to detect lung cancer with Grad-CAM heatmap visualization.
        </p>

        {/* CTAs */}
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <button onClick={onGetStarted} style={{
            fontFamily:"'Inter',sans-serif",
            padding:'13px 28px', background:MINT, color:NAVY,
            border:'none', borderRadius:3, fontSize:13, fontWeight:800, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8,
          }}>
            Start Screening
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button onClick={onLogin} style={{
            fontFamily:"'Inter',sans-serif",
            padding:'13px 20px', background:'none',
            border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:3, color: T2,
            fontSize:13, fontWeight:500, cursor:'pointer',
          }}>
            Sign in
          </button>
        </div>

        {/* Metrics strip */}
        <div style={{
          display:'flex', gap:36, marginTop:48,
          paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            { v:'91.35%', l:'Accuracy' },
            { v:'< 5s',   l:'Analysis time' },
            { v:'2-stage',l:'AI pipeline' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:20, fontWeight:800, color:WHITE, letterSpacing:'-0.8px' }}>{v}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color:T3, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: terminal */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <ScanTerminal/>
      </div>
    </section>
  );
}

/* ─── Ticker ─────────────────────────────────────────────── */
function Ticker() {
  const text = ['RESNET50','GRAD-CAM','91.35% ACCURACY','X-RAYS & CT SCANS','DOCTOR FINDER','PDF REPORTS','SCAN HISTORY','TWO-STAGE PIPELINE','FREE · NO API KEY'].join('   ·   ') + '   ·   ';
  return (
    <div style={{ background:MINT, overflow:'hidden', padding:'10px 0' }}>
      <div style={{ display:'flex', whiteSpace:'nowrap', animation:'ticker 22s linear infinite' }}>
        {[0,1].map(n => (
          <span key={n} style={{
            fontFamily:"'SF Mono',monospace",
            fontSize:10, fontWeight:700, color:NAVY,
            letterSpacing:'2px', textTransform:'uppercase', paddingRight:60,
          }}>{text}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Process ────────────────────────────────────────────── */
function Process() {
  const steps = [
    {
      n:'01', title:'Upload', sub:'Drop a chest X-ray or CT scan',
      body:"JPEG, PNG, BMP, or TIFF. The lung gate classifier immediately checks that the image is actually a chest X-ray or lung CT scan — preventing false results from unrelated photos.",
    },
    {
      n:'02', title:'Analyse', sub:'ResNet50 inference',
      body:'The cancer detection model runs in under 5 seconds. Grad-CAM generates a heatmap showing which lung regions drove the prediction.',
    },
    {
      n:'03', title:'Act', sub:'Report + specialist',
      body:'Download a full PDF medical report. If the result is cancerous, the doctor finder uses GPS to find nearby hospitals and specialists with available appointment slots.',
    },
  ];

  return (
    <section style={{ background:STONE, padding:'120px 52px' }}>
      {/* Label */}
      <div style={{
        fontFamily:"'SF Mono',monospace",
        fontSize:10, fontWeight:600,
        color: L3, letterSpacing:'3px', textTransform:'uppercase',
        marginBottom:80,
        display:'flex', alignItems:'center', gap:16,
      }}>
        <div style={{ width:32, height:1, background:L3 }}/>
        How it works
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:48 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{
            paddingRight: i < 2 ? 40 : 0,
            borderRight: i < 2 ? '1px solid #D8D5CE' : 'none',
          }}>
            {/* Big number — decorative only, OK to be subtle */}
            <div style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:80, fontWeight:900, color:'#C8C5B9',
              letterSpacing:'-4px', lineHeight:1,
              marginBottom:20, userSelect:'none',
            }}>{s.n}</div>

            <div style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:26, fontWeight:900, color:L1,
              letterSpacing:'-1px', lineHeight:1, marginBottom:8,
            }}>{s.title}</div>

            <div style={{
              fontFamily:"'SF Mono',monospace",
              fontSize:10, fontWeight:700,
              color: '#059669', letterSpacing:'1.5px',
              textTransform:'uppercase', marginBottom:16,
            }}>{s.sub}</div>

            <p style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:14, fontWeight:400,
              color: L2, lineHeight:1.8, margin:0,
            }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Features — alternating rows ───────────────────────── */
function Features() {
  const rows = [
    {
      n:'F.01', tag:'Explainable AI',
      title:'Grad-CAM Heatmap Overlay',
      body:'Not just a prediction — a visual explanation. The AI overlays a heatmap on your scan showing exactly which lung regions drove the cancer classification. Blue zones indicate AI-flagged high-risk regions.',
      icon:(
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0,212,168,0.2)" strokeWidth="1"/>
          <circle cx="40" cy="40" r="24" fill="rgba(0,212,168,0.1)" stroke="rgba(0,212,168,0.4)" strokeWidth="1"/>
          <circle cx="40" cy="40" r="12" fill="rgba(0,212,168,0.2)" stroke={MINT} strokeWidth="1.5"/>
          <circle cx="40" cy="40" r="3" fill={MINT}/>
          {[0,90,180,270].map(deg => {
            const r = Math.PI * deg / 180;
            return <line key={deg} x1={40+Math.cos(r)*16} y1={40+Math.sin(r)*16} x2={40+Math.cos(r)*30} y2={40+Math.sin(r)*30} stroke={MINT} strokeWidth="1.5" opacity="0.5"/>;
          })}
        </svg>
      ),
    },
    {
      n:'F.02', tag:'Reliability',
      title:'Two-Stage Validation Pipeline',
      body:'Before cancer analysis runs, a lung gate classifier verifies the image is a chest X-ray or lung CT scan. This prevents meaningless results from unrelated photos and ensures every output is medically relevant.',
      icon:(
        <svg viewBox="0 0 80 80" width="80" height="80">
          <rect x="6" y="22" width="28" height="16" rx="2" fill="none" stroke={T3} strokeWidth="1.5"/>
          <rect x="46" y="22" width="28" height="16" rx="2" fill="none" stroke={T3} strokeWidth="1.5"/>
          <line x1="34" y1="30" x2="46" y2="30" stroke={T3} strokeWidth="1.5"/>
          <polyline points="42,26 46,30 42,34" fill="none" stroke={T3} strokeWidth="1.5"/>
          <text x="9" y="34" fontSize="7" fill={T2} fontFamily="monospace">GATE</text>
          <text x="49" y="34" fontSize="7" fill={T2} fontFamily="monospace">MODEL</text>
          <rect x="22" y="48" width="36" height="14" rx="2" fill="rgba(255,255,255,0.06)"/>
          <text x="27" y="59" fontSize="8" fill={T2} fontFamily="monospace">RESULT</text>
        </svg>
      ),
    },
    {
      n:'F.03', tag:'Free · No API key',
      title:'Doctor Finder with Live Slots',
      body:'When a scan returns cancerous, the system geolocates you using the browser GPS and queries OpenStreetMap via the free Overpass API. Nearby hospitals and specialists appear sorted by walking distance.',
      icon:(
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="38" r="28" fill="none" stroke="rgba(0,212,168,0.25)" strokeWidth="1" strokeDasharray="4 4"/>
          <circle cx="40" cy="38" r="16" fill="none" stroke="rgba(0,212,168,0.4)" strokeWidth="1"/>
          <circle cx="40" cy="38" r="5" fill={MINT}/>
          {[[24,30],[56,44],[30,54]].map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.5" fill={T4}/>
              <line x1="40" y1="33" x2={cx} y2={cy} stroke={T4} strokeWidth="1"/>
            </g>
          ))}
        </svg>
      ),
    },
  ];

  return (
    <section style={{ background:NAVY }}>
      <div style={{
        padding:'80px 52px 0',
        fontFamily:"'SF Mono',monospace",
        fontSize:10, color: T3, letterSpacing:'3px',
        textTransform:'uppercase',
        display:'flex', alignItems:'center', gap:16,
      }}>
        <div style={{ width:32, height:1, background:T4 }}/>
        Core features
      </div>

      {rows.map((row, i) => (
        <div key={row.n} style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          padding:'64px 52px',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          gap:80, alignItems:'center',
        }}>
          <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
            <div style={{
              fontFamily:"'SF Mono',monospace",
              fontSize:9, fontWeight:700,
              color: MINT, letterSpacing:'2px', textTransform:'uppercase',
              marginBottom:12,
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ color: T4 }}>{row.n}</span>
              <span style={{ color: T4 }}> · </span>
              {row.tag}
            </div>

            <h3 style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:28, fontWeight:900, color:WHITE,
              letterSpacing:'-1px', lineHeight:1.1,
              margin:'0 0 18px',
            }}>{row.title}</h3>

            <p style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:14, fontWeight:400,
              color: T2,          /* B8C4D4 — readable on dark */
              lineHeight:1.85, margin:0, maxWidth:420,
            }}>{row.body}</p>
          </div>

          <div style={{
            order: i % 2 === 0 ? 1 : 0,
            display:'flex',
            justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              width:180, height:180,
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:4,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {row.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────── */
function CTA({ onGetStarted }) {
  return (
    <section style={{
      background: MINT, padding:'100px 52px',
      display:'grid', gridTemplateColumns:'1fr 1fr',
      gap:80, alignItems:'center',
    }}>
      <div>
        <div style={{
          fontFamily:"'SF Mono',monospace",
          fontSize:10, fontWeight:700,
          color:'rgba(0,0,0,0.45)', letterSpacing:'2.5px',
          textTransform:'uppercase', marginBottom:24,
        }}>
          Free screening · No credit card
        </div>
        <h2 style={{
          fontFamily:"'Inter',sans-serif",
          fontSize:'clamp(36px,5vw,60px)', fontWeight:900,
          color: INK, letterSpacing:'-2.5px', lineHeight:1,
          margin:'0 0 28px',
        }}>
          Start your<br/>first scan<br/>today.
        </h2>
        <button onClick={onGetStarted} style={{
          fontFamily:"'Inter',sans-serif",
          padding:'14px 32px', background:INK, color:MINT,
          border:'none', borderRadius:3, fontSize:14, fontWeight:800,
          cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
        }}>
          Create Free Account →
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { v:'91.35%', l:'Validated accuracy' },
          { v:'< 5s',   l:'Per analysis' },
          { v:'Free',   l:'Doctor finder' },
          { v:'PDF',    l:'Medical reports' },
        ].map(({ v, l }) => (
          <div key={l} style={{ background:'rgba(0,0,0,0.1)', borderRadius:3, padding:'20px' }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:28, fontWeight:900, color:INK, letterSpacing:'-1px', marginBottom:4 }}>{v}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color:'rgba(0,0,0,0.5)' }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      background:'#050812', padding:'32px 52px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      flexWrap:'wrap', gap:20, borderTop:'1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={MINT} strokeWidth="2.5" width="14" height="14">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, color:T3 }}>
          LUNGDETECT · AI
        </span>
      </div>

      <div style={{
        fontFamily:"'Inter',sans-serif",
        fontSize:11, color: T3,          /* #7A8BA0 — visible */
        maxWidth:480, textAlign:'center', lineHeight:1.7,
      }}>
        Screening aid only — not a medical device. All results require review by a qualified healthcare professional.
      </div>

      <div style={{ fontFamily:"'SF Mono',monospace", fontSize:10, color: T4 }}>
        © 2026
      </div>
    </footer>
  );
}

/* ─── Root ───────────────────────────────────────────────── */
function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div style={{ margin:0, padding:0, background:NAVY }}>
      <Navbar onLogin={onLogin} onGetStarted={onGetStarted}/>
      <Hero onGetStarted={onGetStarted} onLogin={onLogin}/>
      <Ticker/>
      <Process/>
      <Features/>
      <CTA onGetStarted={onGetStarted}/>
      <Footer/>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { margin:0; padding:0; }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(4px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 680px) {
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
