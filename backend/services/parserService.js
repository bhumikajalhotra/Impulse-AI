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

  // Simple Markdown check from Jina API fallback
  if (html.startsWith('Title:') || html.includes('![')) {
    data.rawText = html.substring(0, 3000);
    const titleMatch = html.match(/^Title:\s*(.+)/m);
    if (titleMatch) data.title = titleMatch[1];
    
    const imgMatch = html.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) data.image = imgMatch[1];
    
    return data;
  }

  const $ = cheerio.load(html);

  // 1. JSON-LD structured data (Most reliable)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html());
      const product = Array.isArray(json) ? json.find(j => j['@type'] === 'Product') : (json['@type'] === 'Product' ? json : null);
      if (product) {
        if (product.name && !data.title) data.title = product.name;
        if (product.image && !data.image) data.image = Array.isArray(product.image) ? product.image[0] : product.image;
        if (product.brand && product.brand.name && !data.brand) data.brand = product.brand.name;
        if (product.offers) {
          const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
          if (offer.price) data.price = offer.price;
        }
      }
    } catch (e) { /* ignore parse error */ }
  });

  // 2. OpenGraph Meta Tags
  if (!data.title) data.title = $('meta[property="og:title"]').attr('content') || $('title').text();
  if (!data.image) data.image = $('meta[property="og:image"]').attr('content');
  if (!data.price) data.price = $('meta[property="product:price:amount"]').attr('content') || $('meta[name="twitter:data1"]').attr('content');

  // 3. Platform Specific Selectors (Amazon, Myntra, etc.)
  if (!data.title) data.title = $('#productTitle').text().trim() || $('.pdp-title').text().trim() || $('.B_NuCI').text().trim();
  if (!data.price) {
    const priceText = $('.a-price-whole').first().text().trim() || $('.pdp-price').text().trim() || $('._30jeq3._16Jk6d').text().trim();
    if (priceText) data.price = priceText;
  }
  if (!data.image) data.image = $('#landingImage').attr('src') || $('.image-grid-image').attr('style')?.match(/url\("(.+)"\)/)?.[1];

  // Clean raw text for Gemini
  $('script, style, noscript, iframe, img, svg').remove();
  data.rawText = $('body').text().replace(/\s+/g, ' ').substring(0, 4000).trim();

  // Ensure title fallback
  if (!data.title) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      data.title = pathParts.length > 0 ? pathParts[0].replace(/[-_]/g, ' ') : 'Unknown Product';
    } catch (e) {}
  }

  return data;
};
