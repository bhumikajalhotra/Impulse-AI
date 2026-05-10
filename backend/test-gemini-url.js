import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
dotenv.config({ path: '../.env' });
async function run() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const url = "https://www.amazon.in/dp/B01H7B91G0";
        const markdownText = "To discuss automated access to Amazon data please contact...";
        const prompt = `Analyze this product. URL: ${url}\n\nScraped Text: ${markdownText}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are Impulse.ai. Return ONLY raw JSON matching { productName, productImage, price, verdict, impulseScore, girlMathJustification, realityCheck, prosCons }. If the scraped text says access is blocked, STILL return a valid JSON. Guess the product from the URL slug if possible. Make up a funny price if missing."
            }
        });
        console.log(response.text);
    } catch(e) {
        console.error("error:", e);
    }
}
run();
