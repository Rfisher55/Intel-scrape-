export default function Header({ selectedCountry, onClearSelection }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <span className="header-logo-icon">◎</span>
          <span className="header-logo-text">INTEL GLOBE</span>
        </div>
        <span className="header-region">Middle East Theatre</span>
      </div>

      <div className="header-center">
        {selectedCountry ? (
          <div className="header-selected">
            <span className="header-selected-label">VIEWING:</span>
            <span className="header-selected-name">{selectedCountry.name}</span>
            <button className="header-clear-btn" onClick={onClearSelection}>✕</button>
          </div>
        ) : (
          <span className="header-instruction">Click any highlighted country for Intel Report</span>
        )}
      </div>

      <div className="header-right">
        <span className="header-live">
          <span className="header-live-dot" />
          LIVE FEED
        </span>
        <span className="header-time">{new Date().toUTCString().slice(0, 25)} UTC</span>
      </div>
    </header>
  );
}
