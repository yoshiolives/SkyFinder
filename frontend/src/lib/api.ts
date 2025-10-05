import axios, { type AxiosRequestConfig } from 'axios';
import { supabase } from './supabase';

// Helper to get the current session token
async function getAuthHeaders() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return {};
    }

    if (session?.access_token) {
      console.log('Auth token found, user:', session.user.email);
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }

    console.warn('No active session found');
    return {};
  } catch (error) {
    console.error('Failed to get auth headers:', error);
    return {};
  }
}

// Create authenticated axios instance
export const api = {
  async get(url: string, config?: AxiosRequestConfig) {
    const headers = await getAuthHeaders();
    return axios.get(url, {
      ...config,
      headers: { ...headers, ...config?.headers },
    });
  },

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const headers = await getAuthHeaders();
    return axios.post(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers },
    });
  },

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const headers = await getAuthHeaders();
    return axios.put(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers },
    });
  },

  async delete(url: string, config?: AxiosRequestConfig) {
    const headers = await getAuthHeaders();
    return axios.delete(url, {
      ...config,
      headers: { ...headers, ...config?.headers },
    });
  },
};
