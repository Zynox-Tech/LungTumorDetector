import React, { useState } from 'react';
import { generatePDFReport } from '../utils/generatePDF.js';

function Results({ results, imagePreviewUrl, user, onFindDoctor }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!results) return null;

  const {
    prediction, confidence, cancer_probability, risk_level,
    status, medical_advice, original_image, heatmap_image,
    heatmap_error, lung_confidence,
  } = results;

  const safeConf       = confidence         ?? 0;
  const safeCancerProb = cancer_probability ?? 0;
  const confPct        = (safeConf * 100).toFixed(1);
  const isCancerous    = prediction === 'Cancerous';
  const isUncertain    = prediction === 'Uncertain';

  const verdictColor  = isCancerous ? 'var(--red)'   : isUncertain ? '#D97706' : 'var(--mint)';
  const verdictBg     = isCancerous ? 'var(--red-dim)' : isUncertain ? 'rgba(245,158,11,0.1)' : 'var(--mint-dim)';
  const verdictBorder = isCancerous ? 'rgba(255,59,59,0.25)' : isUncertain ? 'rgba(245,158,11,0.25)' : 'var(--mint-border)';

  const riskColor = r =>
    r === 'High'   ? 'var(--red)' : r === 'Moderate' ? '#D97706' :
    r === 'Low'    ? '#2563EB'    : 'var(--mint)';

  const displayRisk = risk_level ?? (
    safeConf >= 0.9 ? 'High' : safeConf >= 0.7 ? 'Moderate' :
    safeConf >= 0.5 ? 'Low'  : 'Very Low'
  );

  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const origSrc = original_image  ? `data:image/png;base64,${original_image}` : imagePreviewUrl;
  const heatSrc = heatmap_image   ? `data:image/png;base64,${heatmap_image}`  : null;

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      await generatePDFReport({
        results,
        patientName:  user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        patientEmail: user?.email || '',
      });
    } catch { window.print(); }
    finally { setPdfLoading(false); }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header row: title + PDF button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Analysis Report
        </div>
        <button className="pdf-btn" onClick={handlePDF} disabled={pdfLoading}>
          {pdfLoading ? (
            <><div className="spinner" style={{ width: 12, height: 12, borderTopColor: 'var(--muted)' }} /> Generating…</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              PDF Report
            </>
          )}
        </button>
      </div>

      {/* ── Scan images ── */}
      <div className="scan-pair">
        <div className="scan-pane">
          <div className="scan-pane-label">ORIGINAL SCAN</div>
          {origSrc ? (
            <img src={origSrc} alt="Chest X-ray" />
          ) : (
            <div className="scan-pane-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="28" height="28">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              No image
            </div>
          )}
          <div className="scan-pane-hint">Uploaded chest X-ray image</div>
        </div>

        <div className="scan-pane">
          <div className="scan-pane-label" style={{ background: heatSrc ? 'rgba(220,38,38,0.7)' : 'rgba(0,0,0,0.5)' }}>
            GRAD-CAM HEATMAP
          </div>
          {heatSrc ? (
            <img src={heatSrc} alt="Grad-CAM heatmap" />
          ) : (
            <div className="scan-pane-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="28" height="28">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {heatmap_error || 'Unavailable'}
            </div>
          )}
          <div className="scan-pane-hint">
            {heatSrc ? 'Blue area represents AI-flagged high-risk regions' : 'Heatmap not generated'}
          </div>
        </div>
      </div>

      {/* ── Verdict box ── */}
      <div className="verdict-box" style={{ background: verdictBg, borderColor: verdictBorder }}>
        <div className="verdict-icon" style={{ background: verdictBorder }}>
          {isCancerous ? (
            <svg viewBox="0 0 24 24" fill="none" stroke={verdictColor} strokeWidth="2.5" width="18" height="18">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) : isUncertain ? (
            <svg viewBox="0 0 24 24" fill="none" stroke={verdictColor} strokeWidth="2.5" width="18" height="18">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke={verdictColor} strokeWidth="2.5" width="18" height="18">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="verdict-label" style={{ color: verdictColor }}>{prediction}</div>
          <div className="verdict-meta">
            Confidence: <strong>{confPct}%</strong>
            &nbsp;·&nbsp;
            <span style={{ color: riskColor(displayRisk), fontWeight: 600 }}>{displayRisk} Risk</span>
            {lung_confidence != null && (
              <>&nbsp;·&nbsp; Lung gate: {lung_confidence.toFixed(1)}%</>
            )}
          </div>
          {isUncertain && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
              Model could not make a confident determination. Please consult a radiologist.
            </div>
          )}
        </div>
      </div>

      {/* ── Urgent doctor CTA (cancerous only) ── */}
      {isCancerous && onFindDoctor && (
        <div className="doctor-cta">
          <div style={{
            width: 38, height: 38, background: 'rgba(255,59,59,0.15)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" width="18" height="18">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 2 }}>
              Specialist consultation recommended
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              Find a pulmonologist or oncologist near you with available slots.
            </div>
          </div>
          <button className="doctor-cta-btn" onClick={onFindDoctor}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Find Doctor
          </button>
        </div>
      )}

      {/* ── Metric grid ── */}
      <div className="metric-grid">
        <div className="metric-tile">
          <div className="metric-tile-label">Prediction</div>
          <div style={{ marginTop: 2 }}>
            <span className="badge" style={{ background: verdictBg, color: verdictColor, border: `1px solid ${verdictBorder}`, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              {prediction}
            </span>
          </div>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-label">Risk Level</div>
          <div className="metric-tile-value" style={{ color: riskColor(displayRisk), fontSize: 16 }}>
            {displayRisk}
          </div>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-label">Cancer Probability</div>
          <div className="metric-tile-value mono">{safeCancerProb.toFixed(2)}%</div>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-label">Status</div>
          <div style={{ marginTop: 2 }}>
            <span className="badge" style={{ background: 'var(--mint-dim)', color: 'var(--mint)', border: '1px solid var(--mint-border)', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              {status ?? 'Complete'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Confidence bar ── */}
      <div className="conf-bar-wrap">
        <div className="conf-bar-head">
          <div className="conf-bar-label">Confidence Score</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: verdictColor, letterSpacing: '-0.3px' }}>{confPct}%</div>
        </div>
        <div className="conf-track">
          <div className="conf-fill" style={{ width: `${confPct}%`, background: verdictColor }} />
        </div>
      </div>

      {/* ── Medical advice ── */}
      <div className="advice-box" style={{
        background: isCancerous ? '#FFFBF0' : 'rgba(0,200,150,0.05)',
        border: `1px solid ${isCancerous ? '#FDE68A' : 'var(--mint-border)'}`,
      }}>
        <div className="advice-title" style={{ color: isCancerous ? '#92400E' : 'var(--mint)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Medical Recommendations
        </div>
        <div className="advice-text" style={{ color: isCancerous ? '#78350F' : 'var(--ink-2)' }}>
          {medical_advice ? (
            <>
              <p style={{ marginBottom: 6 }}>{medical_advice.recommendation}</p>
              <p style={{ fontWeight: 600 }}>Urgency: {medical_advice.urgency}</p>
            </>
          ) : isCancerous ? (
            <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 2 }}>
              <li><strong>Seek immediate consultation</strong> with an oncologist or pulmonologist</li>
              <li>Schedule additional imaging (CT scan, PET scan)</li>
              <li>Consider biopsy for definitive diagnosis</li>
              <li>Discuss treatment options with your healthcare team</li>
            </ul>
          ) : (
            <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 2 }}>
              <li>Continue regular health screenings</li>
              <li>Maintain a healthy lifestyle</li>
              <li>Monitor for any new respiratory symptoms</li>
              <li>Follow-up screening per medical guidelines</li>
            </ul>
          )}
        </div>
      </div>

      {/* ── Tech details ── */}
      <div className="tech-row">
        {[
          ['Model',      'ResNet50 Transfer Learning'],
          ['Input',      '224 × 224 px'],
          ['Generated',  reportDate],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="tech-item-label">{k}</div>
            <div className="tech-item-val">{v}</div>
          </div>
        ))}
      </div>

      {/* ── Disclaimer ── */}
      <div className="disclaimer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          <strong>Important:</strong> This AI tool is a screening aid only and does not replace professional
          medical diagnosis. All results must be reviewed by a qualified healthcare professional before any clinical decision is made.
        </span>
      </div>

    </div>
  );
}

export default Results;
