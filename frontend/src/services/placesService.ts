import axios from 'axios';
import { Place, Recommendation } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const placesService = {
  async getPlaces(): Promise<Place[]> {
    const response = await api.get('/places');
    return response.data;
  },

  async getPlaceById(id: string): Promise<Place> {
    const response = await api.get(`/places/${id}`);
    return response.data;
  },

  async createPlace(placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    const response = await api.post('/places', placeData);
    return response.data;
  },

  async updatePlace(place: Place): Promise<Place> {
    const response = await api.put(`/places/${place.id}`, place);
    return response.data;
  },

  async deletePlace(id: string): Promise<void> {
    await api.delete(`/places/${id}`);
  },

  async getRecommendations(userId: string): Promise<Recommendation[]> {
    const response = await api.get(`/recommendations/${userId}`);
    return response.data;
  },

  async searchPlaces(query: string, filters?: {
    category?: string;
    priceLevel?: number;
    rating?: number;
    location?: { lat: number; lng: number; radius: number };
  }): Promise<Place[]> {
    const response = await api.get('/places/search', {
      params: { query, ...filters },
    });
    return response.data;
  },

  async getNearbyPlaces(location: { lat: number; lng: number }, radius: number = 5000): Promise<Place[]> {
    const response = await api.get('/places/nearby', {
      params: { lat: location.lat, lng: location.lng, radius },
    });
    return response.data;
  },
};





