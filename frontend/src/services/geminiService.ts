// Gemini Service with Google GenAI Integration
// This service provides both real AI responses and mock fallbacks

import { GoogleGenAI } from "@google/genai";

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
let ai = null;
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (apiKey && apiKey !== 'test-api-key' && apiKey !== 'your_gemini_api_key') {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize Google GenAI:', error.message);
    ai = null;
  }
}

// Helper function to generate AI-powered itinerary with user preferences
const generateAIItinerary = async (location = "Vancouver, BC", duration = "2 weeks", preferences: Preferences = {}) => {
  try {
    if (!ai) {
      // Fallback to mock data if no AI available
      return generateMockItinerary();
    }

    console.log('🤖 AI generating custom itinerary...');
    
    // Build preferences context
    const preferencesText = preferences.interests ? 
      `User Preferences:
- Interests: ${preferences.interests.join(', ')}
- Budget Level: ${preferences.budget || 'medium'}
- Trip Dates: ${preferences.dates || 'flexible'}
- Special Requirements: ${preferences.special || 'none'}` : '';

    const prompt = `Create a comprehensive ${duration} travel itinerary for ${location}.

${preferencesText}

Generate a detailed day-by-day schedule with:
- Morning, afternoon, and evening activities
- Specific locations with addresses
- Activity descriptions and durations
- Realistic timing (9 AM to 9 PM daily)
- Activities matching user interests and budget level
- Include travel time between locations
- Vary the pace (some busy days, some relaxed days)
- Consider local recommendations and hidden gems

IMPORTANT: Return ONLY a valid JSON array. No other text. Start with [ and end with ].

Example format:
[
  {
    "id": 1234567890,
    "date": "2024-01-15", 
    "time": "09:00",
    "location": "Stanley Park",
    "address": "Vancouver, BC V6G 1Z4, Canada",
    "activity": "Morning walk through Stanley Park with totem poles",
    "duration": "2 hours",
    "type": "outdoor",
    "rating": 4.8,
    "coordinates": [49.3043, -123.1443]
  }
]

Generate 14-21 days of activities. Be creative and comprehensive.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let responseText = response.text;
    console.log('🤖 Raw AI response:', responseText.substring(0, 200) + '...');
    
    // Remove markdown code block formatting if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    
    // Try to extract JSON from the response
    let jsonText = responseText;
    
    // Look for JSON array in the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const parsedItinerary = JSON.parse(jsonText);
    console.log('🤖 Parsed itinerary items:', parsedItinerary.length);
    
    // Add IDs and ensure proper structure
    return parsedItinerary.map((item, index) => ({
      ...item,
      id: Date.now() + index
    }));
    
  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    return generateMockItinerary();
  }
};

// Fallback mock itinerary for development
const generateMockItinerary = () => {
  const mockActivities = [
    {
      location: "Stanley Park",
      address: "Vancouver, BC V6G 1Z4, Canada",
      activity: "Morning walk through Stanley Park with totem poles",
      duration: "2 hours",
      type: "outdoor",
      rating: 4.8,
      coordinates: [49.3043, -123.1443]
    },
    {
      location: "Museum of Anthropology",
      address: "6393 NW Marine Dr, Vancouver, BC V6T 1Z2, Canada",
      activity: "First Nations art and culture tour",
      duration: "3 hours",
      type: "museum",
      rating: 4.6,
      coordinates: [49.2697, -123.2604]
    },
    {
      location: "Granville Island",
      address: "Granville Island, Vancouver, BC V6H 3S1, Canada",
      activity: "Public market exploration and artisan shopping",
      duration: "2 hours",
      type: "shopping",
      rating: 4.3,
      coordinates: [49.2731, -123.1043]
    }
  ];

  return mockActivities.map((activity, index) => ({
    id: Date.now() + index,
    date: '2024-01-17',
    time: `${9 + (index * 2)}:00`,
    ...activity
  }));
};

// Real Gemini API function
const getRealGeminiResponse = async (userMessage: string, itinerary: any[] = [], questionnaireData: QuestionnaireData = {}, messages: any[] = []) => {
  try {
    // Check if AI instance is available
    if (!ai) {
      console.log('⚠️ Google GenAI not initialized, falling back to mock responses');
      return getMockGeminiResponse(userMessage, itinerary);
    }
    
    console.log('🤖 Using real Gemini API');
    
    // Build chat history context
    const chatHistory = messages.slice(-10).map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    const prompt = `You are an AI travel assistant with access to the conversation history.

CONVERSATION HISTORY:
${chatHistory}

CURRENT USER MESSAGE: "${userMessage}"

CURRENT ITINERARY: ${JSON.stringify(itinerary, null, 2)}

QUESTIONNAIRE DATA: ${JSON.stringify(questionnaireData, null, 2)}

Instructions:
- Use the conversation history to provide contextual responses
- Reference previous parts of the conversation when relevant
- Build on previous answers and questions
- Be conversational and remember what was discussed earlier

Respond with a JSON object containing:
- "text": Your response to the user (can reference chat history)
- "itineraryUpdate": null or array of new itinerary items
- "questionnaire": null or questionnaire data if continuing the flow

For itinerary items, use this structure:
{
  "id": timestamp,
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "Location name",
  "address": "Full address",
  "activity": "Activity description",
  "duration": "X hours",
  "type": "activity|museum|shopping|landmark|restaurant",
  "rating": number (0-5),
  "coordinates": [latitude, longitude]
}

Always respond with valid JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let responseText = response.text;
    
    // Remove markdown code block formatting if present (```json ... ```)
    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    
    const parsedResponse = JSON.parse(responseText);
    
    return parsedResponse;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.log('🔄 Falling back to mock responses');
    return getMockGeminiResponse(userMessage, itinerary);
  }
};

