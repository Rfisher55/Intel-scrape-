const axios = require('axios');
const Parser = require('rss-parser');

const rssParser = new Parser();

// RSS feeds for Middle East news — no key required
const RSS_FEEDS = {
  aljazeera:  'https://www.aljazeera.com/xml/rss/all.xml',
  reuters_me: 'https://feeds.reuters.com/reuters/worldNews',
  bbc_me:     'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
  apnews:     'https://rsshub.app/apnews/topics/middle-east',
};

// GDELT API — free, no key required
const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

async function fetchRSSNews(countryName, limit = 5) {
  const results = [];

  for (const [source, url] of Object.entries(RSS_FEEDS)) {
    try {
      const feed = await rssParser.parseURL(url);
      const relevant = feed.items
        .filter(item => {
          const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          return text.includes(countryName.toLowerCase());
        })
        .slice(0, 2)
        .map(item => ({
          title:     item.title,
          summary:   item.contentSnippet?.slice(0, 200) || '',
          url:       item.link,
          source,
          published: item.pubDate || item.isoDate,
        }));

      results.push(...relevant);
    } catch {
      // Feed unavailable — skip silently
    }
  }

  return results.slice(0, limit);
}

async function fetchNewsAPI(countryName, apiKey) {
  if (!apiKey) return [];

  try {
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q:        countryName,
        language: 'en',
        sortBy:   'publishedAt',
        pageSize: 5,
        apiKey,
      },
      timeout: 8000,
    });

    return res.data.articles.map(a => ({
      title:     a.title,
      summary:   a.description?.slice(0, 200) || '',
      url:       a.url,
      source:    a.source.name,
      published: a.publishedAt,
    }));
  } catch {
    return [];
  }
}

async function fetchGDELT(countryName, limit = 5) {
  try {
    const res = await axios.get(GDELT_API, {
      params: {
        query:     `${countryName} conflict OR tension OR military OR political`,
        mode:      'artlist',
        maxrecords: limit,
        format:    'json',
      },
      timeout: 8000,
    });

    if (!res.data.articles) return [];

    return res.data.articles.map(a => ({
      title:     a.title,
      summary:   a.seendatetime || '',
      url:       a.url,
      source:    'GDELT',
      published: a.seendatetime,
    }));
  } catch {
    return [];
  }
}

async function getNewsForCountry(countryName) {
  const apiKey = process.env.NEWS_API_KEY;

  const [rssItems, apiItems, gdeltItems] = await Promise.allSettled([
    fetchRSSNews(countryName),
    fetchNewsAPI(countryName, apiKey),
    fetchGDELT(countryName),
  ]);

  const all = [
    ...(rssItems.status   === 'fulfilled' ? rssItems.value   : []),
    ...(apiItems.status   === 'fulfilled' ? apiItems.value   : []),
    ...(gdeltItems.status === 'fulfilled' ? gdeltItems.value : []),
  ];

  // Deduplicate by title
  const seen = new Set();
  return all.filter(item => {
    if (seen.has(item.title)) return false;
    seen.add(item.title);
    return true;
  }).slice(0, 8);
}

module.exports = { getNewsForCountry };
