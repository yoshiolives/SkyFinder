// Gemini Service with Google GenAI Integration
// This service requires a valid Gemini API key

import { GoogleGenAI } from "@google/genai";

// Custom error class for Gemini API errors
class GeminiAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

// Type definitions
interface Preferences {
  interests?: string[];
  budget?: string;
  dates?: string;
  special?: string;
  location?: string;
}

interface QuestionnaireData {
  step?: number;
  data?: {
    location?: string;
    dates?: string;
    interests?: string;
    budget?: string;
  };
  generate?: boolean;
  preferences?: Preferences;
}

// Initialize Google GenAI with API key check
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey || apiKey === 'test-api-key' || apiKey === 'your_gemini_api_key') {
  throw new GeminiAPIError('Gemini API key is not configured. Please contact an administrator.');
}

let ai: any;
try {
  ai = new GoogleGenAI({ apiKey });
} catch (error: any) {
  throw new GeminiAPIError(`Failed to initialize Gemini API: ${error.message}. Please contact an administrator.`);
}


// Gemini API function
const getGeminiResponse = async (userMessage: string, itinerary: any[] = [], questionnaireData: QuestionnaireData = {}, messages: any[] = []) => {
  if (!ai) {
    throw new GeminiAPIError('Gemini AI is not initialized. Please contact an administrator.');
  }

  try {
    // Build chat history context
    const chatHistory = messages.slice(-10).map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    const prompt = `You are an AI travel assistant with access to the conversation history and database operations.

CONVERSATION HISTORY:
${chatHistory}

CURRENT USER MESSAGE: "${userMessage}"

CURRENT ITINERARY (THIS IS THE ONLY SOURCE OF TRUTH - DO NOT MAKE UP OR ASSUME ANY OTHER ITEMS):
${JSON.stringify(itinerary, null, 2)}

QUESTIONNAIRE DATA: ${JSON.stringify(questionnaireData, null, 2)}

CRITICAL INSTRUCTIONS - MUST FOLLOW EXACTLY:
0. **EXTREMELY IMPORTANT**: The CURRENT ITINERARY above is the COMPLETE and ONLY list of items. DO NOT assume or mention any items that are not explicitly listed above. If the itinerary is empty [], there are NO existing items. DO NOT hallucinate or make up conflicts with items that don't exist.
1. ALWAYS fill in EVERY SINGLE FIELD for itinerary items - NO EXCEPTIONS
2. Use realistic, accurate data for New York City locations
3. Use Google Maps knowledge to provide exact addresses and coordinates
4. NEVER leave any field as null, undefined, or empty
5. For duration, use format "X hours" or "X.5 hours"
6. For time, ALWAYS use 24-hour format "HH:MM"
7. Check for time conflicts ONLY with items that exist in the CURRENT ITINERARY JSON above. If there are no items on a date, there are NO conflicts.
8. When adding items, return an ACTION to create the item in the database

REQUIRED FIELDS FOR EVERY ITINERARY ITEM:
- id: Use Date.now() + random number
- date: "YYYY-MM-DD" format (REQUIRED - get from user or infer)
- time: "HH:MM" 24-hour format (REQUIRED - get from user or use reasonable time)
- location: Full proper name of venue/attraction (REQUIRED)
- address: Complete street address with city, state, zip (REQUIRED)
- activity: Detailed description of what to do there (REQUIRED)
- duration: How long to spend (REQUIRED - e.g., "2 hours", "3.5 hours")
- type: MUST be one of: activity, museum, shopping, landmark, restaurant, outdoor (REQUIRED)
- rating: Realistic rating 0-5 (REQUIRED - research actual ratings)
- coordinates: [latitude, longitude] as numbers (REQUIRED - use accurate NYC coords)

RESPONSE FORMAT - MUST BE VALID JSON:
{
  "text": "Your conversational response to the user",
  "action": null OR "create_item" OR "update_item" OR "delete_item",
  "actionData": null OR the complete itinerary item object with ALL fields,
  "itineraryUpdate": null OR complete array of itinerary (for bulk updates only)
}

ACTIONS:
- "create_item": When user asks to add a single item. Include full item in actionData.
- "update_item": When user asks to modify an existing item. Include full updated item in actionData.
- "delete_item": When user asks to remove an item. Include item id in actionData.
- null: For general conversation without database changes.

EXAMPLE RESPONSE FOR "add bronx zoo jan 16 9am" (assuming no existing items on Jan 16):
{
  "text": "I've added the Bronx Zoo to your itinerary for January 16th at 9:00 AM. This is a 4-hour visit featuring wildlife exhibits and shows.",
  "action": "create_item",
  "actionData": {
    "id": 1234567890123,
    "date": "2024-01-16",
    "time": "09:00",
    "location": "Bronx Zoo",
    "address": "2300 Southern Blvd, Bronx, NY 10460",
    "activity": "Explore wildlife exhibits, see the Congo Gorilla Forest, and catch animal feeding shows",
    "duration": "4 hours",
    "type": "outdoor",
    "rating": 4.6,
    "coordinates": [40.8506, -73.8770]
  },
  "itineraryUpdate": null
}

EXAMPLE WITH CONFLICT (only if item actually exists in CURRENT ITINERARY):
If CURRENT ITINERARY shows: [{"date": "2024-01-16", "time": "10:00", "location": "Statue of Liberty", ...}]
Then you can mention: "Note: This may overlap with your Statue of Liberty visit at 10:00 AM on the same day."

ALWAYS respond with valid JSON only. NO markdown, NO extra text, JUST JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let responseText = response.text;
    
    // Remove markdown code block formatting if present (```json ... ```)
    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    
    const parsedResponse = JSON.parse(responseText);
    
    return parsedResponse;
    
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    throw new GeminiAPIError(`Failed to get AI response: ${error.message}. Please contact an administrator.`);
  }
};

export { getGeminiResponse, GeminiAPIError };
