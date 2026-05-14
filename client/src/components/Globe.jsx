import { useRef, useEffect, useState, useCallback } from 'react';
import GlobeGL from 'react-globe.gl';
import * as topojson from 'topojson-client';
import { ME_COUNTRIES_BY_ID, ALERT_COLORS } from '../data/countries';

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const GLOBE_IMG = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const BG_IMG    = '//unpkg.com/three-globe/example/img/night-sky.png';

const NON_ME_COLOR    = 'rgba(10, 20, 45, 0.85)';
const HOVER_COLOR     = 'rgba(200, 220, 255, 0.95)';
const SELECTED_COLOR  = 'rgba(255, 255, 255, 0.98)';
const STROKE_COLOR    = 'rgba(80, 130, 200, 0.25)';
const SIDE_COLOR      = 'rgba(0, 20, 50, 0.4)';

export default function Globe({ onCountrySelect, selectedCountry, arcsData, showArcs }) {
  const globeRef = useRef();
  const [countries, setCountries]   = useState({ features: [] });
  const [hovered, setHovered]       = useState(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Load world topology
  useEffect(() => {
    fetch(TOPO_URL)
      .then(r => r.json())
      .then(topo => {
        const geo = topojson.feature(topo, topo.objects.countries);
        setCountries(geo);
      });
  }, []);

  // Center on Middle East on load
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 28, lng: 43, altitude: 2.2 }, 1500);
    }
  }, [countries.features.length]);

  // Window resize
  useEffect(() => {
    const handler = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const getCapColor = useCallback((feature) => {
    const id = parseInt(feature.id);
    const me = ME_COUNTRIES_BY_ID[id];

    if (!me) return NON_ME_COLOR;
    if (selectedCountry?.numericId === id) return SELECTED_COLOR;
    if (hovered?.id === feature.id)        return HOVER_COLOR;
    return ALERT_COLORS[me.alertLevel] || NON_ME_COLOR;
  }, [hovered, selectedCountry]);

  const handlePolygonClick = useCallback((feature) => {
    const id = parseInt(feature.id);
    const me = ME_COUNTRIES_BY_ID[id];
    if (me) {
      onCountrySelect({ ...me, numericId: id });
      // Fly to country
      globeRef.current?.pointOfView({ lat: me.lat, lng: me.lng, altitude: 1.8 }, 800);
    }
  }, [onCountrySelect]);

  const getLabel = useCallback((feature) => {
    const me = ME_COUNTRIES_BY_ID[parseInt(feature.id)];
    if (!me) return '';
    return `
      <div style="
        background: rgba(5,12,26,0.92);
        border: 1px solid rgba(59,130,246,0.5);
        border-radius: 4px;
        padding: 6px 10px;
        color: #e2e8f0;
        font-family: monospace;
        font-size: 12px;
        pointer-events: none;
      ">
        <div style="font-weight:bold;color:#93c5fd">${me.name}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">Alert: <span style="color:${alertColor(me.alertLevel)}">${me.alertLevel}</span></div>
      </div>
    `;
  }, []);

  return (
    <div className="globe-container">
      <GlobeGL
        ref={globeRef}
        width={dimensions.w}
        height={dimensions.h}

        globeImageUrl={GLOBE_IMG}
        backgroundImageUrl={BG_IMG}
        atmosphereColor="rgba(50, 130, 255, 0.25)"
        atmosphereAltitude={0.12}

        polygonsData={countries.features}
        polygonCapColor={getCapColor}
        polygonSideColor={() => SIDE_COLOR}
        polygonStrokeColor={() => STROKE_COLOR}
        polygonAltitude={d => {
          const id = parseInt(d.id);
          const me = ME_COUNTRIES_BY_ID[id];
          if (!me) return 0.001;
          if (selectedCountry?.numericId === id) return 0.05;
          if (hovered?.id === d.id)              return 0.04;
          return 0.008;
        }}
        polygonLabel={getLabel}
        onPolygonClick={handlePolygonClick}
        onPolygonHover={setHovered}

        arcsData={showArcs ? arcsData : []}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.15}
        arcDashAnimateTime={2500}
        arcStroke={1.2}
        arcAltitudeAutoScale={0.4}
        arcLabel={d => `
          <div style="
            background: rgba(5,12,26,0.9);
            border: 1px solid rgba(239,68,68,0.5);
            border-radius:4px; padding:5px 8px;
            color:#fca5a5; font-family:monospace; font-size:11px;
          ">
            <div style="font-weight:bold">${d.label}</div>
            <div style="color:#94a3b8;font-size:10px">${d.fromName} ↔ ${d.toName}</div>
          </div>
        `}
      />

      {/* Legend */}
      <div className="globe-legend">
        <div className="legend-title">ALERT LEVEL</div>
        {[
          { level: 'CRITICAL', color: '#b91c1c' },
          { level: 'HIGH',     color: '#dc2626' },
          { level: 'MEDIUM',   color: '#ea580c' },
          { level: 'LOW',      color: '#16a34a' },
        ].map(({ level, color }) => (
          <div key={level} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{level}</span>
          </div>
        ))}
        {showArcs && (
          <>
            <div className="legend-divider" />
            <div className="legend-title">ARCS</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /><span>War/Conflict</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /><span>Proxy/Support</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#a855f7' }} /><span>Influence</span></div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} /><span>Diplomatic</span></div>
          </>
        )}
      </div>
    </div>
  );
}

function alertColor(level) {
  return { CRITICAL: '#fca5a5', HIGH: '#fdba74', MEDIUM: '#fcd34d', LOW: '#86efac' }[level] || '#94a3b8';
}
