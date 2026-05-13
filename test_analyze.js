async function testBackend() {
  console.log("Testing Backend Segments...");
  const API_URL = 'http://localhost:5001/api/analyze';

  try {
    // 1. Test invalid/blocked URL without fallback
    console.log("\\n--- Test 1: Simulating Scraper Block ---");
    const res1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: "https://www.amazon.in/dp/B0BQRJ84G3" })
    });
    
    const data1 = await res1.json();
    console.log("Status:", res1.status);
    console.log("Result:", data1.error || data1.verdict);
    
    if (data1.error === "SCRAPER_BLOCKED" || data1.verdict === "TRY AGAIN") {
      console.log("✅ Fallback triggered successfully.");
    } else {
      console.log("⚠️ Fallback not triggered (maybe scraper worked).");
    }

    // 2. Test manual fallback logic
    console.log("\\n--- Test 2: Manual Fallback Mode ---");
    const res2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: "https://www.amazon.in/dp/B0BQRJ84G3",
        productName: "Apple iPhone 14 Pro",
        manualPrice: "120000"
      })
    });

    const data2 = await res2.json();
    console.log("Status:", res2.status);
    console.log("Product Name:", data2.productName);
    console.log("Price:", data2.price);
    console.log("Verdict:", data2.verdict);
    
    if (data2.productName && !data2.error) {
       console.log("✅ Manual fallback processed successfully.");
    }

  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

testBackend();