// Questionnaire handler
const handleQuestionnaire = (message: string, questionnaireData: QuestionnaireData = {}) => {
  const step = questionnaireData.step || 1;
  const data = questionnaireData.data || {};
  
  switch (step) {
    case 1: // City/Region
      return {
        text: "Great! I'd love to help you plan your perfect trip! Let me ask you a few questions to create a personalized itinerary.\n\n**1. Where would you like to go?** (City or region)\n\nPlease tell me your destination!",
        itineraryUpdate: null,
        questionnaire: {
          step: 1,
          data: {}
        }
      };
      
    case 2: // Trip Dates
      return {
        text: "Perfect! Now let's plan your travel dates.\n\n**2. When are you planning to travel?** (Dates or time period)\n\nPlease tell me your travel dates!",
        itineraryUpdate: null,
        questionnaire: {
          step: 2,
          data: { ...data, location: message }
        }
      };
      
    case 3: // Interests
      return {
        text: "Excellent! Now let's talk about what you enjoy.\n\n**3. What are your interests?** (Select all that apply)\n\n- 🌿 Nature & Outdoor activities\n- 🍽️ Food & Culinary experiences\n- 🎨 Art & Culture\n- 🌃 Nightlife & Entertainment\n- 🏛️ History & Museums\n- 🛍️ Shopping\n- 🏃‍♀️ Sports & Adventure\n\nPlease tell me what interests you!",
        itineraryUpdate: null,
        questionnaire: {
          step: 3,
          data: { ...data, dates: message }
        }
      };
      
    case 4: // Budget Level
      return {
        text: "Great choices! Now let's talk about your budget.\n\n**4. What's your budget level?**\n\n- 💰 Low Budget: Hostels, street food, free activities\n- 💳 Medium Budget: Mid-range hotels, local restaurants, some paid attractions\n- 💎 High Budget: Luxury hotels, fine dining, premium experiences\n\nPlease tell me your budget preference!",
        itineraryUpdate: null,
        questionnaire: {
          step: 4,
          data: { ...data, interests: message }
        }
      };
      
    case 5: // Generate Itinerary
      const preferences = {
        interests: data.interests || ['nature', 'food', 'art'],
        budget: data.budget || 'medium',
        dates: data.dates || 'flexible',
        location: data.location || 'Vancouver, BC'
      };
      
      return {
        text: `Perfect! I have all the information I need to create your personalized itinerary.\n\n**Your Trip Details:**\n- Destination: ${preferences.location}\n- Travel Dates: ${preferences.dates}\n- Interests: ${preferences.interests}\n- Budget: ${preferences.budget}\n\nLet me generate your custom itinerary now...`,
        itineraryUpdate: null,
        questionnaire: {
          step: 5,
          data: { ...data, budget: message },
          generate: true,
          preferences: preferences
        }
      };
      
    default:
      return {
        text: "Let's start planning your trip! Say 'plan a trip' to begin.",
        itineraryUpdate: null
      };
  }
};

