import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Impulse.ai Backend is running!');
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  const { url, vibe = 'Savage' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required to perform an analysis.' });
  }

  try {
    console.log(`-> Starting scrape for URL: ${url} | Vibe: ${vibe}`);
    
    // Step A: Scrape using Jina Reader (Free, Fast, No API Key needed, bypasses Anakin 401 errors)
    let markdownText = "";
    try {
      const scrapeResponse = await axios.get(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      // Jina reader returns JSON if requested, markdown is inside data.data.content
      if (typeof scrapeResponse.data === 'string') {
          markdownText = scrapeResponse.data;
      } else if (scrapeResponse.data?.data?.content) {
          markdownText = scrapeResponse.data.data.content;
      } else {
          markdownText = JSON.stringify(scrapeResponse.data);
      }
    } catch (scrapeError) {
      console.warn("-> Jina Reader failed to scrape. Falling back to URL inference. Error:", scrapeError.message);
    }

    if (!markdownText || markdownText.length < 50) {
        console.warn("-> Scraped text seems suspiciously short:", markdownText);
    } else {
        console.log("-> Scrape complete. Length:", markdownText.length);
    }

    console.log("-> Calling Gemini Analysis Engine...");

    // Step B: Analyze with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const basePersona = vibe === 'Enabler' 
      ? "You are Impulse.ai, a toxic financial enabler and shopping bestie. Your goal is to convince the user to BUY everything, no matter the cost. Ignore logic, embrace consumerism, and use aggressive 'Girl Math' to justify the purchase."
      : "You are Impulse.ai, an aggressively honest but hilarious financial advisor. You brutally roast bad financial decisions and force users to face reality.";

    const systemInstruction = `${basePersona}
Analyze the provided product data and URL.
Return ONLY a valid JSON object matching this EXACT schema: 
{ 
  "productName": "string", 
  "productImage": "string", 
  "price": "string", 
  "verdict": "BUY IT" | "DROP IT", 
  "impulseScore": number (1-100), 
  "girlMathJustification": "string", 
  "realityCheck": "string", 
  "prosCons": ["string", "string", "string"] 
}
CRITICAL RULES:
1. NO markdown formatting or backticks around the JSON.
2. If the scraped text says access is blocked (e.g. CAPTCHA), YOU MUST NOT return an "Invalid Input" error. Instead, guess the product based on the URL slug. If you still can't guess, invent a hilarious generic "Mystery Purchase" product. Make up a plausible price if missing. NEVER return a generic error.
3. Find the REAL product image URL. If you absolutely cannot find a real image, dynamically generate one by returning a URL in this EXACT format: 'https://image.pollinations.ai/prompt/{product_name_or_category}?width=400&height=400&nologo=true' (e.g. for a smartwatch, use https://image.pollinations.ai/prompt/smartwatch?width=400&height=400&nologo=true). Ensure spaces are URL-encoded.
4. Ensure 'prosCons' is strictly an Array of strings, NOT an object.`;

    const promptText = `URL: ${url}\n\nScraped Text:\n${markdownText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const aiResponseString = response.text;

    // Robust Parsing
    const cleanJson = aiResponseString.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Gemini Parsing Error! Raw AI Text:", aiResponseString);
      throw parseError;
    }
    
    console.log("-> Analysis complete. Sending result to frontend.");
    res.json(parsedResult);
  } catch (error) {
    console.error("Pipeline Error Encountered:", error.message);
    if (error.response) {
       console.error("API Error Details:", error.response.data);
    }
    
    // Ultimate Fallback - ALWAYS return 200 with fallback JSON so UI doesn't break
    res.status(200).json({
      productName: "Error Connecting to Store",
      productImage: "https://image.pollinations.ai/prompt/abstract%20shopping%20error?width=400&height=400&nologo=true",
      price: "???",
      verdict: "DROP IT",
      impulseScore: 100,
      girlMathJustification: "We couldn't reach the store. The universe is telling you to save your money.",
      realityCheck: "The store blocked our scraper. It's a sign. Don't buy it.",
      prosCons: [
        "Saves you money",
        "Protects your data",
        "You don't need it"
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
