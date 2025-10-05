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
// Gemini AI Service
// This service handles communication with Google's Gemini AI
// Currently using mock responses - can be upgraded to real API later

interface GeminiResponse {
  text: string;
  itineraryUpdate: any[] | null;
}

// Helper functions for itinerary modifications
const handleAddActivity = (userMessage: string, itinerary: any[]): GeminiResponse => {
  const message = userMessage.toLowerCase();
  const newActivity = {
    id: Date.now(),
    date: '2024-01-17', // Default to next day
    time: '14:00',
    location: 'New Activity',
    address: 'To be determined',
    activity: 'Activity to be planned',
    duration: '2 hours',
    type: 'activity',
    rating: 4.0,
    coordinates: [40.7128, -74.006], // Default to NYC center
  };

  // Try to extract location from user message
  if (message.includes('central park')) {
    newActivity.location = 'Central Park';
    newActivity.address = 'New York, NY 10024';
    newActivity.coordinates = [40.7829, -73.9654];
    newActivity.activity = 'Morning Walk & Photography';
  } else if (message.includes('empire state')) {
    newActivity.location = 'Empire State Building';
    newActivity.address = '350 5th Ave, New York, NY 10118';
    newActivity.coordinates = [40.7484, -73.9857];
    newActivity.activity = 'Observation Deck Visit';
    newActivity.type = 'landmark';
  } else if (message.includes('high line')) {
    newActivity.location = 'High Line Park';
    newActivity.address = 'New York, NY 10011';
    newActivity.coordinates = [40.748, -74.0048];
    newActivity.activity = 'Park Walk & Art Viewing';
  } else if (message.includes('times square')) {
    newActivity.location = 'Times Square';
    newActivity.address = 'Times Square, New York, NY 10036';
    newActivity.coordinates = [40.758, -73.9855];
    newActivity.activity = 'Shopping & Sightseeing';
    newActivity.type = 'shopping';
  } else if (message.includes('ice cream') || message.includes('gelato')) {
    newActivity.location = 'Amorino Gelato';
    newActivity.address = '60 University Pl, New York, NY 10003';
    newActivity.coordinates = [40.7326, -73.9925];
    newActivity.activity = 'Artisanal Gelato Tasting';
    newActivity.type = 'food';
    newActivity.rating = 4.4;
  } else if (
    message.includes('restaurant') ||
    message.includes('food') ||
    message.includes('eat')
  ) {
    newActivity.location = "Joe's Pizza";
    newActivity.address = '7 Carmine St, New York, NY 10014';
    newActivity.coordinates = [40.7306, -74.0014];
    newActivity.activity = 'Classic NYC Pizza Experience';
    newActivity.type = 'food';
    newActivity.rating = 4.3;
  } else if (message.includes('vancouver') || message.includes('museum')) {
    if (message.includes('museum of anthropology') || message.includes('anthropology')) {
      newActivity.location = 'Museum of Anthropology';
      newActivity.address = '6393 NW Marine Dr, Vancouver, BC V6T 1Z2, Canada';
      newActivity.activity = 'First Nations Art & Culture Tour';
      newActivity.coordinates = [49.2697, -123.2604];
      newActivity.type = 'museum';
      newActivity.rating = 4.6;
    } else if (message.includes('science world') || message.includes('science')) {
      newActivity.location = 'Science World';
      newActivity.address = '1455 Quebec St, Vancouver, BC V6A 3Z7, Canada';
      newActivity.activity = 'Interactive Science Exhibits';
      newActivity.coordinates = [49.2731, -123.1043];
      newActivity.type = 'museum';
      newActivity.rating = 4.3;
    } else if (message.includes('vancouver art gallery') || message.includes('art gallery')) {
      newActivity.location = 'Vancouver Art Gallery';
      newActivity.address = '750 Hornby St, Vancouver, BC V6Z 2H7, Canada';
      newActivity.activity = 'Contemporary Art Exhibition';
      newActivity.coordinates = [49.2827, -123.1207];
      newActivity.type = 'museum';
      newActivity.rating = 4.2;
    } else {
      newActivity.location = 'Museum of Anthropology';
      newActivity.address = '6393 NW Marine Dr, Vancouver, BC V6T 1Z2, Canada';
      newActivity.activity = 'First Nations Art & Culture Tour';
      newActivity.coordinates = [49.2697, -123.2604];
      newActivity.type = 'museum';
      newActivity.rating = 4.6;
    }
  } else {
    newActivity.location = 'New Activity';
    newActivity.activity = 'Activity to be planned';
  }

  return {
    text: `I've added "${newActivity.location}" to your itinerary for ${newActivity.date} at ${newActivity.time}. You can modify the details by asking me to change it!`,
    itineraryUpdate: [...itinerary, newActivity],
  };
};

