import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '../.env' });

async function run() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not found in .env");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log("-> Testing Gemini connection...");
        const result = await model.generateContent("Hello! Are you working?");
        console.log("-> Response:", result.response.text());

    } catch (e) {
        console.error("-> Error:", e.message);
    }
}

run();
