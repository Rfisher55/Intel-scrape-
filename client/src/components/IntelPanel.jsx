import { useState, useEffect } from 'react';
import axios from 'axios';
import { ALERT_BADGE_COLORS } from '../data/countries';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function IntelPanel({ country, onClose, onConnectToggle, connectActive }) {
  const [intel, setIntel]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState('summary');

  useEffect(() => {
    if (!country) return;
    setLoading(true);
    setError(null);
    setIntel(null);
    setTab('summary');

    axios.get(`/api/intel/${country.iso}`)
      .then(res => setIntel(res.data))
      .catch(() => setError('Failed to load intel. Backend may not be running.'))
      .finally(() => setLoading(false));
  }, [country?.iso]);

  if (!country) return null;

  const badge = ALERT_BADGE_COLORS[intel?.alertLevel] || ALERT_BADGE_COLORS.LOW;

  return (
    <div className="intel-panel">
      {/* Panel header */}
      <div className="panel-header">
        <div className="panel-title-row">
          <div>
            <h2 className="panel-country-name">{country.name}</h2>
            <p className="panel-capital">Capital: {country.capital}</p>
          </div>
          <div className="panel-header-controls">
            {intel && (
              <span
                className="alert-badge"
                style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
              >
                {intel.alertLevel}
              </span>
            )}
            <button className="panel-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Connect button */}
        <button
          className={`connect-btn ${connectActive ? 'connect-btn--active' : ''}`}
          onClick={onConnectToggle}
        >
          <span className="connect-btn-icon">{connectActive ? '◉' : '◎'}</span>
          {connectActive ? 'HIDE CONNECTIONS' : 'CONNECT — Show Relationships'}
        </button>
      </div>

      {/* Tabs */}
      <div className="panel-tabs">
        {['summary', 'threats', 'news', 'conflicts'].map(t => (
          <button
            key={t}
            className={`panel-tab ${tab === t ? 'panel-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="panel-content">
        {loading && (
          <div className="panel-loading">
            <div className="spinner" />
            <span>Fetching live intel…</span>
          </div>
        )}
        {error && <div className="panel-error">{error}</div>}

        {intel && !loading && (
          <>
            {tab === 'summary' && (
              <div className="panel-section">
                <div className="section-label">SITUATION ASSESSMENT</div>
                <p className="summary-text">{intel.summary}</p>
                <div className="section-label" style={{ marginTop: 20 }}>KEY ACTORS</div>
                <div className="actors-list">
                  {intel.keyActors?.map((a, i) => (
                    <span key={i} className="actor-chip">{a}</span>
                  ))}
                </div>
                {intel.economicIndicator && (
                  <>
                    <div className="section-label" style={{ marginTop: 20 }}>ECONOMIC INDICATOR</div>
                    <p className="econ-text">{intel.economicIndicator}</p>
                  </>
                )}
              </div>
            )}

            {tab === 'threats' && (
              <div className="panel-section">
                <div className="section-label">ACTIVE THREAT VECTORS</div>
                {intel.threats?.length > 0 ? intel.threats.map((t, i) => (
                  <div key={i} className="threat-item">
                    <div className="threat-header">
                      <span className="threat-type">{t.type.toUpperCase()}</span>
                      <span
                        className="threat-severity"
                        style={{ color: SEVERITY_COLORS[t.severity] || '#94a3b8' }}
                      >
                        ● {t.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="threat-desc">{t.description}</p>
                  </div>
                )) : <p className="no-data">No active threats recorded.</p>}
              </div>
            )}

            {tab === 'news' && (
              <div className="panel-section">
                <div className="section-label">LIVE INTELLIGENCE FEED</div>
                {intel.liveNews?.length > 0 ? intel.liveNews.map((item, i) => (
                  <div key={i} className="news-item">
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-time">{timeAgo(item.published)}</span>
                    </div>
                    {item.url && item.url.startsWith('http') ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-title">
                        {item.title}
                      </a>
                    ) : (
                      <p className="news-title news-title--plain">{item.title}</p>
                    )}
                    {item.summary && <p className="news-summary">{item.summary}</p>}
                  </div>
                )) : <p className="no-data">No live news available. Configure NEWS_API_KEY for live feed.</p>}
              </div>
            )}

            {tab === 'conflicts' && (
              <div className="panel-section">
                <div className="section-label">CONFLICT RELATIONSHIPS</div>
                {intel.conflicts?.length > 0 ? intel.conflicts.map((c, i) => (
                  <div key={i} className="conflict-item">
                    <div className="conflict-header">
                      <span className="conflict-countries">{c.fromName} → {c.toName}</span>
                      <span className={`conflict-severity conflict-severity--${c.severity}`}>
                        {c.severity?.toUpperCase()}
                      </span>
                    </div>
                    <div className="conflict-meta">
                      <span className="conflict-type-badge">{c.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="conflict-label">{c.label}</span>
                    </div>
                  </div>
                )) : <p className="no-data">No active conflicts recorded for this country.</p>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="panel-footer">
        <span>Last updated: {intel ? new Date(intel.lastUpdated).toLocaleTimeString() : '—'}</span>
        <span>SOURCE: Intel Base v1.0 + Live Feeds</span>
      </div>
    </div>
  );
}
