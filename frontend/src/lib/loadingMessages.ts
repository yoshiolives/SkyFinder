// Fun, random messages to display during AI itinerary generation

export const loadingMessages = [
  "🗺️ Plotting your adventure on a map...",
  "🍜 Finding the best local food spots...",
  "🏨 Booking imaginary rooms with views...",
  "✈️ Packing AI's virtual suitcase...",
  "🎒 Adding spontaneity to your plan...",
  "🌟 Sprinkling some magic on your trip...",
  "🍕 Researching the perfect pizza places...",
  "🎭 Finding hidden gems only locals know...",
  "🌅 Planning sunrise moments you won't forget...",
  "🎉 Adding some unexpected surprises...",
  "🗼 Measuring distances in fun units...",
  "🎨 Painting your journey with AI colors...",
  "🍦 Locating ice cream shops for emergencies...",
  "🚶 Calculating optimal walking routes...",
  "📸 Finding Instagram-worthy spots...",
  "🌮 Taco detection system activated...",
  "🎪 Discovering local festivals and events...",
  "🏖️ Beach vibes loading...",
  "🎵 Curating the perfect travel playlist...",
  "🌙 Planning moonlit adventures...",
  "☕ Caffeine stops strategically placed...",
  "🎢 Adventure meter rising...",
  "🦋 Adding butterflies to your stomach...",
  "🎯 Bullseye-ing the perfect schedule...",
  "🌈 Making it rain with good times...",
  "🧭 Compass calibrating to fun...",
  "🎪 Circus of awesomeness incoming...",
  "🌺 Tropical vibes activated...",
  "🎸 Rock and rolling your itinerary...",
  "🍱 Sushi spots marked on map...",
  "🎭 Drama-free planning in progress...",
  "🌊 Riding the wave of wanderlust...",
  "🎨 Masterpiece mode: ON",
  "🚀 T-minus awesome launching soon...",
  "🎪 Three-ring travel circus assembling...",
  "🌮 Emergency taco protocol engaged...",
  "🎉 Party planning for one (you!)...",
  "🗿 Ancient wisdom consulting...",
  "🎪 Juggling your schedule perfectly...",
  "🌟 Star-studded itinerary loading...",
];

export const getRandomMessage = (): string => {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
};

