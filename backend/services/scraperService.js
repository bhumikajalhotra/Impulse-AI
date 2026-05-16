import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

const getRandomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

const buildHeaders = () => ({
  'User-Agent': getRandomUA(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
});

export const scrapeProduct = async (url) => {
  let html = '';
  
  console.log(`[Scraper] Layer 1: Attempting Axios Fast Fetch -> ${url}`);
  try {
    const response = await axios.get(url, {
      headers: buildHeaders(),
      timeout: 10000,
      validateStatus: (status) => status < 500
    });
    html = response.data;
  } catch (err) {
    console.log(`[Scraper] Layer 1 Failed: ${err.message}`);
  }

  // If blocked (captcha, etc.), Layer 2: Puppeteer
  const blockedKeywords = ['captcha', 'robot', 'blocked', 'access denied', 'verify you are human'];
  const isBlocked = blockedKeywords.some(kw => html.toLowerCase().includes(kw));

  if (!html || isBlocked || html.length < 1000) {
    console.log(`[Scraper] Layer 2: Attempting Puppeteer Render -> ${url}`);
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setUserAgent(getRandomUA());
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // wait a bit for hydration
      await new Promise(resolve => setTimeout(resolve, 2000));
      html = await page.content();
    } catch (err) {
      console.log(`[Scraper] Layer 2 Failed: ${err.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }

  // If still fails, Layer 3: External API (Jina)
  if (!html || html.length < 1000) {
    console.log(`[Scraper] Layer 3: Attempting External API Fallback -> ${url}`);
    try {
      const response = await axios.get(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'application/json', 'X-Return-Format': 'markdown' },
        timeout: 15000
      });
      html = typeof response.data === 'string' ? response.data : response.data?.data?.content || '';
    } catch (err) {
      console.log(`[Scraper] Layer 3 Failed: ${err.message}`);
    }
  }

  return html;
};
