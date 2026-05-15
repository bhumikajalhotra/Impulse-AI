import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

// ─── Startup: Environment Variable Audit ───
const IS_DEV = process.env.NODE_ENV !== 'production';

const validateKeys = () => {
  const essential = ['GEMINI_API_KEY', 'ANAKIN_API_KEY'];
  console.log('\n🚀 Impulse.ai Backend: Auditing API Keys...');
  
  essential.forEach(key => {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      console.error(`❌ FATAL: ${key} is missing or empty!`);
    } else if (IS_DEV) {
      console.log(`✅ ${key} is present (Length: ${val.length})`);
    }
  });

  if (!process.env.GEMINI_API_KEY) {
    console.error('========================================================');
    console.error('  CRITICAL: GEMINI_API_KEY is required for AI Analysis.');
    console.error('========================================================\n');
  }
};

validateKeys();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.warn('Firebase Admin failed to initialize with default credentials. Firestore persistence will be disabled.');
  }
}

const db = admin.apps.length ? admin.firestore() : null;

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Maintenance Check Middleware ───
const maintenanceMiddleware = (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ 
      error: 'MAINTENANCE_ERROR', 
      message: 'System is undergoing maintenance (API Error)' 
    });
  }
  next();
};

app.use('/api/analyze', maintenanceMiddleware);

// ─── User-Agent Rotation Pool ───
// Latest Chrome/Safari UA strings for Mac and iPhone (as of 2025)
const UA_POOL = [
  // Chrome 125 on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  // Chrome 124 on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.207 Safari/537.36',
  // Safari 17 on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  // Chrome on iPhone (iOS 17)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1',
  // Safari on iPhone (iOS 17)
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
  // Chrome on Windows (for diversity)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

const getRandomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

// ─── Build Stealth Headers (randomized per call) ───
const buildStealthHeaders = () => ({
  'User-Agent': getRandomUA(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Referer': 'https://www.google.com',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'cross-site',
});

// ─── URL Slug → Product Name Extractor ───
// e.g. amazon.in/dp/B08N5WRWNW/Boat-Rockerz-450 → "Boat Rockerz 450"
const extractProductNameFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Filter out noise: short segments, hex IDs, known path keywords
    const noiseWords = new Set(['dp', 'p', 'gp', 'product', 'buy', 'item', 'products',
      'collections', 'category', 'search', 'store', 'ref', 'offer', 'listing', 'detail']);

    const candidateParts = pathParts.filter(p => {
      if (p.length < 4) return false;                 // too short
      if (/^[A-Z0-9]{8,}$/.test(p)) return false;    // ASIN-like IDs
      if (/^[a-f0-9]{8,}$/i.test(p)) return false;   // hex IDs
      if (noiseWords.has(p.toLowerCase())) return false;
      if (/^\d+$/.test(p)) return false;              // pure numbers
      return true;
    });

    if (candidateParts.length === 0) return null;

    // Pick the longest slug segment (most descriptive)
    const bestPart = candidateParts.sort((a, b) => b.length - a.length)[0];
    // Convert dashes/underscores to spaces and title-case
    return bestPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  } catch {
    return null;
  }
};

// ─── Scraper Content Validator ───
const validateScrapedContent = (text) => {
  if (!text || text.length < 200) return { valid: false, reason: 'Content too short' };

  const blockedKeywords = [
    'captcha', 'robot', 'blocked', 'access denied',
    'enable javascript', 'verify you are human', 'please verify',
    'unusual traffic', 'bot detection'
  ];
  const lowerText = text.toLowerCase();
  for (const keyword of blockedKeywords) {
    if (lowerText.includes(keyword)) {
      return { valid: false, reason: `Blocked: contains "${keyword}"` };
    }
  }
  return { valid: true };
};

// Health check
app.get('/', (req, res) => {
  res.send('Impulse.ai Backend is running! 🚀');
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
    console.error('History fetch error:', error.message);
    res.status(200).json([]);
  }
});

// GET /api/user/:userId/savings
app.get('/api/user/:userId/savings', async (req, res) => {
  if (!db) return res.status(200).json({ savings: 0 });
  try {
    const { userId } = req.params;
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      res.json({ savings: doc.data().savings || 0 });
    } else {
      res.json({ savings: 0 });
    }
  } catch (error) {
    console.error('Savings fetch error:', error.message);
    res.status(200).json({ savings: 0 });
  }
});

