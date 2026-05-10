import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '../.env' });

async function run() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not found in .env");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const systemInstruction = "You are Impulse.ai. Return ONLY raw JSON matching { productName, productImage, price, verdict, impulseScore, girlMath, realityCheck, prosCons }. If the scraped text says access is blocked, STILL return a valid JSON. Guess the product from the URL slug if possible. Make up a funny price if missing.";
        
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction
        });

        const url = "https://www.amazon.in/dp/B01H7B91G0";
        const markdownText = "To discuss automated access to Amazon data please contact...";
        const prompt = `Analyze this product. URL: ${url}\n\nScraped Text: ${markdownText}`;
        
        console.log("-> Testing Gemini URL inference...");
        const result = await model.generateContent(prompt);
        console.log("-> AI Output:", result.response.text());
        
    } catch(e) {
        console.error("-> Error:", e.message);
    }
}

run();
