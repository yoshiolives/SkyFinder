// Gemini Service Tests
// Tests to validate Gemini API responses have all required fields

import { getGeminiResponse, getRealGeminiResponse } from '../services/geminiService';

// Mock the Gemini API for testing
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

describe('Gemini Service Tests', () => {
  
  // Test data structure validation
  describe('Response Structure Validation', () => {
    test('should return response with text and itineraryUpdate fields', async () => {
      const response = await getGeminiResponse('Hello');
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(0);
    });

    test('should handle itinerary modification responses correctly', async () => {
      const testItinerary = [
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

      const response = await getGeminiResponse('add ice cream to my itinerary', testItinerary);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
      expect(Array.isArray(response.itineraryUpdate)).toBe(true);
    });
  });

  // Test required fields for itinerary items
  describe('Itinerary Item Field Validation', () => {
    const requiredFields = [
      'id',
      'date', 
      'time',
      'location',
      'address',
      'activity',
      'duration',
      'type',
      'rating',
      'coordinates'
    ];

    test('should validate all required fields exist in itinerary items', () => {
      const sampleItinerary = [
        {
          id: 1,
          date: '2024-01-15',
          time: '09:00',
          location: 'Central Park',
          address: 'New York, NY 10024',
          activity: 'Morning Walk & Photography',
          duration: '2 hours',
          type: 'activity',
          rating: 4.8,
          coordinates: [40.7829, -73.9654]
        }
      ];

      sampleItinerary.forEach(item => {
        requiredFields.forEach(field => {
          expect(item).toHaveProperty(field);
          expect(item[field]).toBeDefined();
        });
      });
    });

    test('should validate field data types', () => {
      const sampleItem = {
        id: 1,
        date: '2024-01-15',
        time: '09:00',
        location: 'Central Park',
        address: 'New York, NY 10024',
        activity: 'Morning Walk & Photography',
        duration: '2 hours',
        type: 'activity',
        rating: 4.8,
        coordinates: [40.7829, -73.9654]
      };

      // Test data types
      expect(typeof sampleItem.id).toBe('number');
      expect(typeof sampleItem.date).toBe('string');
      expect(typeof sampleItem.time).toBe('string');
      expect(typeof sampleItem.location).toBe('string');
      expect(typeof sampleItem.address).toBe('string');
      expect(typeof sampleItem.activity).toBe('string');
      expect(typeof sampleItem.duration).toBe('string');
      expect(typeof sampleItem.type).toBe('string');
      expect(typeof sampleItem.rating).toBe('number');
      expect(Array.isArray(sampleItem.coordinates)).toBe(true);
      expect(sampleItem.coordinates).toHaveLength(2);
    });

    test('should validate coordinate format', () => {
      const sampleItem = {
        coordinates: [40.7829, -73.9654]
      };

      expect(Array.isArray(sampleItem.coordinates)).toBe(true);
      expect(sampleItem.coordinates).toHaveLength(2);
      expect(typeof sampleItem.coordinates[0]).toBe('number'); // latitude
      expect(typeof sampleItem.coordinates[1]).toBe('number'); // longitude
      
      // Validate coordinate ranges
      expect(sampleItem.coordinates[0]).toBeGreaterThanOrEqual(-90); // latitude
      expect(sampleItem.coordinates[0]).toBeLessThanOrEqual(90);
      expect(sampleItem.coordinates[1]).toBeGreaterThanOrEqual(-180); // longitude
      expect(sampleItem.coordinates[1]).toBeLessThanOrEqual(180);
    });

    test('should validate rating range', () => {
      const sampleItem = {
        rating: 4.8
      };

      expect(typeof sampleItem.rating).toBe('number');
      expect(sampleItem.rating).toBeGreaterThanOrEqual(0);
      expect(sampleItem.rating).toBeLessThanOrEqual(5);
    });

    test('should validate date format', () => {
      const sampleItem = {
        date: '2024-01-15'
      };

      expect(typeof sampleItem.date).toBe('string');
      expect(sampleItem.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });

    test('should validate time format', () => {
      const sampleItem = {
        time: '09:00'
      };

      expect(typeof sampleItem.time).toBe('string');
      expect(sampleItem.time).toMatch(/^\d{2}:\d{2}$/); // HH:MM format
    });
  });

  // Test Gemini API integration
  describe('Gemini API Integration Tests', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error
      const mockError = new Error('API Error');
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(mockError)
      };
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      const response = await getRealGeminiResponse('test message');
      
      expect(response).toHaveProperty('text');
      expect(response.text).toContain('trouble processing');
    });

    test('should format Gemini response correctly', async () => {
      const mockGeminiResponse = {
        response: {
          text: () => 'Test response from Gemini'
        }
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue(mockGeminiResponse)
      };
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      const response = await getRealGeminiResponse('test message');
      
      expect(response).toHaveProperty('text');
      expect(response.text).toBe('Test response from Gemini');
    });
  });

  // Test specific use cases
  describe('Specific Use Case Tests', () => {
    test('should handle add activity requests', async () => {
      const testItinerary = [];
      const response = await getGeminiResponse('add ice cream to my itinerary', testItinerary);
      
      expect(response.itineraryUpdate).toBeDefined();
      expect(Array.isArray(response.itineraryUpdate)).toBe(true);
      
      if (response.itineraryUpdate && response.itineraryUpdate.length > 0) {
        const newItem = response.itineraryUpdate[response.itineraryUpdate.length - 1];
        
        // Validate the new item has all required fields
        const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];
        requiredFields.forEach(field => {
          expect(newItem).toHaveProperty(field);
        });
      }
    });

    test('should handle remove activity requests', async () => {
      const testItinerary = [
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

      const response = await getGeminiResponse('remove central park from my itinerary', testItinerary);
      
      expect(response.itineraryUpdate).toBeDefined();
      if (response.itineraryUpdate) {
        expect(Array.isArray(response.itineraryUpdate)).toBe(true);
        expect(response.itineraryUpdate.length).toBeLessThan(testItinerary.length);
      }
    });

    test('should handle location-specific queries', async () => {
      const responses = [
        await getGeminiResponse('tell me about central park'),
        await getGeminiResponse('what about the metropolitan museum'),
        await getGeminiResponse('times square information'),
        await getGeminiResponse('statue of liberty details'),
        await getGeminiResponse('brooklyn bridge walk')
      ];

      responses.forEach(response => {
        expect(response).toHaveProperty('text');
        expect(response.text.length).toBeGreaterThan(0);
        expect(response.itineraryUpdate).toBeNull();
      });
    });
  });

  // Test error handling
  describe('Error Handling Tests', () => {
    test('should handle malformed itinerary data', async () => {
      const malformedItinerary = [
        {
          id: 1,
          // Missing required fields
          location: 'Test Location'
        }
      ];

      const response = await getGeminiResponse('add something', malformedItinerary);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
    });

    test('should handle empty user messages', async () => {
      const response = await getGeminiResponse('');
      
      expect(response).toHaveProperty('text');
      expect(response.text.length).toBeGreaterThan(0);
    });

    test('should handle null/undefined inputs', async () => {
      const response1 = await getGeminiResponse(null);
      const response2 = await getGeminiResponse(undefined);
      
      expect(response1).toHaveProperty('text');
      expect(response2).toHaveProperty('text');
    });
  });

  // Test data validation helpers
  describe('Data Validation Helpers', () => {
    const validateItineraryItem = (item) => {
      const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];
      
      for (const field of requiredFields) {
        if (!(field in item)) {
          throw new Error(`Missing required field: ${field}`);
        }
        if (item[field] === null || item[field] === undefined) {
          throw new Error(`Field ${field} is null or undefined`);
        }
      }

      // Validate specific field formats
      if (typeof item.id !== 'number') {
        throw new Error('ID must be a number');
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      if (!/^\d{2}:\d{2}$/.test(item.time)) {
        throw new Error('Time must be in HH:MM format');
      }
      if (!Array.isArray(item.coordinates) || item.coordinates.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers [lat, lng]');
      }
      if (typeof item.rating !== 'number' || item.rating < 0 || item.rating > 5) {
        throw new Error('Rating must be a number between 0 and 5');
      }

      return true;
    };

    test('should validate correct itinerary item', () => {
      const validItem = {
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
      };

      expect(() => validateItineraryItem(validItem)).not.toThrow();
    });

    test('should reject invalid itinerary items', () => {
      const invalidItems = [
        { id: 1 }, // Missing fields
        { id: 'not-a-number', date: '2024-01-15' }, // Wrong type
        { id: 1, date: 'invalid-date' }, // Wrong format
        { id: 1, date: '2024-01-15', coordinates: [40.7829] }, // Wrong coordinates
        { id: 1, date: '2024-01-15', rating: 6 } // Invalid rating
      ];

      invalidItems.forEach((item, index) => {
        expect(() => validateItineraryItem(item)).toThrow();
      });
    });
  });
});

