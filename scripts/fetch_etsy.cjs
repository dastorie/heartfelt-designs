const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SHOP_URL = 'https://www.etsy.com/ca/shop/HeartfeltDesigns1';
const DATA_DIR = path.join(__dirname, '../src/data');
const DATA_FILE = path.join(DATA_DIR, 'patterns.json');
const CONFIG_FILE = path.join(__dirname, '../config.json');

async function fetchEtsyPatterns() {
  console.log('Fetching patterns from Etsy...');
  
  try {
    const response = await axios.get(SHOP_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const patterns = [];

    $('.listing-link').each((i, el) => {
      const $el = $(el);
      const title = $el.attr('title') || $el.find('.wt-text-caption').text().trim();
      const url = $el.attr('href').split('?')[0]; // Clean URL
      const price = $el.find('.currency-value').text().trim();
      const imgUrl = $el.find('img').attr('src') || $el.find('img').attr('data-src');

      if (title && url) {
        patterns.push({
          title,
          url: url.startsWith('http') ? url : `https://www.etsy.com${url}`,
          price: price ? `CA$${price}` : 'N/A',
          imgUrl: imgUrl || ''
        });
      }
    });

    console.log(`Successfully fetched ${patterns.length} patterns.`);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(patterns, null, 2));

    // Update config.json with some listing URLs for hero if empty
    if (patterns.length > 0) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.heroImages.length === 0) {
        // Pick top 5 as potential hero images
        config.heroImages = patterns.slice(0, 5).map(p => p.imgUrl);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log('Updated config.json with featured hero images.');
      }
    }

  } catch (error) {
    console.error('Error fetching Etsy data:', error.message);
    process.exit(1);
  }
}

fetchEtsyPatterns();
