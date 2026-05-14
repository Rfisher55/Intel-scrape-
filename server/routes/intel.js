const express = require('express');
const router  = express.Router();

const MOCK_INTEL     = require('../data/mockIntel');
const { COUNTRY_COORDS, CONFLICTS, ARC_COLORS } = require('../data/conflicts');
const { getNewsForCountry }  = require('../services/newsService');
const { scrapeAllSources }   = require('../services/scraper');

// GET /api/intel/:iso  — full intel report for a country
router.get('/:iso', async (req, res) => {
  const iso = req.params.iso.toUpperCase();
  const countryMeta = COUNTRY_COORDS[iso];

  if (!countryMeta) {
    return res.status(404).json({ error: `Country ${iso} not in Middle East dataset` });
  }

  const mockData = MOCK_INTEL[iso] || {
    alertLevel: 'LOW',
    summary:    'Detailed intel not yet available for this country.',
    threats:    [],
    keyActors:  [],
    recentEvents: [],
    economicIndicator: 'Data unavailable',
  };

  // Fetch live news in parallel with mock data response
  let liveNews = [];
  try {
    const [newsItems, scrapedItems] = await Promise.allSettled([
      getNewsForCountry(countryMeta.name),
      scrapeAllSources(countryMeta.name),
    ]);

    liveNews = [
      ...(newsItems.status   === 'fulfilled' ? newsItems.value   : []),
      ...(scrapedItems.status === 'fulfilled' ? scrapedItems.value : []),
    ].slice(0, 8);
  } catch {
    // Live news unavailable — use mock events
  }

  // Build conflict arcs for this country
  const countryConflicts = CONFLICTS.filter(c => c.from === iso || c.to === iso).map(c => {
    const fromCoords = COUNTRY_COORDS[c.from];
    const toCoords   = COUNTRY_COORDS[c.to];
    if (!fromCoords || !toCoords) return null;

    return {
      ...c,
      startLat: fromCoords.lat,
      startLng: fromCoords.lng,
      endLat:   toCoords.lat,
      endLng:   toCoords.lng,
      color:    ARC_COLORS[c.type] || ARC_COLORS.conflict,
      fromName: fromCoords.name,
      toName:   toCoords.name,
    };
  }).filter(Boolean);

  res.json({
    iso,
    ...countryMeta,
    ...mockData,
    liveNews:  liveNews.length > 0 ? liveNews : mockData.recentEvents.map(e => ({ title: e, source: 'Intel Base', published: new Date().toISOString() })),
    conflicts: countryConflicts,
    lastUpdated: new Date().toISOString(),
  });
});

// GET /api/intel/arcs/all  — all conflict arcs for the globe
router.get('/arcs/all', (req, res) => {
  const arcs = CONFLICTS.map(c => {
    const from = COUNTRY_COORDS[c.from];
    const to   = COUNTRY_COORDS[c.to];
    if (!from || !to) return null;

    return {
      ...c,
      startLat: from.lat,
      startLng: from.lng,
      endLat:   to.lat,
      endLng:   to.lng,
      color:    ARC_COLORS[c.type] || ARC_COLORS.conflict,
      fromName: from.name,
      toName:   to.name,
    };
  }).filter(Boolean);

  res.json(arcs);
});

// GET /api/intel/countries/all  — metadata for all ME countries
router.get('/countries/all', (req, res) => {
  const countries = Object.entries(COUNTRY_COORDS).map(([iso, meta]) => ({
    iso,
    ...meta,
    alertLevel: MOCK_INTEL[iso]?.alertLevel || 'LOW',
  }));

  res.json(countries);
});

module.exports = router;
