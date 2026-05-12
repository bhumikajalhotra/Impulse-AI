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

// Health check
app.get('/', (req, res) => {
  res.send('Impulse.ai Backend is running!');
});

// GET /api/history/:userId
app.get('/api/history/:userId', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  
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
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage', userId, budget = 5000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required to perform an analysis.' });
  }

  try {
    console.log(`-> Starting scrape for URL: ${url} | Vibe: ${vibe} | Budget: ${budget}`);
    
    // Step A: Scrape using Jina Reader
    let markdownText = "";
    try {
      const scrapeResponse = await axios.get(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (typeof scrapeResponse.data === 'string') {
          markdownText = scrapeResponse.data;
      } else if (scrapeResponse.data?.data?.content) {
          markdownText = scrapeResponse.data.data.content;
      } else {
          markdownText = JSON.stringify(scrapeResponse.data);
      }
    } catch (scrapeError) {
      console.warn("-> Jina Reader failed to scrape. Falling back to URL inference.");
    }

    // Step B: Analyze with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const basePersona = vibe === 'Enabler' 
      ? "You are 'Impulse.ai', a toxic financial enabler and shopping bestie. Your goal is to make the girlMath genius and the realityCheck mild. Convince the user that every item is an 'investment' or basically 'free'."
      : "You are 'Impulse.ai', a brutalist shopping assistant. Your goal is to make the girlMath sarcastic and the realityCheck brutal. Roast the user's life choices with Gen-Z wit and judgmental punchy lines. Use Indian context (INR/Chai references) where appropriate.";

    const systemInstruction = `${basePersona}
Analyze the provided product data and URL.
Factor in the user's monthly budget: ₹${budget}. If the product price is a large % of the budget, be extra savage.

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
3. If the scraped text says access is blocked, guess the product based on the URL slug.
4. Find the REAL product image URL. Fallback: 'https://image.pollinations.ai/prompt/{product_name}?width=400&height=400&nologo=true'.
5. sustainabilityScore: Rate how eco-friendly/durable the item is.
6. waitTimeRecommendation: Tell them how long they should sit on this impulse.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const promptText = `URL: ${url}\n\nScraped Text:\n${markdownText}`;

    const result = await model.generateContent(promptText);
    const aiResponseString = result.response.text();

    // Robust JSON Extraction
    let cleanJson = aiResponseString.trim();
    if (cleanJson.includes('{')) {
      cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
    }
    
    let parsedResult = JSON.parse(cleanJson);
    
    // Step C: Save to Firestore if userId is present
    if (db && userId) {
      await db.collection('history').add({
        userId,
        url,
        ...parsedResult,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("-> Saved to Firestore for user:", userId);
    }

    console.log("-> Analysis complete.");
    res.json(parsedResult);
  } catch (error) {
    console.error("Pipeline Error:", error.message);
    res.status(200).json({
      productName: "Error Connecting",
      productImage: "https://image.pollinations.ai/prompt/abstract%20shopping%20error?width=400&height=400&nologo=true",
      price: "???",
      verdict: "DROP IT",
      impulseScore: 100,
      girlMath: "The universe is telling you to save your money.",
      realityCheck: "Scraper blocked. Don't buy it. Go have some chai.",
      prosCons: ["Saves you money", "Protects your data"],
      sustainabilityScore: 100,
      waitTimeRecommendation: "Wait forever"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
