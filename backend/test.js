import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
    try {
        console.log("Scraping...");
        const scrapeResponse = await axios.post(
            'https://api.anakin.io/scrape',
            { url: "https://www.amazon.in/dp/B01H7B91G0", format: 'markdown', useBrowser: true },
            { headers: { 'Authorization': `Bearer ${process.env.ANAKIN_API_KEY}`, 'Content-Type': 'application/json' } }
        );
        const markdownText = typeof scrapeResponse.data === 'string' ? scrapeResponse.data : JSON.stringify(scrapeResponse.data);
        console.log("Scrape success. Length:", markdownText.length);
        
        console.log("Calling Gemini...");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: markdownText,
            config: {
                systemInstruction: "You are Impulse.ai...",
            }
        });
        console.log("Gemini success:", response.text);
    } catch (e) {
        console.error("Error:", e?.response?.data || e.message);
    }
}
run();
