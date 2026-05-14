import { useState, useEffect } from 'react';
import axios from 'axios';
import Globe from './components/Globe.jsx';
import IntelPanel from './components/IntelPanel.jsx';
import Header from './components/Header.jsx';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [arcsData, setArcsData]               = useState([]);
  const [showArcs, setShowArcs]               = useState(false);
  const [panelOpen, setPanelOpen]             = useState(false);

  // Load all conflict arcs once on mount
  useEffect(() => {
    axios.get('/api/intel/arcs/all')
      .then(res => setArcsData(res.data))
      .catch(() => {/* backend not running — arcs hidden */});
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setPanelOpen(true);
    setShowArcs(false);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setSelectedCountry(null);
    setShowArcs(false);
  };

  const handleConnectToggle = () => {
    setShowArcs(prev => !prev);
  };

  // Filter arcs to show only those connected to selected country
  const visibleArcs = selectedCountry && showArcs
    ? arcsData.filter(a => a.from === selectedCountry.iso || a.to === selectedCountry.iso)
    : showArcs
      ? arcsData
      : [];

  return (
    <div className="app">
      <Header
        selectedCountry={selectedCountry}
        onClearSelection={handleClosePanel}
      />

      <Globe
        onCountrySelect={handleCountrySelect}
        selectedCountry={selectedCountry}
        arcsData={visibleArcs}
        showArcs={showArcs}
      />

      {panelOpen && (
        <IntelPanel
          country={selectedCountry}
          onClose={handleClosePanel}
          onConnectToggle={handleConnectToggle}
          connectActive={showArcs}
        />
      )}
    </div>
  );
}
