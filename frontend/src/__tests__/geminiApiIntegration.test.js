// Mock Gemini Service Tests
// Tests for the mock Gemini service functionality

import { getGeminiResponse, generateAIItinerary } from '../services/geminiService';

describe('Mock Gemini Service Tests', () => {
  describe('Basic Functionality', () => {
    test('should respond to hello messages', async () => {
      const response = await getGeminiResponse('hello', []);
      
      expect(response).toHaveProperty('text');
      expect(response.text).toContain('AI travel assistant');
      expect(response.itineraryUpdate).toBeNull();
    });

    test('should add activities to itinerary', async () => {
      const response = await getGeminiResponse('add stanley park to my itinerary', []);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
      expect(response.text).toContain('Stanley Park');
      expect(Array.isArray(response.itineraryUpdate)).toBe(true);
      expect(response.itineraryUpdate.length).toBe(1);
    });

    test('should provide information about locations', async () => {
      const response = await getGeminiResponse('tell me about stanley park', []);
      
      expect(response).toHaveProperty('text');
      expect(response.text).toContain('Stanley Park');
      expect(response.itineraryUpdate).toBeNull();
    });

    test('should handle remove requests', async () => {
      const testItinerary = [
        {
          id: 1,
          location: 'Stanley Park',
          date: '2024-01-17',
          time: '14:00',
          address: 'Vancouver, BC',
          activity: 'Park Walk',
          duration: '2 hours',
          type: 'activity',
          rating: 4.0,
          coordinates: [49.3043, -123.1443]
        }
      ];
      
      const response = await getGeminiResponse('remove stanley park', testItinerary);
      
      expect(response).toHaveProperty('text');
      expect(response.text).toContain('removed');
      expect(response.itineraryUpdate).toEqual([]);
    });

    test('should generate AI-powered itineraries', async () => {
      const response = await getGeminiResponse('create a 2 week itinerary for Vancouver', []);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
      expect(response.text).toContain('comprehensive');
      expect(Array.isArray(response.itineraryUpdate)).toBe(true);
      expect(response.itineraryUpdate.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Response Structure Validation', () => {
    test('should return valid response structure', async () => {
      const response = await getGeminiResponse('hello', []);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('itineraryUpdate');
      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(0);
    });

    test('should return valid itinerary items when adding activities', async () => {
      const response = await getGeminiResponse('add museum to my itinerary', []);
      
      if (response.itineraryUpdate && response.itineraryUpdate.length > 0) {
        const item = response.itineraryUpdate[0];
        
        // Validate all required fields exist
        const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];
        requiredFields.forEach(field => {
          expect(item).toHaveProperty(field);
          expect(item[field]).toBeDefined();
        });

        // Validate data types
        expect(typeof item.id).toBe('number');
        expect(typeof item.date).toBe('string');
        expect(typeof item.time).toBe('string');
        expect(typeof item.location).toBe('string');
        expect(typeof item.address).toBe('string');
        expect(typeof item.activity).toBe('string');
        expect(typeof item.duration).toBe('string');
        expect(typeof item.type).toBe('string');
        expect(typeof item.rating).toBe('number');
        expect(Array.isArray(item.coordinates)).toBe(true);
        expect(item.coordinates).toHaveLength(2);
      }
    });
  });

  describe('AI Itinerary Generation', () => {
    test('should generate AI itinerary with correct structure', async () => {
      const aiItinerary = await generateAIItinerary("Vancouver, BC", "2 weeks");
      
      expect(Array.isArray(aiItinerary)).toBe(true);
      expect(aiItinerary.length).toBeGreaterThanOrEqual(3);
      
      aiItinerary.forEach((item, index) => {
        // Validate all required fields exist
        const requiredFields = ['id', 'date', 'time', 'location', 'address', 'activity', 'duration', 'type', 'rating', 'coordinates'];
        requiredFields.forEach(field => {
          expect(item).toHaveProperty(field);
          expect(item[field]).toBeDefined();
        });

        // Validate data types
        expect(typeof item.id).toBe('number');
        expect(typeof item.date).toBe('string');
        expect(typeof item.time).toBe('string');
        expect(typeof item.location).toBe('string');
        expect(typeof item.address).toBe('string');
        expect(typeof item.activity).toBe('string');
        expect(typeof item.duration).toBe('string');
        expect(typeof item.type).toBe('string');
        expect(typeof item.rating).toBe('number');
        expect(Array.isArray(item.coordinates)).toBe(true);
        expect(item.coordinates).toHaveLength(2);
      });
    });

    test('should handle different durations and locations', async () => {
      const oneWeek = await generateAIItinerary("Toronto, ON", "1 week");
      const threeWeeks = await generateAIItinerary("Montreal, QC", "3 weeks");
      
      expect(Array.isArray(oneWeek)).toBe(true);
      expect(Array.isArray(threeWeeks)).toBe(true);
      expect(oneWeek.length).toBeGreaterThanOrEqual(3);
      expect(threeWeeks.length).toBeGreaterThanOrEqual(3);
    });
  });
});
