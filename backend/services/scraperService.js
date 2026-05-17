import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteerExtra from 'puppeteer-extra';
import puppeteerStealth from 'puppeteer-extra-plugin-stealth';

// Initialize stealth plugin for puppeteer
puppeteerExtra.use(puppeteerStealth());

// ==== Residential Proxy Pool (Simulated) ====
const PROXY_POOL = [
  'http://residential-proxy-1.example.com:3128',
  'http://residential-proxy-2.example.com:3128',
  'http://residential-proxy-3.example.com:3128',
];
const getRandomProxy = () => PROXY_POOL[Math.floor(Math.random() * PROXY_POOL.length)];

// ==== User‑Agent Pool ====
const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];
const getRandomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

// ==== Helper: build request headers ====
const buildHeaders = () => ({
  'User-Agent': getRandomUA(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Referer': 'https://www.google.com',
});

// ==== Task 2: Robust URL Name Extraction ====
export const extractNameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Pattern to catch product names in slugs (e.g., /Sony-WH-1000XM4-Headphones/dp/...)
    // Splits by / and takes the longest part that isn't a known noise word or short ID
    const parts = path.split('/').filter(p => {
      if (p.length < 5) return false;
      if (/^[A-Z0-9]{10}$/.test(p)) return false; // Skip Amazon ASINs
      if (['dp', 'product', 'buy', 'item', 'p'].includes(p.toLowerCase())) return false;
      return true;
    });

    if (parts.length > 0) {
      // Pick the part with the most dashes/words as it's likely the product title
      const bestPart = parts.sort((a, b) => b.length - a.length)[0];
      return bestPart
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    return '';
  } catch {
    return '';
  }
};

/**
 * Multi‑layer scraper:
 * 1️⃣ Fast Axios request
 * 2️⃣ Puppeteer Stealth Rendering
 * 3️⃣ Jina AI markdown fallback
 */
export const scrapeProduct = async (url) => {
  console.log(`[Scraper] 🚀 Starting Elite Stealth Scrape for: ${url}`);
  
  // ---------- Layer 1 – Axios ----------
  try {
    const resp = await axios.get(url, {
      headers: buildHeaders(),
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    const html = resp.data;
    if (html && html.length > 5000 && !/captcha|robot|blocked/i.test(html)) {
      console.log(`[Scraper] Layer 1 success`);
      return html;
    }
  } catch (e) {}

  // ---------- Layer 2 – Puppeteer ----------
  try {
    const proxy = getRandomProxy();
    const browser = await puppeteerExtra.launch({
      headless: true, 
      args: ['--no-sandbox', `--proxy-server=${proxy}`, '--disable-blink-features=AutomationControlled'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUA());
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for common selectors
    const selectors = ['#productTitle', '.B_NuCI', '.pdp-title'];
    for (const s of selectors) {
      await page.waitForSelector(s, { timeout: 3000 }).catch(() => {});
    }

    const html = await page.content();
    await browser.close();
    
    if (html && html.length > 5000 && !/captcha|robot|blocked/i.test(html)) {
      console.log(`[Scraper] Layer 2 success`);
      return html;
    }
  } catch (e) {}

  // ---------- Layer 3 – Jina AI ----------
  try {
    const resp = await axios.get(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });
    const markdown = resp.data?.data?.content || '';
    if (markdown && markdown.length > 200) {
      console.log('[Scraper] Layer 3 success');
      return markdown;
    }
  } catch (e) {}

  return '';
};
