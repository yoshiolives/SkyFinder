// Test Runner for Gemini API Validation
// Run this to test your Gemini API responses

const { getRealGeminiResponse } = require('../services/geminiService.js');
const { validateGeminiResponse } = require('./geminiApiIntegration.test.js');

// Test cases for Gemini API validation
const testCases = [
  {
    name: 'Add Activity Test',
    message: 'add central park to my itinerary',
    itinerary: [],
    expectedFields: ['text', 'itineraryUpdate']
  },
  {
    name: 'Location Information Test',
    message: 'tell me about the metropolitan museum',
    itinerary: [],
    expectedFields: ['text']
  },
  {
    name: 'Itinerary Planning Test',
    message: 'help me plan my itinerary for NYC',
    itinerary: [
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
    ],
    expectedFields: ['text']
  },
  {
    name: 'Food Recommendation Test',
    message: 'recommend a good restaurant near times square',
    itinerary: [],
    expectedFields: ['text']
  },
  {
    name: 'Remove Activity Test',
    message: 'remove central park from my itinerary',
    itinerary: [
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
    ],
    expectedFields: ['text', 'itineraryUpdate']
  }
];

// Function to run all tests
export const runGeminiTests = async () => {
  console.log('🧪 Running Gemini API Tests...\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const response = await getRealGeminiResponse(testCase.message, testCase.itinerary);
      
      // Validate response structure
      const validationErrors = validateGeminiResponse(response);
      
      if (validationErrors.length > 0) {
        console.log(`❌ ${testCase.name} - Validation Errors:`);
        validationErrors.forEach(error => console.log(`   - ${error}`));
        results.push({ name: testCase.name, status: 'FAILED', errors: validationErrors });
      } else {
        console.log(`✅ ${testCase.name} - Passed`);
        results.push({ name: testCase.name, status: 'PASSED', errors: [] });
      }
      
      // Check expected fields
      testCase.expectedFields.forEach(field => {
        if (!response.hasOwnProperty(field)) {
          console.log(`❌ ${testCase.name} - Missing expected field: ${field}`);
        }
      });
      
      // Log response for debugging
      console.log(`   Response: ${JSON.stringify(response, null, 2)}\n`);
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - Error: ${error.message}`);
      results.push({ name: testCase.name, status: 'ERROR', errors: [error.message] });
    }
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Errors: ${errors}`);
  
  return results;
};

// Function to test specific itinerary item validation
export const testItineraryItem = async (message, itinerary = []) => {
  console.log(`\n🔍 Testing: "${message}"`);
  
  try {
    const response = await getRealGeminiResponse(message, itinerary);
    const validationErrors = validateGeminiResponse(response);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation Errors:');
      validationErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ Response is valid');
    }
    
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return { response, errors: validationErrors };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { response: null, errors: [error.message] };
  }
};

// Function to validate a single itinerary item
export const validateItineraryItem = (item) => {
  const errors = [];
  const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];

  console.log(`\n🔍 Validating itinerary item: ${item.location || 'Unknown'}`);

  // Check required fields
  requiredFields.forEach(field => {
    if (!(field in item)) {
      errors.push(`Missing required field: ${field}`);
    } else if (item[field] === null || item[field] === undefined) {
      errors.push(`Field ${field} is null or undefined`);
    }
  });

  // Validate data types
  if (item.id !== undefined && typeof item.id !== 'number') {
    errors.push('ID must be a number');
  }

  if (item.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  if (item.time !== undefined && !/^\d{2}:\d{2}$/.test(item.time)) {
    errors.push('Time must be in HH:MM format');
  }

  if (item.coordinates !== undefined) {
    if (!Array.isArray(item.coordinates) || item.coordinates.length !== 2) {
      errors.push('Coordinates must be an array of 2 numbers [lat, lng]');
    } else {
      const [lat, lng] = item.coordinates;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push('Coordinates must contain numbers');
      }
      if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      if (lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
  }

  if (item.rating !== undefined) {
    if (typeof item.rating !== 'number' || item.rating < 0 || item.rating > 5) {
      errors.push('Rating must be a number between 0 and 5');
    }
  }

  if (errors.length > 0) {
    console.log('❌ Validation Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ Item is valid');
  }

  return errors;
};

// Export for use in other files
module.exports = {
  runGeminiTests,
  testItineraryItem,
  validateItineraryItem
};
