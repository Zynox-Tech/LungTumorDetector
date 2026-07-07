import React, { useState, useRef, useCallback } from 'react';
import { uploadImage } from '../services/api.js';
import { saveScanToHistory } from './profile/ProfileDrawer.jsx';
import Results from './Results.jsx';

const MAX_SIZE_MB  = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="1.8" width="22" height="22">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function ImageUpload({ user, onFindDoctor }) {
  const [file, setFile]         = useState(null);
  const [previewUrl, setPreview] = useState(null);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef                = useRef(null);

  const handleFile = useCallback((f) => {
    setError(null);
    setResults(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError('Unsupported format — use JPEG, PNG, BMP, or TIFF.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1048576) {
      setError(`File exceeds ${MAX_SIZE_MB} MB limit.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await uploadImage(file, user);
      setResults(data);
      saveScanToHistory(data, file.name);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-layout">

      {/* ─── Left: Upload Panel ─── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: 'var(--mint-dim)' }}>
            <UploadIcon />
          </div>
          <div>
            <div className="card-header-title">Upload Scan</div>
            <div className="card-header-sub">Chest X-ray or CT scan · JPEG · PNG · BMP · TIFF · Max 10 MB</div>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Dropzone */}
          <div
            className={`dropzone ${dragging ? 'drag' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.bmp,.tiff"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
            />
            <div className="dropzone-ring"><UploadIcon /></div>
            <div className="dropzone-title">
              {file ? 'Click to replace image' : 'Drop X-ray or CT scan here'}
            </div>
            <div className="dropzone-sub">{file ? file.name : 'or click to browse'}</div>
            <div className="dropzone-types">JPEG · PNG · BMP · TIFF</div>
          </div>

          {/* Scan preview */}
          <div style={{ marginTop: 14 }}>
            <div className="scan-preview">
              <div className="scan-tag">CHEST SCAN</div>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" />
              ) : (
                <div className="scan-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="36" height="36">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Upload to preview</span>
                </div>
              )}
            </div>
          </div>

          {/* File details */}
          {file && (
            <>
              <div className="divider" />
              <div className="file-info">
                {[
                  ['Name', file.name],
                  ['Size', formatBytes(file.size)],
                  ['Type', file.type],
                ].map(([k, v]) => (
                  <div key={k} className="file-info-row">
                    <div className="fi-dot" />
                    <span className="fi-key">{k}</span>
                    <span className="fi-val" title={v}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="divider" />

          {/* Steps */}
          <div className="steps">
            {[
              'Select a chest X-ray or CT scan from your device',
              'AI validates the image is a medical lung scan',
              'ResNet50 analyses for cancer indicators',
            ].map((text, i) => (
              <div key={i} className="step">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{text}</div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleAnalyse} disabled={!file || loading}>
            {loading ? (
              <>
                <div className="spinner" />
                Analysing…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Analyse with AI
              </>
            )}
          </button>

          {file && (
            <button className="btn-ghost" onClick={handleReset}>
              Reset &amp; upload new
            </button>
          )}
        </div>
      </div>

      {/* ─── Right: Results Panel ─── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: 'rgba(0,200,150,0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" width="18" height="18">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="card-header-title">Analysis Results</div>
            <div className="card-header-sub">ResNet50 · 91.35% validated accuracy</div>
          </div>
        </div>

        <div className="card-body">
          {results ? (
            <Results results={results} imagePreviewUrl={previewUrl} user={user} onFindDoctor={onFindDoctor} />
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 42, height: 42,
                  border: '3px solid var(--stone)',
                  borderTopColor: 'var(--mint)',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 5, letterSpacing: '-0.3px' }}>
                Analysing your scan
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                ResNet50 is processing the image…
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '52px 24px', textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--canvas)', border: '1px solid var(--stone)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.5" width="24" height="24">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 5 }}>
                No results yet
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                Upload a chest X-ray or CT scan on the left<br />and click <strong>Analyse with AI</strong>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default ImageUpload;
