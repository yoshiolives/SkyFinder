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
