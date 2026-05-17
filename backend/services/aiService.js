import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateRoast = async (productData, vibe, budget = 5000) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const basePersona = `You are an elite, gatekeeping financial bestie from the year 2030. You speak in lowercase with maximum sass. You don't use 'AI' language. You use 'Aura' language. You are currently in '${vibe}' mode. 
  If vibe is 'Enabler', be a total girl-math genius who justifies everything.
  If vibe is 'Middle Child', be skeptical but fair.
  If vibe is 'Savage', be absolutely ruthless. Emotional damage only.`;

  const systemInstruction = `${basePersona}
  
  Analyze this product for a user with a ₹${budget} monthly budget.
  Return ONLY a raw JSON object matching this schema exactly:
  {
    "product": {
      "title": "Cleaned up product name",
      "price": "Formatted price with ₹ (e.g. ₹4,999)",
      "category": "Broad category (e.g. Tech, Fashion)",
      "verdict": "cooked." | "locked in." | "delulu."
    },
    "score": {
      "total": Number between 0-100 (100 = critical danger to wallet),
      "eco": Number between 0-100 (sustainability score)
    },
    "savageVerdict": [
      "Short punchy truth bomb 1",
      "Short punchy truth bomb 2"
    ],
    "girlMathVerdict": [
      "Unhinged girl math justification 1",
      "Unhinged girl math justification 2"
    ],
    "moneyComparison": [
      "This equals 17 iced coffees.",
      "You could have bought 4 days of groceries."
    ],
    "memeQuotes": [
      "your bank account just flinched.",
      "therapy is cheaper than this."
    ],
    "mascotMood": "disgusted" | "shocked" | "laughing" | "judging" | "enabling"
  }

  RULES:
  1. No markdown formatting, no backticks, ONLY valid JSON.
  2. product.verdict must be exactly one of the 3 specified options.
  3. mascotMood must be exactly one of the 5 specified options.
  4. Calculations in moneyComparison and girlMathVerdict must be specific to the item's price.
  5. Speak in lowercase sass everywhere.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction,
  });

  const promptContext = `
  Product Link Context:
  Platform: ${productData.platform}
  Extracted Title: ${productData.title}
  Extracted Price: ${productData.price || 'Unknown'}
  Raw Context Text (Excerpt): ${productData.rawText.substring(0, 2000)}
  `;

  const result = await model.generateContent(promptContext);
  const text = result.response.text();
  
  // Extract JSON from anywhere in the string, ignoring markdown blocks or conversational text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : text;
  
  try {
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (err) {
    console.error("[AI Error] Failed to parse Gemini JSON:", cleanJson);
    
    // Attempt extreme fallback if JSON fails
    return {
      product: {
        title: productData.title || "Unknown Item",
        price: productData.price || "₹ Unavailable",
        category: "General",
        verdict: "cooked."
      },
      score: { total: 80, eco: 0 },
      savageVerdict: ["Your logic is flawed.", "Please don't buy this."],
      girlMathVerdict: ["It's free if you don't look at your bank account."],
      moneyComparison: ["This costs more than a decent meal."],
      memeQuotes: ["bruh 💀"],
      mascotMood: "judging"
    };
  }
};
