import React, { useState, useCallback } from 'react';

const SLOT_TIMES = ['9:00 AM','9:30 AM','10:00 AM','11:00 AM','11:30 AM',
                    '1:00 PM','2:00 PM','2:30 PM','3:30 PM','4:00 PM','5:00 PM'];

function generateSlots(facilityId) {
  const seed = Math.abs(facilityId % 97);
  const slots = [];
  const today = new Date();
  for (let day = 0; day < 3; day++) {
    const d = new Date(today);
    d.setDate(d.getDate() + day);
    const label = day === 0 ? 'Today' : day === 1 ? 'Tomorrow'
      : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const count = 1 + ((seed + day) % 3);
    for (let s = 0; s < count; s++) {
      slots.push({ day: label, time: SLOT_TIMES[(seed + day * 4 + s) % SLOT_TIMES.length] });
    }
  }
  return slots;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const mapsLink       = (name, lat, lon) => `https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lon},16z`;
const directionsLink = (lat, lon)       => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

function amenityLabel(a) {
  return { hospital: 'Hospital', clinic: 'Clinic', doctors: 'Doctor', health_post: 'Health Post' }[a] || 'Medical';
}

function amenityChip(a) {
  if (a === 'hospital') return { bg: 'rgba(255,59,59,0.1)',  text: '#FF7070', bd: 'rgba(255,59,59,0.2)' };
  if (a === 'clinic')   return { bg: 'rgba(37,99,235,0.1)',  text: '#60A5FA', bd: 'rgba(37,99,235,0.2)' };
  if (a === 'doctors')  return { bg: 'rgba(0,200,150,0.1)',  text: '#00C896', bd: 'rgba(0,200,150,0.2)' };
  return                       { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.4)', bd: 'rgba(255,255,255,0.1)' };
}

async function fetchNearby(lat, lon, radiusKm = 10) {
  const query = `[out:json][timeout:30];(node["amenity"~"hospital|clinic|doctors|health_post"](around:${radiusKm * 1000},${lat},${lon});way["amenity"~"hospital|clinic|doctors|health_post"](around:${radiusKm * 1000},${lat},${lon});relation["amenity"~"hospital|clinic|doctors|health_post"](around:${radiusKm * 1000},${lat},${lon}););out body center;`.trim();
  const res  = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
  if (!res.ok) throw new Error('Overpass API error');
  const data = await res.json();
  return data.elements.map(el => {
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) return null;
    return {
      id: el.id,
      name: el.tags?.name || 'Unnamed Facility',
      amenity: el.tags?.amenity,
      phone: el.tags?.phone || el.tags?.['contact:phone'],
      address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || null,
      lat: elLat, lon: elLon,
      dist: haversineKm(lat, lon, elLat, elLon),
    };
  }).filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, 20);
}

function DistBadge({ km }) {
  const label = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  const color = km < 2 ? '#00C896' : km < 5 ? '#60A5FA' : 'rgba(255,255,255,0.35)';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 8px' }}>
      {label}
    </span>
  );
}

