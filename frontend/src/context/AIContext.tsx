import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AISuggestion } from '../types';
import { aiService } from '../services/aiService';

interface AIState {
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
}

type AIAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUGGESTIONS'; payload: AISuggestion[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { role: 'user' | 'assistant'; content: string } }
  | { type: 'CLEAR_CHAT' };

const initialState: AIState = {
  suggestions: [],
  loading: false,
  error: null,
  chatHistory: [],
};

const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [
          ...state.chatHistory,
          { ...action.payload, timestamp: new Date() },
        ],
      };
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };
    default:
      return state;
  }
};

interface AIContextType {
  state: AIState;
  getSuggestions: (userPreferences: any, location?: { lat: number; lng: number }) => Promise<void>;
  sendMessage: (message: string) => Promise<string>;
  clearChat: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const getSuggestions = async (userPreferences: any, location?: { lat: number; lng: number }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const suggestions = await aiService.getSuggestions(userPreferences, location);
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get AI suggestions' });
    }
  };

  const sendMessage = async (message: string): Promise<string> => {
    try {
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content: message } });
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await aiService.sendMessage(message, state.chatHistory);
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: response } });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_CHAT' });
  };

  return (
    <AIContext.Provider
      value={{
        state,
        getSuggestions,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};





