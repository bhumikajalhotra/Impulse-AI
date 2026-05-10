import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
    try {
        const scrapeResponse = await axios.post(
            'https://api.anakin.io/v1/scrape',
            { url: "https://www.amazon.in/dp/B01H7B91G0", format: 'markdown', useBrowser: true },
            { headers: { 'Authorization': `Bearer ${process.env.ANAKIN_API_KEY}`, 'Content-Type': 'application/json' } }
        );
        console.log("Success:", Object.keys(scrapeResponse.data));
    } catch (e) {
        console.error("Error:", e?.response?.data || e.message);
    }
}
run();
