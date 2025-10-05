// Gemini Service with Google GenAI Integration
// This service provides both real AI responses and mock fallbacks

import { GoogleGenAI } from "@google/genai";

// Initialize Google GenAI with API key check
let ai = null;
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

if (apiKey && apiKey !== 'test-api-key' && apiKey !== 'your_gemini_api_key') {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Failed to initialize Google GenAI:', error.message);
    ai = null;
  }
}

// Helper function to generate AI-powered itinerary
const generateAIItinerary = async (location = "Vancouver, BC", duration = "2 weeks") => {
  try {
    if (!ai) {
      // Fallback to mock data if no AI available
      return generateMockItinerary();
    }

    console.log('🤖 AI generating custom itinerary...');
    
    const prompt = `Create a comprehensive ${duration} travel itinerary for ${location}. 

Generate a detailed day-by-day schedule with:
- Morning, afternoon, and evening activities
- Specific locations with addresses
- Activity descriptions and durations
- Realistic timing (9 AM to 9 PM daily)
- Mix of attractions, restaurants, cultural sites, outdoor activities
- Include travel time between locations
- Vary the pace (some busy days, some relaxed days)

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

    const responseText = response.text;
    console.log('🤖 Raw AI response:', responseText.substring(0, 200) + '...');
    
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
const getRealGeminiResponse = async (userMessage, itinerary = []) => {
  try {
    // Check if AI instance is available
    if (!ai) {
      console.log('⚠️ Google GenAI not initialized, falling back to mock responses');
      return getMockGeminiResponse(userMessage, itinerary);
    }
    
    console.log('🤖 Using real Gemini API');
    
    const prompt = `You are an AI travel assistant. User message: "${userMessage}". 
    Current itinerary: ${JSON.stringify(itinerary, null, 2)}
    
    Respond with a JSON object containing:
    - "text": Your response to the user
    - "itineraryUpdate": null or array of new itinerary items
    
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

    const responseText = response.text;
    const parsedResponse = JSON.parse(responseText);
    
    return parsedResponse;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.log('🔄 Falling back to mock responses');
    return getMockGeminiResponse(userMessage, itinerary);
  }
};

// Mock response function (fallback and development)
const getMockGeminiResponse = async (userMessage, itinerary = []) => {
  try {
    console.log('🤖 Using mock Gemini responses for development');
    
    const message = userMessage.toLowerCase();
    
    // Handle AI itinerary generation
    if (message.includes('generate') || message.includes('create') || message.includes('build') || 
        message.includes('plan') || message.includes('itinerary') || message.includes('2 weeks') || 
        message.includes('two weeks') || message.includes('14 days')) {
      
      // Extract location and duration from user message
      let location = "Vancouver, BC";
      let duration = "2 weeks";
      
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
      
      const aiItinerary = await generateAIItinerary(location, duration);
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
      itineraryUpdate: null,
    };
  }
};

// Main function that decides whether to use real API or mock
const getGeminiResponse = async (userMessage, itinerary = []) => {
  // Check if we have a valid AI instance
  if (ai) {
    return await getRealGeminiResponse(userMessage, itinerary);
  } else {
    console.log('⚠️ No valid Gemini API key found, using mock responses');
    return await getMockGeminiResponse(userMessage, itinerary);
  }
};

export { getGeminiResponse, getRealGeminiResponse, getMockGeminiResponse, generateAIItinerary };
