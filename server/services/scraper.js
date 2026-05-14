const axios   = require('axios');
const cheerio = require('cheerio');

// Scrape a news page for headlines related to a country
async function scrapeHeadlines(countryName) {
  const targets = [
    {
      url:      `https://www.aljazeera.com/where/search/?q=${encodeURIComponent(countryName)}`,
      selector: 'article h3',
      source:   'Al Jazeera',
    },
    {
      url:      `https://www.middleeasteye.net/search?keywords=${encodeURIComponent(countryName)}`,
      selector: '.article-card__title',
      source:   'Middle East Eye',
    },
  ];

  const results = [];

  for (const target of targets) {
    try {
      const res = await axios.get(target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IntelGlobe/1.0; research tool)',
        },
        timeout: 6000,
      });

      const $ = cheerio.load(res.data);
      $(target.selector).each((i, el) => {
        if (i >= 3) return false;
        const title = $(el).text().trim();
        if (title.length > 10) {
          results.push({ title, source: target.source, url: target.url, published: new Date().toISOString() });
        }
      });
    } catch {
      // Site unavailable — skip
    }
  }

  return results;
}

// Scrape Reddit for country-related discussion
async function scrapeReddit(countryName) {
  try {
    const sub = countryName.toLowerCase().replace(/\s+/g, '');
    const res = await axios.get(`https://www.reddit.com/r/worldnews/search.json`, {
      params: { q: countryName, sort: 'new', limit: 5, restrict_sr: false },
      headers: { 'User-Agent': 'IntelGlobe/1.0 research tool' },
      timeout: 6000,
    });

    return (res.data?.data?.children || []).map(c => ({
      title:     c.data.title,
      summary:   `${c.data.score} upvotes — r/${c.data.subreddit}`,
      url:       `https://reddit.com${c.data.permalink}`,
      source:    'Reddit',
      published: new Date(c.data.created_utc * 1000).toISOString(),
    }));
  } catch {
    return [];
  }
}

async function scrapeAllSources(countryName) {
  const [headlines, reddit] = await Promise.allSettled([
    scrapeHeadlines(countryName),
    scrapeReddit(countryName),
  ]);

  return [
    ...(headlines.status === 'fulfilled' ? headlines.value : []),
    ...(reddit.status    === 'fulfilled' ? reddit.value    : []),
  ];
}

module.exports = { scrapeAllSources };
