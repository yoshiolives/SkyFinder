import axios from 'axios';
import { AISuggestion } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiService = {
  async getSuggestions(
    userPreferences: any,
    location?: { lat: number; lng: number }
  ): Promise<AISuggestion[]> {
    const response = await api.post('/ai/suggestions', {
      preferences: userPreferences,
      location,
    });
    return response.data;
  },

  async sendMessage(
    message: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>
  ): Promise<string> {
    const response = await api.post('/ai/chat', {
      message,
      history: chatHistory,
    });
    return response.data.response;
  },

  async generatePlaceDescription(placeData: {
    name: string;
    category: string;
    location: { lat: number; lng: number };
  }): Promise<string> {
    const response = await api.post('/ai/describe-place', placeData);
    return response.data.description;
  },

  async analyzeUserPreferences(userHistory: any[]): Promise<any> {
    const response = await api.post('/ai/analyze-preferences', {
      history: userHistory,
    });
    return response.data;
  },
};





