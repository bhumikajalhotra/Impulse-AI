import axios from 'axios';
async function run() {
    try {
        const url = "https://www.amazon.in/dp/B01H7B91G0";
        const scrapeResponse = await axios.get(`https://r.jina.ai/${url}`);
        console.log("Success length:", scrapeResponse.data.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