// Mock response function (fallback and development)
const getMockGeminiResponse = async (userMessage: string, itinerary: any[] = [], questionnaireData: QuestionnaireData = {}, messages: any[] = []) => {
  try {
    console.log('🤖 Using mock Gemini responses for development');
    
    // Build chat history context for mock responses
    const chatHistory = messages.slice(-5).map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    if (chatHistory) {
      console.log('💬 Chat history context:', chatHistory.substring(0, 100) + '...');
    }
    
    const message = userMessage.toLowerCase();
    
    // Handle questionnaire start
    if (message.includes('plan') || message.includes('create') || message.includes('build') || 
        message.includes('itinerary') || message.includes('trip') || message.includes('travel')) {
      
      return handleQuestionnaire(message, { step: 1, data: {} });
    }
    
    // Handle questionnaire responses
    if (questionnaireData && questionnaireData.step) {
      const nextStep = questionnaireData.step + 1;
      const response = handleQuestionnaire(message, { step: nextStep, data: questionnaireData.data });
      
      // If questionnaire is complete and generate is true, automatically generate itinerary
      if (response.questionnaire && response.questionnaire.generate) {
        console.log('🎯 Questionnaire complete, generating full itinerary...');
        
        const questionnaireDataObj = (response.questionnaire.data || {}) as { location?: string; dates?: string; interests?: string; budget?: string };
        const interestsValue = questionnaireDataObj.interests || 'nature, food, art';
        const preferences = {
          location: questionnaireDataObj.location || 'Vancouver, BC',
          dates: questionnaireDataObj.dates || 'flexible',
          interests: typeof interestsValue === 'string' ? interestsValue.split(',').map(i => i.trim()) : interestsValue,
          budget: questionnaireDataObj.budget || 'medium'
        };
        
        // Determine duration from dates or default to 2 weeks
        let duration = "2 weeks";
        if (preferences.dates.includes('week')) {
          duration = preferences.dates;
        } else if (preferences.dates.includes('month')) {
          duration = "1 month";
        } else if (preferences.dates.includes('day')) {
          duration = "1 week";
        }
        
        console.log('🤖 Generating AI itinerary with:', preferences);
        const aiItinerary = await generateAIItinerary(preferences.location, duration, preferences);
        
        return {
          text: response.text + `\n\nI've created your complete ${duration} itinerary for ${preferences.location} with ${aiItinerary.length} activities!`,
          itineraryUpdate: aiItinerary,
          questionnaire: response.questionnaire
        };
      }
      
      return response;
    }
    
    // Handle first question response (location) - if no questionnaire data but user gives a location
    if (!questionnaireData && (message.includes('vancouver') || message.includes('toronto') || 
        message.includes('montreal') || message.includes('calgary') || message.includes('city') || 
        message.includes('go to') || message.includes('visit'))) {
      
      return handleQuestionnaire(message, { step: 2, data: { location: message } });
    }
    
    // Handle AI itinerary generation with preferences
    if (message.includes('generate') || message.includes('final') || message.includes('complete')) {
      
      // Extract location and duration from user message
      let location = "Vancouver, BC";
      let duration = "2 weeks";
      let preferences = {
        interests: ['nature', 'food', 'art'],
        budget: 'medium',
        dates: 'flexible'
      };
      
      if (message.includes('vancouver')) location = "Vancouver, BC";
      if (message.includes('toronto')) location = "Toronto, ON";
      if (message.includes('montreal')) location = "Montreal, QC";
      if (message.includes('calgary')) location = "Calgary, AB";
      
      if (message.includes('1 week') || message.includes('one week') || message.includes('7 days')) {
        duration = "1 week";
      } else if (message.includes('3 weeks') || message.includes('three weeks') || message.includes('21 days')) {
        duration = "3 weeks";
      } else if (message.includes('month') || message.includes('30 days')) {
        duration = "1 month";
      }
      
      const aiItinerary = await generateAIItinerary(location, duration, preferences);
      return {
        text: `I've created a comprehensive ${duration} itinerary for ${location} with ${aiItinerary.length} activities! This includes a mix of attractions, restaurants, cultural sites, and outdoor activities spread across your stay.`,
        itineraryUpdate: aiItinerary
      };
    }
    
    // Handle add activity requests
    if (message.includes('add') || message.includes('can you add')) {
      const newActivity = {
        id: Date.now(),
        date: '2024-01-17',
        time: '14:00',
        location: 'Vancouver Activity',
        address: 'Vancouver, BC, Canada',
        activity: 'Activity to be planned',
        duration: '2 hours',
        type: 'activity',
        rating: 4.0,
        coordinates: [49.2827, -123.1207]
      };
      
      // Handle specific Vancouver locations
      if (message.includes('stanley park')) {
        newActivity.location = 'Stanley Park';
        newActivity.address = 'Vancouver, BC V6G 1Z4, Canada';
        newActivity.activity = 'Park Walk & Totem Poles';
        newActivity.coordinates = [49.3043, -123.1443];
      } else if (message.includes('museum') || message.includes('anthropology')) {
        newActivity.location = 'Museum of Anthropology';
        newActivity.address = '6393 NW Marine Dr, Vancouver, BC V6T 1Z2, Canada';
        newActivity.activity = 'First Nations Art & Culture Tour';
        newActivity.type = 'museum';
        newActivity.rating = 4.6;
        newActivity.coordinates = [49.2697, -123.2604];
      } else if (message.includes('granville island')) {
        newActivity.location = 'Granville Island';
        newActivity.address = 'Granville Island, Vancouver, BC V6H 3S1, Canada';
        newActivity.activity = 'Public Market & Artisan Shops';
        newActivity.type = 'shopping';
        newActivity.rating = 4.3;
        newActivity.coordinates = [49.2731, -123.1043];
      }
      
      return {
        text: `I've added "${newActivity.location}" to your itinerary for ${newActivity.date} at ${newActivity.time}. You can modify the details by asking me to change it!`,
        itineraryUpdate: [...itinerary, newActivity]
      };
    }
    
    // Handle remove activity requests
    if (message.includes('remove') || message.includes('delete')) {
      const activityToRemove = itinerary.find(item => 
        message.includes(item.location.toLowerCase())
      );
      
      if (activityToRemove) {
        const updatedItinerary = itinerary.filter(item => item.id !== activityToRemove.id);
        return {
          text: `I've removed "${activityToRemove.location}" from your itinerary. Your updated schedule is ready!`,
          itineraryUpdate: updatedItinerary
        };
      } else {
        return {
          text: "I couldn't find that activity in your itinerary. Could you be more specific about which location you'd like to remove?",
          itineraryUpdate: null
        };
      }
    }
    
    // Handle general queries
    if (message.includes('hello') || message.includes('hi')) {
      return {
        text: "Hello! I'm your AI travel assistant for Vancouver, BC. I can help you plan your itinerary, suggest activities, generate random itineraries, or answer questions about your trip!",
        itineraryUpdate: null
      };
    }
    
    if (message.includes('stanley park')) {
      return {
        text: "Stanley Park is a must-visit! It's 1,000 acres of green space in the heart of Vancouver. I recommend starting at the Totem Poles and walking the Seawall. Early morning or late afternoon are the best times to visit.",
        itineraryUpdate: null
      };
    }
    
    if (message.includes('museum') || message.includes('anthropology')) {
      return {
        text: "The Museum of Anthropology is one of the world's most renowned museums for First Nations art! You'll need at least 2-3 hours to see the highlights. I recommend starting with the Great Hall and the Bill Reid Rotunda.",
        itineraryUpdate: null
      };
    }
    
    if (message.includes('granville island')) {
      return {
        text: "Granville Island is the heart of Vancouver's cultural scene! It's always bustling with energy. Visit during the day to see the public market and local artisans. Don't miss the Granville Island Brewing Company for local craft beer.",
        itineraryUpdate: null
      };
    }
    
    if (message.includes('weather')) {
      return {
        text: "Vancouver weather can be unpredictable! I recommend checking the forecast before your trip and dressing in layers. Spring and fall are generally the most pleasant times to visit.",
        itineraryUpdate: null
      };
    }
    
    if (message.includes('food') || message.includes('restaurant')) {
      return {
        text: "Vancouver has incredible food options! For your itinerary, I'd recommend: near Stanley Park - try The Teahouse; near Granville Island - try Go Fish for fresh seafood; near the Seawall - try Cactus Club for modern Canadian cuisine.",
        itineraryUpdate: null
      };
    }
    
    // Default response
    return {
      text: "I'm here to help you plan your Vancouver trip! You can ask me to add activities, generate random itineraries, get information about attractions, or help with your itinerary.",
      itineraryUpdate: null
    };
    
  } catch (error) {
    console.error('Error in mock Gemini service:', error);
    return {
      text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      itineraryUpdate: null
    };
  }
};

// Main function that decides whether to use real API or mock
const getGeminiResponse = async (userMessage: string, itinerary: any[] = [], questionnaireData: QuestionnaireData = {}, messages: any[] = []) => {
  // Check if we have a valid AI instance
  if (ai) {
    return await getRealGeminiResponse(userMessage, itinerary, questionnaireData, messages);
  } else {
    console.log('⚠️ No valid Gemini API key found, using mock responses');
    return await getMockGeminiResponse(userMessage, itinerary, questionnaireData, messages);
  }
};

export { getGeminiResponse, getRealGeminiResponse, getMockGeminiResponse, generateAIItinerary };
