// Jest setup file
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-maps-key';

// Mock Google Maps
global.google = {
  maps: {
    Size: jest.fn().mockImplementation((width, height) => ({ width, height })),
    Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
