import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Place, Recommendation } from '../types';
import { placesService } from '../services/placesService';

interface PlacesState {
  places: Place[];
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  selectedPlace: Place | null;
}

type PlacesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PLACES'; payload: Place[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SELECT_PLACE'; payload: Place | null }
  | { type: 'ADD_PLACE'; payload: Place }
  | { type: 'UPDATE_PLACE'; payload: Place }
  | { type: 'DELETE_PLACE'; payload: string };

const initialState: PlacesState = {
  places: [],
  recommendations: [],
  loading: false,
  error: null,
  selectedPlace: null,
};

const placesReducer = (state: PlacesState, action: PlacesAction): PlacesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PLACES':
      return { ...state, places: action.payload, loading: false };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SELECT_PLACE':
      return { ...state, selectedPlace: action.payload };
    case 'ADD_PLACE':
      return { ...state, places: [...state.places, action.payload] };
    case 'UPDATE_PLACE':
      return {
        ...state,
        places: state.places.map(place =>
          place.id === action.payload.id ? action.payload : place
        ),
      };
    case 'DELETE_PLACE':
      return {
        ...state,
        places: state.places.filter(place => place.id !== action.payload),
      };
    default:
      return state;
  }
};

interface PlacesContextType {
  state: PlacesState;
  fetchPlaces: () => Promise<void>;
  fetchRecommendations: (userId: string) => Promise<void>;
  selectPlace: (place: Place | null) => void;
  addPlace: (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlace: (place: Place) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export const PlacesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(placesReducer, initialState);

  const fetchPlaces = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const places = await placesService.getPlaces();
      dispatch({ type: 'SET_PLACES', payload: places });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch places' });
    }
  };

  const fetchRecommendations = async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const recommendations = await placesService.getRecommendations(userId);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch recommendations' });
    }
  };

  const selectPlace = (place: Place | null) => {
    dispatch({ type: 'SELECT_PLACE', payload: place });
  };

  const addPlace = async (placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlace = await placesService.createPlace(placeData);
      dispatch({ type: 'ADD_PLACE', payload: newPlace });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add place' });
    }
  };

  const updatePlace = async (place: Place) => {
    try {
      const updatedPlace = await placesService.updatePlace(place);
      dispatch({ type: 'UPDATE_PLACE', payload: updatedPlace });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update place' });
    }
  };

  const deletePlace = async (id: string) => {
    try {
      await placesService.deletePlace(id);
      dispatch({ type: 'DELETE_PLACE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete place' });
    }
  };

  return (
    <PlacesContext.Provider
      value={{
        state,
        fetchPlaces,
        fetchRecommendations,
        selectPlace,
        addPlace,
        updatePlace,
        deletePlace,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlaces = () => {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
};