function DoctorCard({ facility, urgent }) {
  const chip  = amenityChip(facility.amenity);
  const slots = generateSlots(facility.id);
  const [sel, setSel] = React.useState(null);

  return (
    <div style={{
      background: '#fff', border: urgent ? '1px solid rgba(255,59,59,0.25)' : '1px solid #E8E6E0',
      borderRadius: 12, padding: '16px 18px',
      boxShadow: urgent ? '0 0 0 3px rgba(255,59,59,0.05)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1117', marginBottom: 6 }}>{facility.name}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, background: chip.bg, color: chip.text, border: `1px solid ${chip.bd}`, borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {amenityLabel(facility.amenity)}
            </span>
            <DistBadge km={facility.dist} />
          </div>
        </div>
      </div>

      {facility.address && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="11" height="11" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>{facility.address}</span>
        </div>
      )}

      {facility.phone && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="11" height="11">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.78-1.78a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <a href={`tel:${facility.phone}`} style={{ fontSize: 11, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>{facility.phone}</a>
        </div>
      )}

      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
          Available slots
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400, marginLeft: 6 }}>(confirm by phone)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {slots.map((slot, i) => (
            <button key={i} onClick={() => setSel(i)} style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none',
              background: sel === i ? '#00C896' : '#F0FDF9',
              color: sel === i ? '#080D1A' : '#059669',
              transition: 'all 0.15s',
            }}>
              {slot.day} · {slot.time}
            </button>
          ))}
        </div>
        {sel !== null && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: '#F0FDF9', border: '1px solid #A7F3D0', borderRadius: 7, fontSize: 11, color: '#065F46', fontWeight: 500 }}>
            ✓ {slots[sel].day} at {slots[sel].time} — call the facility to confirm.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <a href={directionsLink(facility.lat, facility.lon)} target="_blank" rel="noopener noreferrer" style={{
          flex: 1, padding: '8px', background: '#080D1A', color: '#00C896',
          borderRadius: 7, fontSize: 11, fontWeight: 700, textDecoration: 'none',
          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Directions
        </a>
        <a href={mapsLink(facility.name, facility.lat, facility.lon)} target="_blank" rel="noopener noreferrer" style={{
          flex: 1, padding: '8px', background: '#F5F4F0', color: '#6B7280',
          border: '1px solid #E8E6E0', borderRadius: 7, fontSize: 11, fontWeight: 500,
          textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          View on Map
        </a>
      </div>
    </div>
  );
}

function DoctorFinder({ onBack, urgent = false }) {
  const [state,      setState]      = useState('idle');
  const [facilities, setFacilities] = useState([]);
  const [coords,     setCoords]     = useState(null);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [radiusKm,   setRadiusKm]   = useState(10);
  const [filter,     setFilter]     = useState('all');

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setState('error'); return;
    }
    setState('locating');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        setCoords({ lat, lon });
        setState('loading');
        try {
          setFacilities(await fetchNearby(lat, lon, radiusKm));
          setState('done');
        } catch {
          setErrorMsg('Could not fetch nearby facilities. Check your connection.');
          setState('error');
        }
      },
      (err) => {
        const msgs = {
          1: 'Location access denied. Allow location in browser settings.',
          2: 'Location unavailable. Please try again.',
          3: 'Location request timed out.',
        };
        setErrorMsg(msgs[err.code] || 'Failed to get your location.');
        setState('error');
      },
      { timeout: 15000, maximumAge: 60000 }
    );
  }, [radiusKm]);

  const retry = () => { setFacilities([]); setErrorMsg(''); setState('idle'); };

  const filtered = filter === 'all' ? facilities : facilities.filter(f => f.amenity === filter);
  const mapsHref = coords
    ? `https://www.google.com/maps/search/lung+specialist+near+me/@${coords.lat},${coords.lon},13z`
    : 'https://www.google.com/maps/search/pulmonologist+near+me';

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4F0', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E8E6E0',
        padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: '#F5F4F0',
          border: '1px solid #E8E6E0', borderRadius: 8, padding: '7px 12px',
          fontSize: 12, fontWeight: 500, color: '#6B7280', cursor: 'pointer',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1117', letterSpacing: '-0.5px' }}>Find Nearby Doctor</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>Hospitals, clinics &amp; specialists near you</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>

        {/* Urgent banner */}
        {urgent && (
          <div style={{
            background: '#080D1A', border: '1px solid rgba(255,59,59,0.3)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{ width: 38, height: 38, background: 'rgba(255,59,59,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF3B3B" strokeWidth="2.5" width="18" height="18">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FF3B3B', marginBottom: 4 }}>Urgent: Specialist Consultation Recommended</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                Your scan result indicates potential lung cancer. Find and contact a pulmonologist or oncologist as soon as possible.
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E6E0', padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F1117', marginBottom: 14, letterSpacing: '-0.2px' }}>Search Settings</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#A0A09A', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 7 }}>
              Search Radius
            </label>
            <div style={{ position: 'relative' }}>
              <select value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}
                disabled={state === 'loading' || state === 'locating'}
                style={{ width: '100%', padding: '10px 32px 10px 12px', fontSize: 13, border: '1px solid #E8E6E0', borderRadius: 8, background: '#F5F4F0', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#0F1117' }}>
                <option value={3}>3 km — Walking distance</option>
                <option value={5}>5 km — Short drive</option>
                <option value={10}>10 km — City area</option>
                <option value={20}>20 km — Wider region</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="13" height="13">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {(state === 'idle' || state === 'error') && (
            <>
              <button onClick={locate} style={{
                width: '100%', padding: '13px', background: '#00C896', color: '#080D1A',
                border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', letterSpacing: '-0.2px',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                Use My Location to Find Doctors
              </button>

              {state === 'error' && (
                <div style={{
                  marginTop: 12, background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#FF3B3B',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errorMsg}
                </div>
              )}

              <a href={mapsHref} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                marginTop: 10, padding: '10px', background: '#F5F4F0', color: '#6B7280',
                border: '1px solid #E8E6E0', borderRadius: 8, fontSize: 12, fontWeight: 500,
                textDecoration: 'none',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Or search on Google Maps instead
              </a>
            </>
          )}

          {(state === 'locating' || state === 'loading') && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #E8E6E0', borderTopColor: '#00C896', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1117', marginBottom: 4 }}>
                {state === 'locating' ? 'Getting your location…' : `Finding facilities within ${radiusKm} km…`}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                {state === 'locating' ? 'Please allow location access when prompted' : 'Powered by OpenStreetMap'}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {state === 'done' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter</span>
              {[
                { value: 'all',      label: `All (${facilities.length})` },
                { value: 'hospital', label: `Hospitals (${facilities.filter(f => f.amenity === 'hospital').length})` },
                { value: 'clinic',   label: `Clinics (${facilities.filter(f => f.amenity === 'clinic').length})` },
                { value: 'doctors',  label: `Doctors (${facilities.filter(f => f.amenity === 'doctors').length})` },
              ].map(opt => (
                <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
                  padding: '5px 12px', borderRadius: 20, fontFamily: 'inherit',
                  border: `1px solid ${filter === opt.value ? '#00C896' : '#E8E6E0'}`,
                  background: filter === opt.value ? 'rgba(0,200,150,0.08)' : '#fff',
                  color: filter === opt.value ? '#00C896' : '#6B7280',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>
                  {opt.label}
                </button>
              ))}
              <button onClick={retry} style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 7,
                border: '1px solid #E8E6E0', background: '#fff', color: '#9CA3AF',
                fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                New Search
              </button>
            </div>

            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
              Found <strong style={{ color: '#0F1117' }}>{filtered.length}</strong> facilities within <strong style={{ color: '#0F1117' }}>{radiusKm} km</strong> — sorted by distance
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #E8E6E0', borderRadius: 12, padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>No facilities found in this category within {radiusKm} km.</div>
                <div style={{ fontSize: 11, color: '#D1CFC8', marginTop: 4 }}>Try increasing the search radius or use a different filter.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(f => <DoctorCard key={f.id} facility={f} urgent={urgent} />)}
              </div>
            )}

            <a href={mapsHref} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              marginTop: 16, padding: '12px', background: '#fff', border: '1px solid #E8E6E0',
              borderRadius: 10, fontSize: 12, fontWeight: 500, color: '#6B7280', textDecoration: 'none',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View all specialists on Google Maps
            </a>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default DoctorFinder;