const handleRemoveActivity = (userMessage: string, itinerary: any[]): GeminiResponse => {
  let activityToRemove = null;

  if (userMessage.toLowerCase().includes('central park')) {
    activityToRemove = itinerary.find((item) =>
      item.location.toLowerCase().includes('central park')
    );
  } else if (userMessage.toLowerCase().includes('metropolitan')) {
    activityToRemove = itinerary.find((item) =>
      item.location.toLowerCase().includes('metropolitan')
    );
  } else if (userMessage.toLowerCase().includes('times square')) {
    activityToRemove = itinerary.find((item) =>
      item.location.toLowerCase().includes('times square')
    );
  } else if (userMessage.toLowerCase().includes('statue of liberty')) {
    activityToRemove = itinerary.find((item) => item.location.toLowerCase().includes('statue'));
  } else if (userMessage.toLowerCase().includes('brooklyn bridge')) {
    activityToRemove = itinerary.find((item) => item.location.toLowerCase().includes('brooklyn'));
  }

  if (activityToRemove) {
    const updatedItinerary = itinerary.filter((item) => item.id !== activityToRemove.id);
    return {
      text: `I've removed "${activityToRemove.location}" from your itinerary. Your updated schedule is ready!`,
      itineraryUpdate: updatedItinerary,
    };
  } else {
    return {
      text: "I couldn't find that activity in your itinerary. Could you be more specific about which location you'd like to remove?",
      itineraryUpdate: null,
    };
  }
};

const handleModifyActivity = (_userMessage: string, _itinerary: any[]): GeminiResponse => {
  return {
    text: "I can help you modify activities! Tell me which location you want to change and what you'd like to update (time, date, or activity details).",
    itineraryUpdate: null,
  };
};

const handleReorderActivities = (_userMessage: string, _itinerary: any[]): GeminiResponse => {
  return {
    text: "I can help you reorder your activities! Tell me which activity you want to move and when you'd like to schedule it.",
    itineraryUpdate: null,
  };
};

