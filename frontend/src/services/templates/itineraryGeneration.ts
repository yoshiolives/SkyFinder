// Template for AI-powered itinerary generation

interface TripDetails {
  destination: string;
  startDate: string;
  endDate: string;
  title: string;
  description?: string;
}

export const generateItineraryPrompt = (tripDetails: TripDetails): string => {
  const { destination, startDate, endDate, title, description } = tripDetails;
  
  // Calculate number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1; // Number of nights staying
  
  return `Generate a complete ${days}-day travel itinerary for ${destination} (${startDate} to ${endDate}).

${description ? `IMPORTANT - User Preferences (MUST address ALL of these): ${description}` : ''}

REQUIRED ITEMS (${Math.min(days * 4 + nights, 30)} total):
1. Hotel check-in for EACH night (${nights} hotels total) - include around 15:00-16:00
2. Breakfast EVERY morning (~08:00)
3. Lunch EVERY day (~12:00-13:00)
4. Dinner EVERY evening (~18:00-19:00)
5. ${description ? 'Activities matching user preferences' : 'Varied activities (museums, landmarks, outdoor, shopping)'}

Each item needs these exact fields:
- date: YYYY-MM-DD (${startDate} to ${endDate})
- time: HH:MM (24hr)
- location: Full venue/hotel name
- address: Complete street address
- activity: What to do (1-2 sentences)${description ? ` - MUST align with: ${description}` : ''}
- duration: "X hours"
- type: accommodation (for hotels), activity, museum, shopping, landmark, restaurant, outdoor
- rating: 0-5 number
- coordinates: [lat, lng]

IMPORTANT: Use type "accommodation" for ALL hotel check-ins and stays.

${description ? `CRITICAL: Every activity must directly address the user's request: "${description}". Include specific venues that match these preferences.` : ''}

Return ONLY valid JSON:
{"items":[{"date":"${startDate}","time":"08:00","location":"Breakfast Spot","address":"123 St","activity":"Desc","duration":"1 hour","type":"restaurant","rating":4.5,"coordinates":[40.7,-73.9]}]}`;
};

