export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  placeId: string;
  userId: string;
  reason: string;
  confidence: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  categories: string[];
  priceRange: [number, number];
  maxDistance: number;
  ratingThreshold: number;
}

export interface AISuggestion {
  placeId: string;
  reason: string;
  confidence: number;
  personalizedNote: string;
}





