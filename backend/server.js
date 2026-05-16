import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Import new services
import { scrapeProduct } from './services/scraperService.js';
import { parseProductHTML } from './services/parserService.js';
import { generateRoast } from './services/aiService.js';

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
const UA_POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.207 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

const getRandomUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

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

const extractProductNameFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const noiseWords = new Set(['dp', 'p', 'gp', 'product', 'buy', 'item', 'products', 'collections', 'category', 'search', 'store', 'ref', 'offer', 'listing', 'detail']);
    const candidateParts = pathParts.filter(p => {
      if (p.length < 4) return false;
      if (/^[A-Z0-9]{8,}$/.test(p)) return false;
      if (/^[a-f0-9]{8,}$/i.test(p)) return false;
      if (noiseWords.has(p.toLowerCase())) return false;
      if (/^\d+$/.test(p)) return false;
      return true;
    });
    if (candidateParts.length === 0) return null;
    const bestPart = candidateParts.sort((a, b) => b.length - a.length)[0];
    return bestPart.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  } catch { return null; }
};

const validateScrapedContent = (text) => {
  if (!text || text.length < 200) return { valid: false, reason: 'Content too short' };
  const blockedKeywords = ['captcha', 'robot', 'blocked', 'access denied', 'enable javascript', 'verify you are human', 'please verify', 'unusual traffic', 'bot detection'];
  const lowerText = text.toLowerCase();
  for (const keyword of blockedKeywords) {
    if (lowerText.includes(keyword)) return { valid: false, reason: `Blocked: contains "${keyword}"` };
  }
  return { valid: true };
};

app.get('/', (req, res) => res.send('Impulse.ai Backend is running! 🚀'));

app.get('/api/history/:userId', async (req, res) => {
  if (!db) return res.status(200).json([]);
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('history').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(10).get();
    const history = [];
    snapshot.forEach(doc => history.push(doc.data()));
    res.json(history);
  } catch (error) { res.status(200).json([]); }
});

app.get('/api/user/:userId/savings', async (req, res) => {
  if (!db) return res.status(200).json({ savings: 0 });
  try {
    const { userId } = req.params;
    const doc = await db.collection('users').doc(userId).get();
    res.json({ savings: doc.exists ? (doc.data().savings || 0) : 0 });
  } catch (error) { res.status(200).json({ savings: 0 }); }
});

app.post('/api/user/:userId/savings', async (req, res) => {
  if (!db) return res.status(200).json({ success: false });
  try {
    const { userId } = req.params;
    const { amount } = req.body;
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    let currentSavings = doc.exists ? (doc.data().savings || 0) : 0;
    await userRef.set({ savings: currentSavings + amount }, { merge: true });
    res.json({ success: true, savings: currentSavings + amount });
  } catch (error) { res.status(500).json({ error: 'Failed to update savings' }); }
});

app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage', userId, budget = 5000, productName, manualPrice } = req.body;
  if (!url && !productName) return res.status(400).json({ error: 'URL or Product Name is required.' });

  try {
    let productData = { title: productName, price: manualPrice, rawText: '', platform: 'Manual Entry', image: null };
    let isManualMode = !!(productName && manualPrice);

    if (!isManualMode) {
      // 1. Scrape HTML (Multi-layer)
      const html = await scrapeProduct(url);
      
      // 2. Parse HTML safely
      productData = parseProductHTML(html, url);
      
      // Fallbacks if scraping yielded literally nothing
      if (!productData.title && !productData.rawText) {
         throw new Error('SCRAPER_BLOCKED_COMPLETELY');
      }
    }

    // 3. Generate AI Roast using Gemini structured schema
    const roastData = await generateRoast(productData, vibe, budget);

    // 4. Merge image fallback if needed
    if (!roastData.product.image && productData.image) {
      roastData.product.image = productData.image;
    }

    // Prepare final payload for frontend and DB
    const finalResult = {
      ...roastData,
      originalUrl: url || null,
      isManualMode
    };

    if (db && userId) {
      await db.collection('history').add({ 
        userId, 
        ...finalResult, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
    }

    res.json(finalResult);
  } catch (error) {
    console.error("[Analyze Error]:", error);
    res.status(200).json({
      error: 'SCRAPER_BLOCKED',
      message: 'Retailer aggressively blocked our scraper layers.',
      suggestedProductName: url ? new URL(url).pathname.split('/').pop() : 'Unknown Item'
    });
  }
});

app.post('/api/argue', async (req, res) => {
  try {
    const { excuse, productContext } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a gatekeeping financial bestie from 2030. Destroy this excuse in lowercase sass: "${excuse}" for buying "${productContext.productName}". Be ruthless. 2 short sentences. No markdown.`;
    const result = await model.generateContent(prompt);
    res.json({ rebuttal: result.response.text().trim() });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.listen(PORT, () => console.log(`🚀 Impulse.ai Backend running on port ${PORT}`));
