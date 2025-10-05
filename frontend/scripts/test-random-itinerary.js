// Test script for AI-powered itinerary generation
// Run with: node scripts/test-random-itinerary.js

const { getGeminiResponse, generateAIItinerary } = require('../src/services/geminiService');

async function testAIItinerary() {
  console.log('🤖 Testing AI-Powered Itinerary Generation\n');
  
  // Test 1: Direct function call
  console.log('1. Testing generateAIItinerary() function:');
  try {
    const aiItinerary = await generateAIItinerary("Vancouver, BC", "2 weeks");
    console.log(`   ✅ Generated ${aiItinerary.length} activities for 2 weeks in Vancouver:`);
    aiItinerary.slice(0, 5).forEach((activity, index) => {
      console.log(`   ${index + 1}. ${activity.location} at ${activity.time} (${activity.duration})`);
    });
    if (aiItinerary.length > 5) {
      console.log(`   ... and ${aiItinerary.length - 5} more activities`);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n2. Testing via chat interface:');
  try {
    const response = await getGeminiResponse('create a 2 week itinerary for Vancouver', []);
    console.log('   ✅ Chat response:', response.text);
    if (response.itineraryUpdate) {
      console.log(`   📅 Generated ${response.itineraryUpdate.length} activities`);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n3. Testing different durations and locations:');
  const testCases = [
    'plan a 1 week trip to Toronto',
    'create a 3 week itinerary for Montreal', 
    'build a 2 week schedule for Calgary',
    'generate a month-long itinerary for Vancouver'
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await getGeminiResponse(testCase, []);
      console.log(`   ✅ "${testCase}": ${response.text.substring(0, 60)}...`);
    } catch (error) {
      console.log(`   ❌ "${testCase}": Error - ${error.message}`);
    }
  }
  
  console.log('\n🎉 AI itinerary generation test completed!');
  console.log('\nTo use in the app:');
  console.log('- Say "create a 2 week itinerary for Vancouver"');
  console.log('- Say "plan a 1 week trip to Toronto"');
  console.log('- Say "build a 3 week schedule for Montreal"');
  console.log('- Say "generate a month-long itinerary"');
}

// Run the test
testAIItinerary().catch(console.error);
