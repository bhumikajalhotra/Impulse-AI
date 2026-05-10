import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: '*' }));
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const basePersona = vibe === 'Enabler' 
      ? "You are 'Impulse.ai', a toxic financial enabler and shopping bestie. Your goal is to make the girlMath genius and the realityCheck mild. Convince the user that every item is an 'investment' or basically 'free'."
      : "You are 'Impulse.ai', a brutalist shopping assistant. Your goal is to make the girlMath sarcastic and the realityCheck brutal. Roast the user's life choices with Gen-Z wit and judgmental punchy lines. Use Indian context (INR/Chai references) where appropriate.";

    const systemInstruction = `${basePersona}
Analyze the provided product data and URL.
Return ONLY a valid JSON object matching this EXACT schema: 
{ 
  "productName": "string", 
  "productImage": "string", 
  "price": "string", 
  "verdict": "BUY IT" | "DROP IT", 
  "impulseScore": number (1-100), 
  "girlMath": "string", 
  "realityCheck": "string", 
  "prosCons": ["string", "string", "string"] 
}
CRITICAL RULES:
1. NO markdown formatting or backticks around the JSON. Return raw text only.
2. Tone: Gen-Z, witty, slightly judgmental, and punchy. Use INR/Chai references for Indian context.
3. If the scraped text says access is blocked, guess the product based on the URL slug. NEVER return a generic error.
4. Find the REAL product image URL. If you absolutely cannot find a real image, return a URL in this format: 'https://image.pollinations.ai/prompt/{product_name_or_category}?width=400&height=400&nologo=true'.
5. Ensure 'prosCons' is strictly an Array of strings.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
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
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJson);
      // Ensure prosCons is an array
      if (!Array.isArray(parsedResult.prosCons)) {
        parsedResult.prosCons = ["Saves you money", "High quality", "Limited time offer"];
      }
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
      girlMath: "We couldn't reach the store. The universe is telling you to save your money. It's basically free if you don't buy it!",
      realityCheck: "The store blocked our scraper. It's a sign. Don't buy it. Go have some chai instead.",
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
