import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

// Initialize Firebase Admin
// Note: You need to download your service account key and set GOOGLE_APPLICATION_CREDENTIALS 
// or initialize with a service account object.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.warn("Firebase Admin failed to initialize with default credentials. Firestore persistence will be disabled.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Stealth browser headers for scraping
const STEALTH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

// Health check
app.get('/', (req, res) => {
  res.send('Impulse.ai Backend is running!');
});

// GET /api/history/:userId
app.get('/api/history/:userId', async (req, res) => {
  if (!db) return res.status(200).json([]);
  
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('history')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const history = [];
    snapshot.forEach(doc => history.push(doc.data()));
    res.json(history);
  } catch (error) {
    console.error("History fetch error:", error.message);
    res.status(200).json([]);
  }
});

// ─── Scraper Validation ───
function validateScrapedContent(text) {
  if (!text || text.length < 200) return { valid: false, reason: 'Content too short' };
  
  const blockedKeywords = ['captcha', 'robot', 'blocked', 'access denied', 'enable javascript', 'verify you are human'];
  const lowerText = text.toLowerCase();
  for (const keyword of blockedKeywords) {
    if (lowerText.includes(keyword)) {
      return { valid: false, reason: `Blocked: contains "${keyword}"` };
    }
  }
  
  return { valid: true };
}

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage', userId, budget = 5000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required to perform an analysis.' });
  }

  try {
    console.log(`-> Starting scrape for URL: ${url} | Vibe: ${vibe} | Budget: ${budget}`);
    
    // ─── Step A: Multi-Strategy Scraping ───
    let markdownText = "";
    let scrapeSuccess = false;
    
    // Strategy 1: Jina Reader with stealth headers & extended timeout
    try {
      console.log("-> Strategy 1: Jina Reader...");
      const scrapeResponse = await axios.get(`https://r.jina.ai/${url}`, {
        headers: { 
          ...STEALTH_HEADERS,
          'Accept': 'application/json',
          'X-Return-Format': 'markdown'
        },
        timeout: 45000 // 45 second timeout for slow retailers
      });
      
      if (typeof scrapeResponse.data === 'string') {
        markdownText = scrapeResponse.data;
      } else if (scrapeResponse.data?.data?.content) {
        markdownText = scrapeResponse.data.data.content;
      } else {
        markdownText = JSON.stringify(scrapeResponse.data);
      }
      
      const validation = validateScrapedContent(markdownText);
      if (validation.valid) {
        scrapeSuccess = true;
        console.log(`-> Jina Reader success (${markdownText.length} chars)`);
      } else {
        console.warn(`-> Jina Reader content invalid: ${validation.reason}`);
        markdownText = "";
      }
    } catch (scrapeError) {
      console.warn("-> Jina Reader failed:", scrapeError.message);
    }
    
    // Strategy 2: Direct fetch with stealth headers (fallback)
    if (!scrapeSuccess) {
      try {
        console.log("-> Strategy 2: Direct fetch with stealth headers...");
        const directResponse = await axios.get(url, {
          headers: STEALTH_HEADERS,
          timeout: 30000,
          maxRedirects: 5
        });
        
        const html = typeof directResponse.data === 'string' ? directResponse.data : '';
        // Extract useful text from HTML (title, meta description, price patterns)
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const priceMatch = html.match(/₹[\s]?[\d,]+\.?\d*/g) || html.match(/Rs\.?\s?[\d,]+\.?\d*/gi);
        const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        
        const extractedParts = [];
        if (titleMatch) extractedParts.push(`Product Title: ${titleMatch[1].trim()}`);
        if (metaDesc) extractedParts.push(`Description: ${metaDesc[1].trim()}`);
        if (priceMatch) extractedParts.push(`Prices found: ${priceMatch.join(', ')}`);
        
        if (extractedParts.length > 0) {
          markdownText = extractedParts.join('\n');
          scrapeSuccess = true;
          console.log(`-> Direct fetch extracted ${extractedParts.length} data points`);
        }
      } catch (directError) {
        console.warn("-> Direct fetch failed:", directError.message);
      }
    }

    // Strategy 3: URL-slug inference (last resort)
    if (!scrapeSuccess) {
      console.log("-> Strategy 3: URL slug inference...");
      // Extract product info from URL structure
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const slugText = pathParts
        .filter(p => p.length > 3 && !p.match(/^[a-f0-9]+$/i) && !p.startsWith('dp'))
        .map(p => p.replace(/[-_]/g, ' '))
        .join(' ');
      
      markdownText = `Product URL: ${url}\nExtracted from URL: ${slugText || 'Unknown product'}\nNote: Retailer blocked direct scraping. Analyze based on URL pattern and your knowledge.`;
    }

    // ─── Step B: Analyze with Gemini (with AI Guardrails) ───
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const basePersona = vibe === 'Enabler' 
      ? "You are 'Impulse.ai', a toxic financial enabler and shopping bestie. Your goal is to make the girlMath genius and the realityCheck mild. Convince the user that every item is an 'investment' or basically 'free'."
      : "You are 'Impulse.ai', a brutalist shopping assistant. Your goal is to make the girlMath sarcastic and the realityCheck brutal. Roast the user's life choices with Gen-Z wit and judgmental punchy lines. Use Indian context (INR/Chai references) where appropriate.";

    const systemInstruction = `${basePersona}
Analyze the provided product data and URL.
Factor in the user's monthly budget: ₹${budget}. If the product price is a large % of the budget, be extra savage.

IMPORTANT GUARDRAIL: If the provided product data is incomplete, blocked, contains 'captcha' messages, or seems like generic error text, you MUST still attempt to identify the product from the URL slug and your general knowledge. Guess the product name and a realistic price based on the URL. Do NOT return an impulseScore of 100 or sustainabilityScore of 100 for unverified products — use realistic estimates instead.

Return ONLY a valid JSON object matching this EXACT schema: 
{ 
  "productName": "string", 
  "productImage": "string", 
  "price": "string", 
  "verdict": "BUY IT" | "DROP IT", 
  "impulseScore": number (1-100), 
  "girlMath": "string", 
  "realityCheck": "string", 
  "prosCons": ["string", "string", "string"],
  "sustainabilityScore": number (1-100),
  "waitTimeRecommendation": "string" (e.g., "Wait 48 hours before buying")
}
CRITICAL RULES:
1. NO markdown formatting or backticks around the JSON. Return raw text only.
2. Tone: Gen-Z, witty, slightly judgmental, and punchy.
3. If the scraped text says access is blocked, guess the product based on the URL slug. Be creative.
4. Find the REAL product image URL from the scraped text. Fallback: 'https://image.pollinations.ai/prompt/{product_name_encoded}?width=400&height=400&nologo=true'.
5. sustainabilityScore: Rate how eco-friendly/durable the item is. Use realistic values (30-70 for average items).
6. waitTimeRecommendation: Tell them how long they should sit on this impulse.
7. NEVER return "Error Connecting" as productName or "???" as price. Always make your best guess.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const promptText = `URL: ${url}\nScrape Status: ${scrapeSuccess ? 'SUCCESS' : 'PARTIAL/FAILED'}\n\nScraped Text:\n${markdownText.substring(0, 8000)}`;

    const result = await model.generateContent(promptText);
    const aiResponseString = result.response.text();

    // Robust JSON Extraction
    let cleanJson = aiResponseString.trim();
    if (cleanJson.includes('{')) {
      cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
    }
    
    let parsedResult = JSON.parse(cleanJson);
    
    // ─── Post-processing Guardrails ───
    // Sanitize image URL
    if (!parsedResult.productImage || parsedResult.productImage.includes('undefined')) {
      const encodedName = encodeURIComponent(parsedResult.productName || 'product');
      parsedResult.productImage = `https://image.pollinations.ai/prompt/${encodedName}%20product%20photo?width=400&height=400&nologo=true`;
    }
    
    // Cap unrealistic scores
    if (!scrapeSuccess) {
      if (parsedResult.impulseScore === 100) parsedResult.impulseScore = 72;
      if (parsedResult.sustainabilityScore === 100) parsedResult.sustainabilityScore = 45;
    }
    
    // Ensure price isn't "???"
    if (parsedResult.price === '???' || !parsedResult.price) {
      parsedResult.price = '₹ Check retailer';
    }
    
    // Step C: Save to Firestore if userId is present
    if (db && userId) {
      try {
        await db.collection('history').add({
          userId,
          url,
          ...parsedResult,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("-> Saved to Firestore for user:", userId);
      } catch (firestoreError) {
        console.warn("-> Firestore save failed:", firestoreError.message);
      }
    }

    console.log("-> Analysis complete.");
    res.json(parsedResult);
  } catch (error) {
    console.error("Pipeline Error:", error.message);
    
    // ─── Graceful Error Response ───
    // Instead of fake data, return an explicit error flag
    res.status(200).json({
      error: "SCRAPER_BLOCKED",
      productName: "Retailer Shield Detected",
      productImage: null,
      price: "₹ Unavailable",
      verdict: "TRY AGAIN",
      impulseScore: 0,
      girlMath: "Even our AI couldn't get past their firewall. This retailer really doesn't want you buying stuff today.",
      realityCheck: "The scraper got blocked. This isn't a sign from the universe — it's just aggressive anti-bot tech. Try a different link or retailer.",
      prosCons: ["Their security is top-notch", "Your wallet is safe for now", "Try Flipkart or Myntra instead"],
      sustainabilityScore: 0,
      waitTimeRecommendation: "Try again in a few minutes with a different link"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