// Enhanced Gemini responses with itinerary modification capabilities
export const getGeminiResponse = async (
  userMessage: string,
  itinerary: any[] = []
): Promise<GeminiResponse> => {
  try {
    // Check if user wants to modify itinerary
    const message = userMessage.toLowerCase();

    // Itinerary modification patterns
    if (
      message.includes('add') ||
      message.includes('can you add') ||
      message.includes('add it to')
    ) {
      return handleAddActivity(userMessage, itinerary);
    }

    if (message.includes('remove') || message.includes('delete') || message.includes('cancel')) {
      return handleRemoveActivity(userMessage, itinerary);
    }

    if (message.includes('change') || message.includes('modify') || message.includes('update')) {
      return handleModifyActivity(userMessage, itinerary);
    }

    if (message.includes('reorder') || message.includes('reschedule') || message.includes('move')) {
      return handleReorderActivities(userMessage, itinerary);
    }

    // Handle specific location requests
    if (message.includes('vancouver') && message.includes('museums')) {
      return {
        text: 'Great choice! Vancouver has amazing museums. The top ones are: 1) Museum of Anthropology (world-renowned First Nations art), 2) Science World (interactive exhibits), and 3) Vancouver Art Gallery (contemporary art). Would you like me to add one of these to your itinerary?',
        itineraryUpdate: null,
      };
    }

    if (message.includes('ice cream') || message.includes('gelato')) {
      return {
        text: 'Great choice! For the best ice cream in NYC, I recommend Amorino Gelato - they have amazing artisanal gelato with beautiful flower-shaped scoops. Would you like me to add it to your itinerary?',
        itineraryUpdate: null,
      };
    }

    // Regular responses for other queries
    const responses = {
      greeting: [
        "Hello! I'm your AI travel assistant. I can help you plan your itinerary, suggest activities, or answer questions about your trip!",
        "Hi there! I'm here to help make your travel experience amazing. What would you like to know?",
        'Welcome! I can assist you with your travel plans, recommend places to visit, or help optimize your itinerary.',
      ],
      itinerary: [
        'Your current itinerary looks great! You have a nice mix of cultural and outdoor activities planned for New York City.',
        "I can see you're visiting some iconic NYC locations. Would you like suggestions for nearby restaurants or additional activities?",
        'Your schedule is well-balanced between sightseeing and leisure. The timing looks good for each location.',
      ],
      suggestions: [
        "Based on your itinerary, I'd recommend checking the weather and planning accordingly. NYC weather can be unpredictable!",
        "For the best experience, I suggest visiting Central Park early in the morning when it's less crowded.",
        "Don't forget to book tickets in advance for popular attractions like the Statue of Liberty and Metropolitan Museum.",
        "Times Square is always exciting! Consider checking out Broadway shows if you're interested in theater.",
        'The Brooklyn Bridge walk is beautiful at sunset - perfect for photography!',
      ],
      general: [
        "That's a wonderful choice! I can help you find similar activities in the area.",
        "I'd be happy to help you plan the best route between your destinations.",
        'Great question! Let me help you with that.',
        'I can provide more details about any of the locations in your itinerary.',
        'Would you like me to suggest alternatives or additional activities?',
      ],
    };

    // Determine response type based on user input
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        text: responses.greeting[Math.floor(Math.random() * responses.greeting.length)],
        itineraryUpdate: null,
      };
    }

    if (message.includes('itinerary') || message.includes('schedule') || message.includes('plan')) {
      return {
        text: responses.itinerary[Math.floor(Math.random() * responses.itinerary.length)],
        itineraryUpdate: null,
      };
    }

    if (
      message.includes('suggest') ||
      message.includes('recommend') ||
      message.includes('advice')
    ) {
      return {
        text: responses.suggestions[Math.floor(Math.random() * responses.suggestions.length)],
        itineraryUpdate: null,
      };
    }

    if (message.includes('central park')) {
      return {
        text: "Central Park is a must-visit! It's 843 acres of green space in the heart of Manhattan. I recommend starting at the Bethesda Fountain and walking through the Mall. Early morning or late afternoon are the best times to visit.",
        itineraryUpdate: null,
      };
    }

    if (message.includes('metropolitan') || message.includes('museum')) {
      return {
        text: "The Metropolitan Museum of Art is one of the world's largest art museums! You'll need at least 2-3 hours to see the highlights. I recommend starting with the Egyptian Art galleries and the American Wing.",
        itineraryUpdate: null,
      };
    }

    if (message.includes('times square')) {
      return {
        text: "Times Square is the heart of NYC! It's always bustling with energy. Visit at night to see the famous billboards lit up. Don't miss the TKTS booth for discounted Broadway tickets.",
        itineraryUpdate: null,
      };
    }

    if (message.includes('statue of liberty')) {
      return {
        text: 'The Statue of Liberty is an iconic symbol of freedom! Book your ferry tickets in advance. The crown access requires separate tickets and sells out quickly. The views from the island are spectacular.',
        itineraryUpdate: null,
      };
    }

    if (message.includes('brooklyn bridge')) {
      return {
        text: "The Brooklyn Bridge walk is one of NYC's most iconic experiences! It's about 1.3 miles long and offers amazing views of Manhattan. Best times are early morning or sunset for photography.",
        itineraryUpdate: null,
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
        text: 'NYC weather can be unpredictable! I recommend checking the forecast before your trip and dressing in layers. Spring and fall are generally the most pleasant times to visit.',
        itineraryUpdate: null,
      };
    }

    if (message.includes('food') || message.includes('restaurant') || message.includes('eat')) {
      return {
        text: "NYC has incredible food options! For your itinerary, I'd recommend: near Central Park - try The Loeb Boathouse; near Times Square - Carmine's for family-style Italian; near Brooklyn Bridge - Grimaldi's for pizza.",
        itineraryUpdate: null,
      };
    }

    if (message.includes('transport') || message.includes('subway') || message.includes('metro')) {
      return {
        text: 'The NYC subway system is extensive and the best way to get around! Get a MetroCard or use your phone with Apple Pay/Google Pay. The 1, 2, 3, 4, 5, 6 lines run north-south through Manhattan.',
        itineraryUpdate: null,
      };
    }

    // Default response
    return {
      text: responses.general[Math.floor(Math.random() * responses.general.length)],
      itineraryUpdate: null,
    };
  } catch (error) {
    console.error('Error getting Gemini response:', error);
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
