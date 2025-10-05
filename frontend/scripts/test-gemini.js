#!/usr/bin/env node

// Script to test Gemini API responses
// Usage: node scripts/test-gemini.js

// Simple test runner that doesn't require complex imports
const path = require('path');

async function main() {
  console.log('🚀 Starting Gemini API Tests...\n');
  
  // Check if API key is set
  if (!process.env.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY === 'test-api-key') {
    console.log('⚠️  Warning: No valid Gemini API key found.');
    console.log('   Set REACT_APP_GEMINI_API_KEY environment variable to test with real API.\n');
  }
  
  try {
    // Run all tests
    const results = await runGeminiTests();
    
    // Test specific scenarios
    console.log('\n🔬 Testing Specific Scenarios:');
    
    // Test adding an activity
    await testItineraryItem('add ice cream shop to my itinerary', []);
    
    // Test location query
    await testItineraryItem('tell me about vancouver museums', []);
    
    // Test with existing itinerary
    const existingItinerary = [
      {
        id: 1,
        date: '2024-01-15',
        time: '09:00',
        location: 'Central Park',
        address: 'New York, NY 10024',
        activity: 'Morning Walk',
        duration: '2 hours',
        type: 'activity',
        rating: 4.8,
        coordinates: [40.7829, -73.9654]
      }
    ];
    
    await testItineraryItem('add a restaurant near central park', existingItinerary);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
