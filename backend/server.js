import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Import services
import { scrapeProduct, extractNameFromUrl } from './services/scraperService.js';
import { parseProductHTML } from './services/parserService.js';
import { generateRoast } from './services/aiService.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize Firebase (Optional/Silent failure)
if (!admin.apps.length) {
  try { admin.initializeApp({ credential: admin.credential.applicationDefault() }); } catch (e) {}
}
const db = admin.apps.length ? admin.firestore() : null;

app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage', userId, budget = 5000, productName, manualPrice } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  try {
    console.log(`[Analyze] Processing: ${url}`);
    
    // 1. Attempt Scrape
    const html = await scrapeProduct(url);
    
    // 2. Task 2: Silent Fallback Logic
    let productData;
    let isFallback = false;

    if (html && html.length > 500) {
      productData = parseProductHTML(html, url);
    }

    // Check if we actually got a title, if not, trigger fallback
    if (!productData?.title) {
      console.warn(`[Analyze] Scraper blocked or failed. Using Fallback.`);
      const extractedName = productName || extractNameFromUrl(url);
      isFallback = true;
      productData = {
        title: extractedName || 'Mysterious Item',
        price: manualPrice ? (manualPrice.toString().startsWith('₹') ? manualPrice : `₹${manualPrice}`) : '₹ Estimated Price', // Task 2 requirement
        rawText: `The scraper was blocked. Extracting from ${productName ? 'manual inputs' : 'URL'}: ${extractedName}. Guess its market price and roast it based on current 2026 trends.`,
        platform: new URL(url).hostname.replace('www.', ''),
        image: null,
      };
    }

    // 3. Generate AI Roast
    const roastData = await generateRoast(productData, vibe, budget);

    // Merge fallback flags
    const finalResult = {
      ...roastData,
      originalUrl: url,
      isFallback
    };

    // Save to History
    if (db && userId) {
      await db.collection('history').add({ 
        userId, ...finalResult, timestamp: admin.firestore.FieldValue.serverTimestamp() 
      }).catch(() => {});
    }

    res.json(finalResult);
  } catch (error) {
    console.error("[Analyze Error]:", error);
    res.status(500).json({ error: 'Failed to analyze.' });
  }
});

app.post('/api/argue', async (req, res) => {
  try {
    const { excuse, productContext } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Destroy this excuse in lowercase sass: "${excuse}" for "${productContext.productName}". 2 sentences max.`;
    const result = await model.generateContent(prompt);
    res.json({ rebuttal: result.response.text().trim() });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
