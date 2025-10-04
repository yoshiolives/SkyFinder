import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export class GeminiService {
  static async generatePlaceDescription(placeData: {
    name: string;
    category: string;
    location: { lat: number; lng: number };
  }): Promise<string> {
    const prompt = `
      Generate a compelling description for a place with the following details:
      - Name: ${placeData.name}
      - Category: ${placeData.category}
      - Location: ${placeData.location.lat}, ${placeData.location.lng}
      
      Please create a 2-3 sentence description that would make someone want to visit this place.
      Make it engaging and highlight what makes this place special.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating place description:', error);
      throw new Error('Failed to generate place description');
    }
  }

  static async getPersonalizedRecommendations(
    userPreferences: any,
    availablePlaces: any[],
    location?: { lat: number; lng: number }
  ): Promise<any[]> {
    const prompt = `
      Based on the following user preferences and available places, provide personalized recommendations:
      
      User Preferences:
      ${JSON.stringify(userPreferences, null, 2)}
      
      Available Places:
      ${JSON.stringify(availablePlaces.slice(0, 10), null, 2)}
      
      ${location ? `User Location: ${location.lat}, ${location.lng}` : ''}
      
      Please provide 5 personalized recommendations with:
      1. Place ID
      2. Reason for recommendation
      3. Confidence score (0-1)
      4. Personalized note
      
      Return as JSON array.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return basic recommendations
      return availablePlaces.slice(0, 5).map((place, index) => ({
        placeId: place.id,
        reason: `Recommended based on your preferences`,
        confidence: 0.8 - (index * 0.1),
        personalizedNote: `This ${place.category} place matches your interests`,
      }));
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw new Error('Failed to get personalized recommendations');
    }
  }

  static async chatWithAI(message: string, chatHistory: any[]): Promise<string> {
    const context = `
      You are a helpful travel and places recommendation assistant. 
      You help users discover interesting places and provide personalized recommendations.
      You have access to a database of places with various categories, ratings, and locations.
      
      Previous conversation:
      ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    `;

    const prompt = `${context}\n\nUser: ${message}\n\nAssistant:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in AI chat:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }

  static async analyzeUserPreferences(userHistory: any[]): Promise<any> {
    const prompt = `
      Analyze the following user interaction history and extract preferences:
      
      User History:
      ${JSON.stringify(userHistory, null, 2)}
      
      Please provide insights about:
      1. Preferred categories
      2. Price range preferences
      3. Rating preferences
      4. Location patterns
      5. Time-based patterns
      
      Return as JSON object.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        categories: ['restaurant', 'attraction'],
        priceRange: [1, 3],
        ratingThreshold: 4.0,
        locationPattern: 'urban',
      };
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      return {
        categories: ['restaurant', 'attraction'],
        priceRange: [1, 3],
        ratingThreshold: 4.0,
        locationPattern: 'urban',
      };
    }
  }
}





