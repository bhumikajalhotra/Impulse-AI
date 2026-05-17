import * as cheerio from 'cheerio';

export const parseProductHTML = (html, url) => {
  const data = {
    title: null,
    price: null,
    image: null,
    brand: null,
    platform: new URL(url).hostname.replace('www.', ''),
    rawText: ''
  };

  if (!html) return data;

  // Robust Markdown check (from Jina API fallback)
  const isMarkdown = (html.startsWith('# ') || html.startsWith('Title:')) && html.includes('![');
  if (isMarkdown) {
    data.rawText = html.substring(0, 3000);
    const titleMatch = html.match(/^Title:\s*(.+)/m);
    if (titleMatch) data.title = titleMatch[1];
    const imgMatch = html.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) data.image = imgMatch[1];
    return data;
  }

  const $ = cheerio.load(html);

  // --- LAYER 1: Metadata Extraction ---
  data.title = $('meta[property="og:title"]').attr('content') || 
               $('meta[name="twitter:title"]').attr('content') ||
               $('title').text().trim();

  data.image = $('meta[property="og:image"]').attr('content') || 
               $('meta[name="twitter:image"]').attr('content');

  data.price = $('meta[property="product:price:amount"]').attr('content') || 
               $('meta[name="twitter:data1"]').attr('content') ||
               $('meta[property="og:price:amount"]').attr('content');

  // Active Sale/Selling Price override (e.g. Shopify/boAt lifestyle regular vs sale price)
  const activeSalePrice = $('.price-item--sale, .price__sale .price-item, .price--highlight').first().text().trim();
  if (activeSalePrice) {
    data.price = activeSalePrice;
  }

  data.brand = $('meta[property="product:brand"]').attr('content') ||
               $('meta[name="twitter:data2"]').attr('content');

  // --- LAYER 2: Site-Specific Parsers ---
  
  // Amazon
  if (url.includes('amazon')) {
    if (!data.title) data.title = $('#productTitle').text().trim();
    if (!data.price) data.price = $('.a-price-whole').first().text().trim() || $('.a-offscreen').first().text().trim();
    if (!data.image) data.image = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
  }
  
  // Myntra
  if (url.includes('myntra')) {
    if (!data.title) data.title = $('.pdp-title').text().trim() + ' ' + $('.pdp-name').text().trim();
    if (!data.price) data.price = $('.pdp-price').first().text().trim();
  }

  // Flipkart
  if (url.includes('flipkart')) {
    if (!data.title) data.title = $('.B_NuCI').text().trim();
    if (!data.price) data.price = $('._30jeq3._16Jk6d').text().trim();
  }

  // Generic Fallback Selectors
  if (!data.title) data.title = $('h1').first().text().trim();
  if (!data.price) {
    const commonPriceSelectors = ['.price', '.product-price', '[data-price]', '.amount'];
    for (const s of commonPriceSelectors) {
      const p = $(s).text().trim();
      if (p) { data.price = p; break; }
    }
  }

  // --- JSON-LD Fallback (Lowest Priority) ---
  if (!data.title || !data.price) {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        const products = Array.isArray(json) ? json : [json];
        for (const p of products) {
           const item = p['@type'] === 'Product' ? p : (p['@graph'] ? p['@graph'].find(x => x['@type'] === 'Product') : null);
           if (item) {
             if (!data.title && item.name) data.title = item.name;
             if (!data.image && item.image) data.image = Array.isArray(item.image) ? item.image[0] : item.image;
             if (!data.price && item.offers) {
               const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
               data.price = offer.price || offer.lowPrice;
             }
           }
        }
      } catch (e) {}
    });
  }

  // Clean raw text for Gemini
  const bodyText = $('body').clone();
  bodyText.find('script, style, noscript, iframe, nav, footer, header, svg').remove();
  data.rawText = bodyText.text().replace(/\s+/g, ' ').substring(0, 5000).trim();

  // If even body text fails, use meta description
  if (data.rawText.length < 100) {
    data.rawText = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  }

  return data;
};
