// Promise queue to prevent hitting rate limits during rapid scrolling
let apiQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_TEXT') {
    apiQueue = apiQueue
      .then(() => runHybridDetectionEngine(request.payload))
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
      
    return true; // Indicates asynchronous response
  }
});

async function runHybridDetectionEngine(text) {
  // ----------------------------------------------------
  // LEVEL 1: Local Heuristic Rules (Executes in < 10ms)
  // ----------------------------------------------------
  const scamPatterns = [
    /(100%|guaranteed|earn money fast|passive income secret|crypto gem)/gi,
    /(they don’t want you to know|doctors hate|shocking truth)/gi,
    /(miracle cure|instantly lose weight|never sick again)/gi
  ];

  let ruleTriggered = false;
  for (const regex of scamPatterns) {
    if (regex.test(text)) {
      ruleTriggered = true;
      break;
    }
  }

  // ----------------------------------------------------
  // LEVEL 2 & 3: Deep AI Analysis & Verification Extraction
  // ----------------------------------------------------
  // Only query the API if a heuristic rule is triggered OR the text is substantial
  if (ruleTriggered || text.length > 100) {
    return await queryGeminiAPI(text);
  }

  // If short and passes local rules, it's safe
  return { is_suspicious: false };
}

async function queryGeminiAPI(text) {
  const { geminiApiKey } = await chrome.storage.local.get(['geminiApiKey']);
  if (!geminiApiKey) throw new Error("API Key not configured.");

  // An array of models to try, in order of preference
  const models = [
    'gemini-3.1-flash-lite-preview', // Try the fastest, lightest model first
    'gemini-2.5-flash-lite',    // Fallback to standard flash
    'gemini-2.5-flash'       // Ultimate fallback
  ];

  const systemPrompt = `Analyze this text for misleading, exaggerated, or unverified claims. 
  Focus on: 1. Financial scams, 2. Unverified health claims, 3. False authority.
  Return ONLY a valid JSON object matching this exact schema:
  {
    "is_suspicious": boolean,
    "confidence": 0.0 to 1.0,
    "category": "string",
    "reasoning": "string",
    "flagged_phrase": "string"
  }
  Text to analyze: "${text}"`;

  for (const model of models) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.1 } 
        })
      });

      const data = await response.json();

      // If we get a 503 (High Demand) or 429 (Rate Limit), catch it and loop to the next model
      if (data.error && (data.error.code === 503 || data.error.code === 429)) {
        console.warn(`${model} is busy, failing over to next model...`);
        continue; 
      }

      if (data.error) {
        console.error("API Error:", data.error.message);
        return { is_suspicious: false };
      }

      let rawJsonText = data.candidates[0].content.parts[0].text;
      rawJsonText = rawJsonText.replace(/```json|```/g, "").trim();
      return JSON.parse(rawJsonText);

    } catch (error) {
      console.error(`Failed to reach ${model}:`, error);
      // Let the loop continue to the next model
    }
  }

  // If ALL models fail
  console.error("All Gemini models are currently unavailable.");
  return { is_suspicious: false };
}