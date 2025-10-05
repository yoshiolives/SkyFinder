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
  
  return `Generate a ${days}-day travel itinerary for ${destination} (${startDate} to ${endDate}).
${description ? `Preferences: ${description}` : ''}

Create ${Math.min(days * 3, 20)} activities with these exact fields:
- date (YYYY-MM-DD between ${startDate} and ${endDate})
- time (HH:MM 24hr format)
- location (venue name)
- address (full address)
- activity (what to do, 1-2 sentences)
- duration (e.g., "2 hours")
- type (one of: activity, museum, shopping, landmark, restaurant, outdoor)
- rating (0-5 number)
- coordinates ([lat, lng] as numbers)

Rules:
- Use real places in ${destination}
- Include breakfast (~08:00), lunch (~12:00), dinner (~18:00)
- No overlapping times
- All fields required

Return ONLY valid JSON (no markdown):
{"items": [{"date":"2025-01-15","time":"09:00","location":"Name","address":"123 St","activity":"Description","duration":"2 hours","type":"landmark","rating":4.5,"coordinates":[lat,lng]}]}`;
};

