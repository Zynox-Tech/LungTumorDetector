import React, { useState } from 'react';
import { getScanHistory, clearScanHistory } from './ProfileDrawer';

function ScanHistoryPage({ onBack }) {
  const [history, setHistory] = useState(getScanHistory());
  const [filter, setFilter]   = useState('all'); 

  const handleClear = () => {
    clearScanHistory();
    setHistory([]);
  };

  const filtered = filter === 'all'
    ? history
    : history.filter(h => h.prediction === filter);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const predColor = (p) =>
    p === 'Cancerous' ? '#DC2626' : p === 'Uncertain' ? '#D97706' : '#16A34A';
  const predBg = (p) =>
    p === 'Cancerous' ? '#FEE2E2' : p === 'Uncertain' ? '#FEF3C7' : '#DCFCE7';
  const riskColor = (r) =>
    r === 'High' ? '#DC2626' : r === 'Moderate' ? '#D97706' : r === 'Low' ? '#2563EB' : '#16A34A';

  const counts = {
    all:            history.length,
    Cancerous:      history.filter(h => h.prediction === 'Cancerous').length,
    'Non-Cancerous':history.filter(h => h.prediction === 'Non-Cancerous').length,
    Uncertain:      history.filter(h => h.prediction === 'Uncertain').length,
  };

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
          <div style={s.headerIconWrap}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#1D4ED8" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h1 style={s.pageTitle}>Scan History</h1>
            <p style={s.pageSubtitle}>
              {history.length === 0
                ? 'No scans recorded yet'
                : `${history.length} scan${history.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={handleClear} style={s.clearBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
              Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={s.emptyCard}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="#CBD5E1" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div style={s.emptyTitle}>No scan history yet</div>
            <div style={s.emptySub}>
              Upload and analyse a chest X-ray on the dashboard to see results here.
            </div>
            <button onClick={onBack} style={s.goAnalyseBtn}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div style={s.statsRow}>
              {[
                { label: 'Total Scans',    value: counts.all,             color: '#1D4ED8', bg: '#EFF6FF' },
                { label: 'Cancerous',      value: counts['Cancerous'],     color: '#DC2626', bg: '#FEF2F2' },
                { label: 'Non-Cancerous',  value: counts['Non-Cancerous'], color: '#16A34A', bg: '#F0FDF4' },
                { label: 'Uncertain',      value: counts['Uncertain'],     color: '#D97706', bg: '#FFFBEB' },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.statCard, background: stat.bg }}>
                  <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={s.filterRow}>
              {['all', 'Cancerous', 'Non-Cancerous', 'Uncertain'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...s.filterBtn,
                    ...(filter === f ? s.filterBtnActive : {})
                  }}
                >
                  {f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`}
                </button>
              ))}
            </div>

          
            <div style={s.tableCard}>
              <div style={s.tableHeader}>
                <div style={{ ...s.th, flex: 2 }}>File Name</div>
                <div style={{ ...s.th, flex: 2 }}>Date & Time</div>
                <div style={{ ...s.th, flex: 1 }}>Prediction</div>
                <div style={{ ...s.th, flex: 1 }}>Confidence</div>
                <div style={{ ...s.th, flex: 1 }}>Risk</div>
              </div>

              {filtered.length === 0 ? (
                <div style={s.noResults}>No scans match this filter.</div>
              ) : (
                filtered.map((entry, i) => (
                  <div key={entry.id} style={{
                    ...s.tableRow,
                    background: i % 2 === 0 ? '#fff' : '#F8FAFC',
                  }}>
                    <div style={{ ...s.td, flex: 2 }}>
                      <div style={s.fileIconWrap}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#94A3B8" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <span style={s.fileName}>{entry.fileName}</span>
                    </div>

                    <div style={{ ...s.td, flex: 2, color: '#64748B', fontSize: 12 }}>
                      {formatDate(entry.date)}
                    </div>

                    <div style={{ ...s.td, flex: 1 }}>
                      <span style={{
                        ...s.badge,
                        background: predBg(entry.prediction),
                        color: predColor(entry.prediction),
                      }}>
                        {entry.prediction}
                      </span>
                    </div>

                    <div style={{ ...s.td, flex: 1 }}>
                      <div style={s.confWrap}>
                        <div style={s.confTrack}>
                          <div style={{
                            ...s.confFill,
                            width: `${((entry.confidence || 0) * 100).toFixed(0)}%`,
                            background: predColor(entry.prediction),
                          }} />
                        </div>
                        <span style={s.confText}>
                          {((entry.confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                          
                    <div style={{ ...s.td, flex: 1 }}>
                      <span style={{
                        ...s.riskText,
                        color: riskColor(entry.risk_level),
                      }}>
                        {entry.risk_level || '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#F0F4F8',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8,
    padding: '8px 14px', fontSize: 12, fontWeight: 500, color: '#475569',
    cursor: 'pointer', marginBottom: 24,
  },
  pageHeader: {
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
  },
  headerIconWrap: {
    width: 52, height: 52, background: '#EFF6FF', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#1E293B', letterSpacing: -0.5, margin: 0 },
  pageSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  clearBtn: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1px solid #FECACA', color: '#EF4444',
    borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500,
    cursor: 'pointer',
  },
  emptyCard: {
    background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
    padding: '64px 24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12,
  },
  emptyTitle:   { fontSize: 16, fontWeight: 600, color: '#64748B' },
  emptySub:     { fontSize: 13, color: '#94A3B8', textAlign: 'center', maxWidth: 340 },
  goAnalyseBtn: {
    marginTop: 8, padding: '10px 24px', background: '#1D4ED8', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 },
  statCard: {
    borderRadius: 10, padding: '16px 20px',
    border: '1px solid #E2E8F0',
  },
  statValue: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: 500 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: {
    padding: '7px 16px', background: '#fff', border: '1px solid #E2E8F0',
    borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#64748B',
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8', fontWeight: 600,
  },
  tableCard: {
    background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex', padding: '12px 16px',
    background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
  },
  th: {
    fontSize: 10, fontWeight: 700, color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  tableRow: {
    display: 'flex', alignItems: 'center',
    padding: '13px 16px', borderBottom: '1px solid #F1F5F9',
  },
  td: {
    display: 'flex', alignItems: 'center', fontSize: 13, color: '#1E293B',
    paddingRight: 12,
  },
  fileIconWrap: {
    width: 28, height: 28, background: '#F1F5F9', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginRight: 10, flexShrink: 0,
  },
  fileName: {
    fontSize: 12, fontWeight: 500, color: '#1E293B',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
  },
  badge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
  },
  confWrap:  { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
  confTrack: { flex: 1, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' },
  confFill:  { height: '100%', borderRadius: 99, transition: 'width 0.3s' },
  confText:  { fontSize: 11, fontWeight: 600, color: '#1E293B', flexShrink: 0 },
  riskText:  { fontSize: 12, fontWeight: 600 },
  noResults: { padding: '32px', textAlign: 'center', fontSize: 13, color: '#94A3B8' },
};

export default ScanHistoryPage;