// POST /api/user/:userId/savings
app.post('/api/user/:userId/savings', async (req, res) => {
  if (!db) return res.status(200).json({ success: false });
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    let currentSavings = 0;
    if (doc.exists) currentSavings = doc.data().savings || 0;
    await userRef.set({ savings: currentSavings + amount }, { merge: true });
    res.json({ success: true, savings: currentSavings + amount });
  } catch (error) {
    console.error('Savings update error:', error.message);
    res.status(500).json({ error: 'Failed to update savings' });
  }
});

// ─── POST /api/analyze ───
app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage', userId, budget = 5000, productName, manualPrice } = req.body;

  if (!url && !productName) {
    return res.status(400).json({ error: 'URL or Product Name is required to perform an analysis.' });
  }

  // Pre-extract product name from URL for fallback use
  const suggestedProductName = url ? extractProductNameFromUrl(url) : null;

  try {
    console.log(`\n→ Starting analyze | URL: ${url} | Vibe: ${vibe} | Budget: ₹${budget}`);

    // ─── Step A: Scraping Strategy ───
    let markdownText = '';
    let scrapeSuccess = false;
    let isManualMode = false;

    if (productName && manualPrice) {
      // ── Manual Fallback Mode ──
      console.log('→ Manual mode active. Skipping scrape.');
      markdownText = `[MANUAL ENTRY - Treat as verified data]
Product Name: ${productName}
Price: ₹${manualPrice}
Note: The user manually provided these details because the retailer blocked the scraper. Analyze with full confidence.`;
      scrapeSuccess = true;
      isManualMode = true;

    } else {
      // ── Strategy 1: Jina Reader with full stealth ──
      const jinaAttempt = async (proxyRegion) => {
        const stealthHeaders = buildStealthHeaders();
        const response = await axios.get(`https://r.jina.ai/${url}`, {
          headers: {
            ...stealthHeaders,
            'Accept': 'application/json',
            'X-Return-Format': 'markdown',
            'X-Proxy-Location': proxyRegion,   // Jina proxy region header
            'X-Proxy': 'residential',            // Request residential proxy pool
            'X-Wait-For': 'networkidle',         // Wait for JS to finish rendering
            'X-With-Generated-Alt': 'true',      // Generate alt text for images
            'X-Remove-Selector': 'nav,footer,header,script,style,#nav-belt', // Clean output
            'Authorization': `Bearer ${process.env.ANAKIN_API_KEY || ''}`,
          },
          timeout: 45000,
          validateStatus: (status) => status < 500, // Don't throw on 4xx so we can check status
        });

        // Smart 403/429 detection — signal caller to retry with different region
        if (response.status === 403 || response.status === 429) {
          const err = new Error(`HTTP ${response.status} - Blocked by retailer`);
          err.status = response.status;
          err.isBlocked = true;
          throw err;
        }

        let text = '';
        if (typeof response.data === 'string') text = response.data;
        else if (response.data?.data?.content) text = response.data.data.content;
        else text = JSON.stringify(response.data);
        return text;
      };

      // Attempt 1 — US proxy
      try {
        console.log('→ Strategy 1: Jina Reader (US proxy)...');
        markdownText = await jinaAttempt('us');
        const v1 = validateScrapedContent(markdownText);

        if (!v1.valid) {
          console.warn(`→ Attempt 1 invalid (${v1.reason}). Retrying with GB proxy in 2s...`);
          await new Promise(r => setTimeout(r, 2000));
          console.log('→ Strategy 1: Jina Reader (GB proxy retry)...');
          markdownText = await jinaAttempt('gb');
          const v2 = validateScrapedContent(markdownText);
          if (v2.valid) {
            scrapeSuccess = true;
            console.log(`→ Jina GB proxy success (${markdownText.length} chars)`);
          } else {
            console.warn(`→ GB proxy also invalid: ${v2.reason}`);
            markdownText = '';
          }
        } else {
          scrapeSuccess = true;
          console.log(`→ Jina US proxy success (${markdownText.length} chars)`);
        }

      } catch (jinaError) {
        if (jinaError.isBlocked) {
          // Smart retry: switch region on 403/429
          console.warn(`→ Jina blocked (${jinaError.message}). Retrying with IN proxy in 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          try {
            console.log('→ Strategy 1: Jina Reader (IN proxy — 403/429 retry)...');
            markdownText = await jinaAttempt('in');
            const v3 = validateScrapedContent(markdownText);
            if (v3.valid) {
              scrapeSuccess = true;
              console.log(`→ Jina IN proxy success after block (${markdownText.length} chars)`);
            } else {
              console.warn('→ IN proxy retry also blocked/invalid.');
              markdownText = '';
            }
          } catch (retryError) {
            console.warn('→ IN proxy retry failed:', retryError.message);
          }
        } else {
          console.warn('→ Jina Reader failed:', jinaError.message);
        }
      }

      // ── Strategy 2: Direct fetch with stealth headers ──
      if (!scrapeSuccess) {
        try {
          console.log('→ Strategy 2: Direct fetch with stealth headers...');
          const directResponse = await axios.get(url, {
            headers: buildStealthHeaders(),
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: (s) => s < 500,
          });

          if (directResponse.status === 403 || directResponse.status === 429) {
            console.warn(`→ Direct fetch blocked (HTTP ${directResponse.status})`);
          } else {
            const html = typeof directResponse.data === 'string' ? directResponse.data : '';
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const priceMatch = html.match(/₹[\s]?[\d,]+\.?\d*/g) || html.match(/Rs\.?\s?[\d,]+\.?\d*/gi);
            const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
            const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
            const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);

            const parts = [];
            if (ogTitle) parts.push(`Product Title: ${ogTitle[1].trim()}`);
            else if (titleMatch) parts.push(`Product Title: ${titleMatch[1].trim()}`);
            if (metaDesc) parts.push(`Description: ${metaDesc[1].trim()}`);
            if (priceMatch) parts.push(`Prices found: ${priceMatch.join(', ')}`);
            if (ogImage) parts.push(`Image URL: ${ogImage[1].trim()}`);

            if (parts.length > 0) {
              markdownText = parts.join('\n');
              scrapeSuccess = true;
              console.log(`→ Direct fetch extracted ${parts.length} data points`);
            }
          }
        } catch (directError) {
          console.warn('→ Direct fetch failed:', directError.message);
        }
      }

      // ── Strategy 3: URL slug inference (last resort) ──
      if (!scrapeSuccess) {
        console.log('→ Strategy 3: URL slug inference (last resort)...');
        const inferredName = suggestedProductName || 'Unknown product';
        markdownText = `Product URL: ${url}
Inferred Product Name: ${inferredName}
Note: All scraping strategies were blocked. Use your general knowledge about this product based on the URL and inferred name. Make a realistic assessment.`;
        console.log(`→ Inferred product from URL: "${inferredName}"`);
      }
    }

    // ── Markdown Cleaning ──
    if (markdownText && !isManualMode) {
      markdownText = markdownText
        .replace(/<[^>]*>?/gm, '')                        // Strip HTML tags
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')        // Strip markdown links
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')         // Strip images
        .replace(/\n{3,}/g, '\n\n')                        // Collapse whitespace
        .trim();
    }

    // ─── Step B: Gemini Analysis ───
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const enablerPersona = "You are 'Impulse.ai', a toxic financial enabler and shopping bestie. Your goal is to make the girlMath genius and the realityCheck mild. Convince the user that every item is an 'investment' or basically 'free'. Find creative financial justification for every purchase.";

    const savagePersona = "You are 'Impulse.ai', a brutalist shopping assistant with zero chill. Your goal is to roast the user's life choices with Gen-Z wit, judgmental punchy lines, and Indian cultural references (INR, chai analogies, frugal aunty energy). Be savage but make it fashion.";

    const basePersona = vibe === 'Enabler' ? enablerPersona : savagePersona;

    const manualModeInstruction = isManualMode
      ? `\nCRITICAL: The product data was provided MANUALLY by the user because the retailer blocked our scraper. Treat the provided name and price as VERIFIED FACTS. Perform the analysis with the EXACT SAME savage/enabler persona as if the data was freshly scraped. Do NOT be more lenient or less creative because it's manual data. Full roast mode activated.`
      : '';

    const systemInstruction = `${basePersona}${manualModeInstruction}

Analyze the provided product data and URL. Factor in the user's monthly budget: ₹${budget}. If the product price is a significant % of the budget, be extra savage (or extra convincing if Enabler mode).

GUARDRAIL: If product data is incomplete or scraping failed, infer the product from the URL slug and your general knowledge. Make realistic estimates. NEVER use impulseScore=100 or sustainabilityScore=100 for unverified products.

Return ONLY a valid JSON object matching this EXACT schema:
{
  "productName": "string",
  "productImage": "string (real URL from scraped data, or null)",
  "price": "string (with ₹ symbol)",
  "verdict": "BUY IT" | "DROP IT",
  "impulseScore": number (1-100),
  "girlMath": "string (one savage/creative line)",
  "realityCheck": "string (punchy, Gen-Z truth bomb)",
  "prosCons": ["string", "string", "string"],
  "sustainabilityScore": number (1-100),
  "waitTimeRecommendation": "string (e.g., Wait 48 hours before buying)"
}

CRITICAL RULES:
1. NO markdown, NO backticks, NO code fences. Return raw JSON only.
2. Tone: Gen-Z, witty, slightly judgmental, culturally Indian.
3. If scraped text is blocked/generic, guess the product from URL slug.
4. Image URL: extract from scraped data. If no image is found, return null.
5. sustainabilityScore: 30-70 for average products. Not 100 unless explicitly eco-certified.
6. NEVER return "Error Connecting" as productName or "???" as price.
7. price must always include ₹ symbol or "₹ Check retailer" if unknown.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemInstruction,
    });

    const promptText = `URL: ${url || 'N/A (manual entry)'}
Scrape Status: ${scrapeSuccess ? (isManualMode ? 'MANUAL_ENTRY' : 'SUCCESS') : 'FAILED'}

Product Data:
${markdownText.substring(0, 8000)}`;

    console.log('→ Sending to Gemini...');
    const result = await model.generateContent(promptText);
    const aiResponseString = result.response.text();

    // ── Robust JSON extraction ──
    let cleanJson = aiResponseString.trim();
    // Strip markdown code fences if Gemini adds them despite instructions
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    if (cleanJson.includes('{')) {
      cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
    }

    let parsedResult = JSON.parse(cleanJson);

    // ── Post-processing Guardrails ──
    // Sanitize image URL
    if (!parsedResult.productImage ||
        parsedResult.productImage === 'null' ||
        parsedResult.productImage.includes('undefined') ||
        parsedResult.productImage === 'N/A' ||
        parsedResult.productImage === '' ||
        parsedResult.productImage.includes('pollinations.ai')) {
      // Return null so the frontend can display a clean, branded "Manual Entry" placeholder
      // instead of a hallucinated, irrelevant AI image.
      parsedResult.productImage = null;
    }

    // Cap unrealistic scores for unverified scrapes
    if (!scrapeSuccess || (!isManualMode && markdownText.includes('blocked'))) {
      if (parsedResult.impulseScore === 100) parsedResult.impulseScore = 72;
      if (parsedResult.sustainabilityScore === 100) parsedResult.sustainabilityScore = 45;
    }

    // Ensure price is always meaningful
    if (!parsedResult.price || parsedResult.price === '???' || parsedResult.price === '') {
      parsedResult.price = '₹ Check retailer';
    }

    // ── Step C: Save to Firestore ──
    if (db && userId) {
      try {
        await db.collection('history').add({
          userId,
          url: url || null,
          ...parsedResult,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('→ Saved to Firestore for user:', userId);
      } catch (firestoreError) {
        console.warn('→ Firestore save failed:', firestoreError.message);
      }
    }

    console.log('→ Analysis complete ✅\n');
    res.json(parsedResult);

  } catch (error) {
    console.error('→ Pipeline Error:', error.message);

    // Return explicit error flag with URL-extracted product name for frontend pre-fill
    res.status(200).json({
      error: 'SCRAPER_BLOCKED',
      suggestedProductName: suggestedProductName,   // ← Pre-fill magic
      productName: suggestedProductName || 'Retailer Shield Detected',
      productImage: null,
      price: '₹ Unavailable',
      verdict: 'TRY AGAIN',
      impulseScore: 0,
      girlMath: "Even our stealth AI couldn't slip past their firewall. Respect. Kind of.",
      realityCheck: error.message?.includes('API_KEY')
        ? '⚠️ Gemini API key issue detected. Check your .env file!'
        : 'The scraper got blocked. This retailer has serious trust issues. Try manual entry below 👇',
      prosCons: ['Their security team is top-notch', 'Your wallet is temporarily safe', 'Manual entry is your friend'],
      sustainabilityScore: 0,
      waitTimeRecommendation: 'Enter details manually and roast away',
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Impulse.ai Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/\n`);
});
