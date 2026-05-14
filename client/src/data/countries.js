// UN M49 numeric ID → ISO alpha-3 + metadata for Middle East countries
export const ME_COUNTRIES_BY_ID = {
  376: { iso: 'ISR', name: 'Israel',        capital: 'Jerusalem',   alertLevel: 'HIGH',     lat: 31.5,  lng: 34.75 },
  275: { iso: 'PSE', name: 'Palestine',     capital: 'Ramallah',    alertLevel: 'CRITICAL', lat: 31.9,  lng: 35.2  },
  422: { iso: 'LBN', name: 'Lebanon',       capital: 'Beirut',      alertLevel: 'HIGH',     lat: 33.9,  lng: 35.5  },
  760: { iso: 'SYR', name: 'Syria',         capital: 'Damascus',    alertLevel: 'HIGH',     lat: 33.5,  lng: 36.3  },
  364: { iso: 'IRN', name: 'Iran',          capital: 'Tehran',      alertLevel: 'HIGH',     lat: 35.7,  lng: 51.4  },
  368: { iso: 'IRQ', name: 'Iraq',          capital: 'Baghdad',     alertLevel: 'MEDIUM',   lat: 33.3,  lng: 44.4  },
  682: { iso: 'SAU', name: 'Saudi Arabia',  capital: 'Riyadh',      alertLevel: 'MEDIUM',   lat: 24.7,  lng: 46.7  },
  887: { iso: 'YEM', name: 'Yemen',         capital: "Sana'a",      alertLevel: 'HIGH',     lat: 15.4,  lng: 44.2  },
  792: { iso: 'TUR', name: 'Turkey',        capital: 'Ankara',      alertLevel: 'MEDIUM',   lat: 39.9,  lng: 32.9  },
  400: { iso: 'JOR', name: 'Jordan',        capital: 'Amman',       alertLevel: 'LOW',      lat: 31.9,  lng: 35.9  },
  818: { iso: 'EGY', name: 'Egypt',         capital: 'Cairo',       alertLevel: 'LOW',      lat: 30.1,  lng: 31.2  },
  784: { iso: 'ARE', name: 'UAE',           capital: 'Abu Dhabi',   alertLevel: 'LOW',      lat: 24.5,  lng: 54.4  },
  634: { iso: 'QAT', name: 'Qatar',         capital: 'Doha',        alertLevel: 'LOW',      lat: 25.3,  lng: 51.5  },
  414: { iso: 'KWT', name: 'Kuwait',        capital: 'Kuwait City', alertLevel: 'LOW',      lat: 29.4,  lng: 47.6  },
  48:  { iso: 'BHR', name: 'Bahrain',       capital: 'Manama',      alertLevel: 'LOW',      lat: 26.2,  lng: 50.6  },
  512: { iso: 'OMN', name: 'Oman',          capital: 'Muscat',      alertLevel: 'LOW',      lat: 23.6,  lng: 58.6  },
};

// Keyed by ISO alpha-3 for quick lookup
export const ME_COUNTRIES_BY_ISO = Object.fromEntries(
  Object.entries(ME_COUNTRIES_BY_ID).map(([id, data]) => [data.iso, { ...data, numericId: parseInt(id) }])
);

export const ALERT_COLORS = {
  CRITICAL: 'rgba(185, 28, 28, 0.92)',
  HIGH:     'rgba(220, 38, 38, 0.82)',
  MEDIUM:   'rgba(234, 88, 12, 0.78)',
  LOW:      'rgba(22, 163, 74,  0.72)',
};

export const ALERT_BADGE_COLORS = {
  CRITICAL: { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
  HIGH:     { bg: '#7c2d12', text: '#fdba74', border: '#f97316' },
  MEDIUM:   { bg: '#78350f', text: '#fcd34d', border: '#f59e0b' },
  LOW:      { bg: '#14532d', text: '#86efac', border: '#22c55e' },
};
