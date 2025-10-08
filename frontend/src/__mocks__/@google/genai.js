// Mock for @google/genai library
export const GoogleGenAI = jest.fn().mockImplementation(() => ({
  models: {
    generateContent: jest.fn(),
  },
}));
