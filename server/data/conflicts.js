const COUNTRY_COORDS = {
  ISR: { lat: 31.5,  lng: 34.75, name: 'Israel',       capital: 'Jerusalem',  numericId: 376 },
  PSE: { lat: 31.9,  lng: 35.2,  name: 'Palestine',    capital: 'Ramallah',   numericId: 275 },
  LBN: { lat: 33.9,  lng: 35.5,  name: 'Lebanon',      capital: 'Beirut',     numericId: 422 },
  SYR: { lat: 33.5,  lng: 36.3,  name: 'Syria',        capital: 'Damascus',   numericId: 760 },
  IRN: { lat: 35.7,  lng: 51.4,  name: 'Iran',         capital: 'Tehran',     numericId: 364 },
  IRQ: { lat: 33.3,  lng: 44.4,  name: 'Iraq',         capital: 'Baghdad',    numericId: 368 },
  SAU: { lat: 24.7,  lng: 46.7,  name: 'Saudi Arabia', capital: 'Riyadh',     numericId: 682 },
  YEM: { lat: 15.4,  lng: 44.2,  name: 'Yemen',        capital: "Sana'a",     numericId: 887 },
  TUR: { lat: 39.9,  lng: 32.9,  name: 'Turkey',       capital: 'Ankara',     numericId: 792 },
  JOR: { lat: 31.9,  lng: 35.9,  name: 'Jordan',       capital: 'Amman',      numericId: 400 },
  EGY: { lat: 30.1,  lng: 31.2,  name: 'Egypt',        capital: 'Cairo',      numericId: 818 },
  ARE: { lat: 24.5,  lng: 54.4,  name: 'UAE',          capital: 'Abu Dhabi',  numericId: 784 },
  QAT: { lat: 25.3,  lng: 51.5,  name: 'Qatar',        capital: 'Doha',       numericId: 634 },
  KWT: { lat: 29.4,  lng: 47.6,  name: 'Kuwait',       capital: 'Kuwait City',numericId: 414 },
  BHR: { lat: 26.2,  lng: 50.6,  name: 'Bahrain',      capital: 'Manama',     numericId: 48  },
  OMN: { lat: 23.6,  lng: 58.6,  name: 'Oman',         capital: 'Muscat',     numericId: 512 },
};

// Arc color by relationship type
const ARC_COLORS = {
  war:         ['rgba(239,68,68,0.9)',   'rgba(239,68,68,0.1)'],
  conflict:    ['rgba(249,115,22,0.9)',  'rgba(249,115,22,0.1)'],
  proxy_war:   ['rgba(220,38,38,0.9)',   'rgba(220,38,38,0.1)'],
  proxy:       ['rgba(245,158,11,0.9)',  'rgba(245,158,11,0.1)'],
  rivalry:     ['rgba(234,179,8,0.9)',   'rgba(234,179,8,0.1)'],
  influence:   ['rgba(168,85,247,0.9)',  'rgba(168,85,247,0.1)'],
  support:     ['rgba(251,191,36,0.9)',  'rgba(251,191,36,0.1)'],
  airstrike:   ['rgba(239,68,68,0.9)',   'rgba(239,68,68,0.1)'],
  diplomatic:  ['rgba(59,130,246,0.9)',  'rgba(59,130,246,0.1)'],
  border:      ['rgba(107,114,128,0.9)', 'rgba(107,114,128,0.1)'],
};

const CONFLICTS = [
  { from:'ISR', to:'PSE', type:'war',       label:'Gaza Conflict',                severity:'critical' },
  { from:'ISR', to:'LBN', type:'conflict',  label:'Hezbollah Confrontation',      severity:'high'     },
  { from:'ISR', to:'IRN', type:'proxy_war', label:'Shadow War / Proxy Conflict',  severity:'high'     },
  { from:'ISR', to:'SYR', type:'airstrike', label:'Israeli Airstrikes on Syria',  severity:'medium'   },
  { from:'IRN', to:'SAU', type:'rivalry',   label:'Shia-Sunni Regional Rivalry',  severity:'medium'   },
  { from:'IRN', to:'YEM', type:'proxy',     label:'Houthi Proxy Support',         severity:'high'     },
  { from:'IRN', to:'LBN', type:'support',   label:'Hezbollah Arming & Funding',   severity:'high'     },
  { from:'IRN', to:'IRQ', type:'influence', label:'Iranian Political Influence',  severity:'medium'   },
  { from:'IRN', to:'PSE', type:'support',   label:'Hamas Support Network',        severity:'high'     },
  { from:'SAU', to:'YEM', type:'war',       label:'Coalition Military Campaign',  severity:'high'     },
  { from:'TUR', to:'SYR', type:'conflict',  label:'Border Ops / Kurdish Corridor',severity:'medium'   },
  { from:'EGY', to:'PSE', type:'border',    label:'Rafah Border Crisis',          severity:'medium'   },
  { from:'JOR', to:'ISR', type:'border',    label:'Border Security Agreement',    severity:'low'      },
  { from:'ARE', to:'IRN', type:'rivalry',   label:'Gulf Territorial Tensions',    severity:'low'      },
  { from:'QAT', to:'SAU', type:'diplomatic',label:'Diplomatic Normalization',     severity:'low'      },
];

module.exports = { COUNTRY_COORDS, CONFLICTS, ARC_COLORS };
