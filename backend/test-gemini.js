import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
dotenv.config({ path: '../.env' });
async function run() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: "test"
        });
        console.log(response.text);
    } catch(e) {
        console.error("error:", e);
    }
}
run();