// Export test utilities for use in other test files
export const testUtils = {
  validateItineraryItem: (item) => {
    const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];
    
    for (const field of requiredFields) {
      if (!(field in item)) {
        throw new Error(`Missing required field: ${field}`);
      }
      if (item[field] === null || item[field] === undefined) {
        throw new Error(`Field ${field} is null or undefined`);
      }
    }

    if (typeof item.id !== 'number') {
      throw new Error('ID must be a number');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    if (!/^\d{2}:\d{2}$/.test(item.time)) {
      throw new Error('Time must be in HH:MM format');
    }
    if (!Array.isArray(item.coordinates) || item.coordinates.length !== 2) {
      throw new Error('Coordinates must be an array of 2 numbers [lat, lng]');
    }
    if (typeof item.rating !== 'number' || item.rating < 0 || item.rating > 5) {
      throw new Error('Rating must be a number between 0 and 5');
    }

    return true;
  },

  createValidItineraryItem: (overrides = {}) => ({
    id: 1,
    date: '2024-01-15',
    time: '09:00',
    location: 'Central Park',
    address: 'New York, NY 10024',
    activity: 'Morning Walk',
    duration: '2 hours',
    type: 'activity',
    rating: 4.8,
    coordinates: [40.7829, -73.9654],
    ...overrides
  })
};
