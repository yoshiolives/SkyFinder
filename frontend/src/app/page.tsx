'use client';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  AccountCircle,
  Add as AddIcon,
  Attractions as AttractionsIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  KeyboardArrowDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Directions as DirectionsIcon,
  Edit as EditIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Museum as MuseumIcon,
  Place as PlaceIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  ShoppingBag as ShoppingIcon,
  Star as StarIcon,
  Support as SupportIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Data, GoogleMap, InfoWindow, Marker, useLoadScript } from '@react-google-maps/api';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ChatBot from '@/components/ChatBot';
import LandingPage from '@/components/LandingPage';
import LoginModal from '@/components/LoginModal';
import TripSelector from '@/components/TripSelector';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { formatLocalDate, formatLocalDateSimple } from '@/lib/utils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // iOS Blue
      light: '#4DA6FF',
      dark: '#0056CC',
    },
    secondary: {
      main: '#5856D6', // iOS Purple
      light: '#7B79E6',
      dark: '#3D3BC6',
    },
    background: {
      default: '#F2F2F7', // iOS Background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F', // iOS Text Primary
      secondary: '#8E8E93', // iOS Text Secondary
    },
    grey: {
      50: '#F2F2F7',
      100: '#E5E5EA',
      200: '#D1D1D6',
      300: '#C7C7CC',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#1C1C1E',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'SF Pro Text',
      'Helvetica Neue',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12, // Apple's preferred border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default function Home() {
  // Load Google Maps script (prevents duplicate loading on hot reload)
  const { isLoaded: isGoogleMapsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'] as any,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any[]>([]);
  
  // Saved Lists state
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [listItems, setListItems] = useState<any[]>([]);
  const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('📌');
  const [newListColor, setNewListColor] = useState('#4285F4');
  const [sidebarView, setSidebarView] = useState<'itinerary' | 'lists'>('lists'); // Default to lists
  
  const [user, setUser] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripSelectorOpen, setTripSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [newActivity, setNewActivity] = useState<any>({
    location: '',
    address: '',
    activity: '',
    type: 'activity',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '2 hours',
    rating: 4.5,
    coordinates: [40.758, -73.9855], // Default to Times Square
  });
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [activitySuggestions, setActivitySuggestions] = useState<any[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTripTitle, setEditedTripTitle] = useState('');
  const hasLoadedDataRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapControls, setShowMapControls] = useState(false);
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [bookNowSnackbarOpen, setBookNowSnackbarOpen] = useState(false);
  const [transitDataLoaded, setTransitDataLoaded] = useState(false);
  const [transitStations, setTransitStations] = useState<any[]>([]);
  const [transitLines, setTransitLines] = useState<any[]>([]);
  const [selectedStations, setSelectedStations] = useState<Set<number>>(new Set());
  const circlesRef = useRef<Map<number, google.maps.Circle>>(new Map());
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const selectedStationsRef = useRef<Set<number>>(new Set());

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<any | null>(null);

  // Detect if device is mobile/touch device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check if device has touch capability and is actually a mobile device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // Use pointer media query to detect coarse pointer (typically touch devices)
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

      // Only disable drag on actual mobile/touch devices, not just narrow desktop windows
      const mobile = isMobileUserAgent || (isTouchDevice && hasCoarsePointer);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keep the ref in sync with the state
  useEffect(() => {
    selectedStationsRef.current = new Set(selectedStations);
  }, [selectedStations]);

  // Get user's current location and set map center
  useEffect(() => {
    if (!mapCenter && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          console.log('📍 Location detected:', latitude, longitude);
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          // Fallback to default location (Times Square, NYC)
          setMapCenter({ lat: 40.758, lng: -73.9855 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, [mapCenter]);

  // Load transit data dynamically from all GeoJSON files
  useEffect(() => {
    const loadTransitData = async () => {
      if (!mapReady || transitDataLoaded) return;

      try {
        // Get list of all GeoJSON files
        const response = await fetch('/api/transit');
        const { files } = await response.json();
        

        const stations: any[] = [];
        const lines: any[] = [];

        // Load each file
        for (const file of files) {
          try {
            const fileResponse = await fetch(file.url);
            const geoJson = await fileResponse.json();
            
            
            // Transform and categorize features
            geoJson.features.forEach((feature: any) => {
              // Transform coordinates if needed (for EPSG:3857 to WGS84)
              if (feature.properties?.Stn_Latitude && feature.properties?.Stn_Longtitude) {
                stations.push({
                  ...feature,
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      feature.properties.Stn_Longtitude,
                      feature.properties.Stn_Latitude,
                    ],
                  },
                });
              } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                lines.push(feature);
              } else if (feature.geometry.type === 'Point') {
                stations.push(feature);
              }
            });
            
          } catch (fileError) {
            console.error(`❌ Failed to load ${file.filename}:`, fileError);
          }
        }
        
        setTransitStations(stations);
        setTransitLines(lines);
        setTransitDataLoaded(true);
        
        console.log('🚇 Transit data loaded:', {
          stations: stations.length,
          lines: lines.length,
        });
      } catch (error) {
        console.error('❌ Failed to load transit data:', error);
      }
    };

    loadTransitData();
  }, [mapReady, transitDataLoaded]);

  // Handle Book Now button click
  const handleBookNow = () => {
    setBookNowSnackbarOpen(true);
  };

  // Handle station marker click - toggle coverage circle
  const handleStationClick = useCallback((stationIndex: number, event: any) => {
    // Prevent the InfoWindow from opening
    event.stop();
    
    const map = mapInstanceRef.current;
    if (!map) {
      console.error('Map instance not available');
      return;
    }
    
    const station = transitStations[stationIndex];
    if (!station) {
      return;
    }
    
    const coords = station.geometry.coordinates;
    if (!coords || coords.length < 2) {
      return;
    }
    
    // Check current state using the ref (immediate, synchronous)
    const isCurrentlySelected = selectedStationsRef.current.has(stationIndex);
    
    if (isCurrentlySelected) {
      // Remove circle
      const circle = circlesRef.current.get(stationIndex);
      console.log('🔍 Removing circle for station', stationIndex, 'Circle exists:', !!circle);
      if (circle) {
        console.log('🗑️ Calling setMap(null) on circle');
        circle.setMap(null);
        circlesRef.current.delete(stationIndex);
        selectedStationsRef.current.delete(stationIndex);
        console.log('✅ Circle removed');
      } else {
        console.warn('⚠️ No circle found in ref for station', stationIndex);
      }
    } else {
      // Add circle
      const circle = new google.maps.Circle({
        center: { lat: coords[0], lng: coords[1] },
        radius: 800,
        fillColor: '#4285F4',
        fillOpacity: 0.15,
        strokeColor: '#4285F4',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        clickable: false,
        zIndex: 1,
      });
      circle.setMap(map);
      circlesRef.current.set(stationIndex, circle);
      selectedStationsRef.current.add(stationIndex);
      console.log('➕ Added circle for station', stationIndex);
    }
    
    // Update the state for rendering (keeps UI in sync)
    setSelectedStations(new Set(selectedStationsRef.current));
  }, [transitStations]);

  // Handle Book Now snackbar close
  const handleBookNowSnackbarClose = () => {
    setBookNowSnackbarOpen(false);
  };

  // Handle search functionality using Google Places API directly
  const handleSearch = async (query: string) => {
    console.log('🔍 Search triggered:', { query, selectedStations: selectedStations.size });
    
    if (!query.trim() || selectedStations.size === 0) {
      console.log('⚠️ Search cancelled - no query or stations selected');
      setSearchResults([]);
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('❌ Google Maps Places API not loaded');
      return;
    }

    setIsSearching(true);
    try {
      // Get all selected station coordinates
      const stationCoords = Array.from(selectedStations).map((index) => {
        const station = transitStations[index];
        return {
          lat: station.geometry.coordinates[0],
          lng: station.geometry.coordinates[1],
        };
      });

      console.log('📍 Searching near stations:', stationCoords);

      // Search for places near each selected station using Google Places API
      const allResults: any[] = [];
      
      for (const coord of stationCoords) {
        try {
          console.log('🔎 Searching at:', coord);
          
          // Create a request for nearby search
          const request: google.maps.places.PlaceSearchRequest = {
            location: new google.maps.LatLng(coord.lat, coord.lng),
            radius: 800, // 800 meters to match circle radius
            keyword: query,
            type: 'restaurant', // Focus on restaurants and food places
          };

          // Use PlacesService to search
          const service = new google.maps.places.PlacesService(
            mapInstanceRef.current as google.maps.Map
          );

          // Wrap the callback in a Promise
          const results = await new Promise<any[]>((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                console.log(`✅ Found ${results.length} results near this station`);
                resolve(results);
              } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log('⚠️ No results found for this station');
                resolve([]);
              } else {
                console.error('❌ Places API error:', status);
                reject(new Error(`Places API error: ${status}`));
              }
            });
          });

          // Transform the results to our format and filter by distance
          const transformedResults = results
            .map((place) => {
              const placeLat = place.geometry?.location?.lat() || 0;
              const placeLng = place.geometry?.location?.lng() || 0;
              
              // Calculate distance from station center to place
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(coord.lat, coord.lng),
                new google.maps.LatLng(placeLat, placeLng)
              );
              
              return {
                place_id: place.place_id,
                name: place.name,
                address: place.vicinity || place.formatted_address || '',
                latitude: placeLat,
                longitude: placeLng,
                rating: place.rating || null,
                user_ratings_total: place.user_ratings_total || 0,
                price_level: place.price_level || null,
                types: place.types || [],
                photos: place.photos?.map((photo) => photo.getUrl()) || [],
                website: null, // Would need to fetch place details for this
                phone: null, // Would need to fetch place details for this
                distance: distance, // Store distance for filtering
              };
            })
            .filter((place) => place.distance <= 800); // Only include places within 800 meters

          console.log(`📍 Filtered to ${transformedResults.length} results within 800m radius`);
          allResults.push(...transformedResults);
        } catch (error) {
          console.error('❌ Error searching near station:', error);
        }
      }

      // Remove duplicates based on place_id
      const uniqueResults = Array.from(
        new Map(allResults.map((item) => [item.place_id, item])).values()
      );

      console.log('🎯 Total unique results:', uniqueResults.length);
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() && selectedStations.size > 0) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSearchResult(null);
  };

  // Hide search results dropdown
  const handleHideSearchResults = () => {
    setSearchResults([]);
  };

  // Fetch saved lists
  const fetchSavedLists = async () => {
    try {
      const response = await api.get('/api/lists');
      setSavedLists(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching saved lists:', error);
    }
  };

  // Create a new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      const response = await api.post('/api/lists', {
        name: newListName,
        icon: newListIcon,
        color: newListColor,
      });
      
      setSavedLists([...savedLists, response.data.list]);
      setCreateListDialogOpen(false);
      setNewListName('');
      setNewListIcon('📌');
      setNewListColor('#4285F4');
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  // Fetch items in a list
  const fetchListItems = async (listId: string) => {
    try {
      const response = await api.get(`/api/lists/${listId}/items`);
      setListItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching list items:', error);
    }
  };

  // Add place to list
  const handleAddToList = async (listId: string, place: any) => {
    try {
      await api.post(`/api/lists/${listId}/items`, place);
      // Refresh list items if this list is currently selected
      if (selectedList && selectedList.id === listId) {
        fetchListItems(listId);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('This place is already in the list!');
      } else {
        console.error('Error adding to list:', error);
        alert('Failed to add to list. Please try again.');
      }
    }
  };

  // Remove from list
  const handleRemoveFromList = async (listId: string, itemId: string) => {
    try {
      await api.delete(`/api/lists/${listId}/items/${itemId}`);
      // Refresh list items
      fetchListItems(listId);
    } catch (error) {
      console.error('Error removing from list:', error);
      alert('Failed to remove from list. Please try again.');
    }
  };

  // Delete a list
  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    
    try {
      await api.delete(`/api/lists/${listId}`);
      setSavedLists(savedLists.filter((list) => list.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
        setListItems([]);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list. Please try again.');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Press Escape to hide search results
      if (event.key === 'Escape' && searchResults.length > 0) {
        handleHideSearchResults();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the search area
      const searchContainer = document.querySelector('[data-search-container]');
      if (searchContainer && !searchContainer.contains(target)) {
        handleHideSearchResults();
      }
    };

    if (searchResults.length > 0) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [searchResults]);

  // Fetch saved lists when user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedLists();
    } else {
      setSavedLists([]);
      setSelectedList(null);
      setListItems([]);
    }
  }, [user]);

  // Handle date editing
  const handleDateEdit = () => {
    if (currentTrip) {
      setVacationStartDate(currentTrip.start_date);
      setVacationEndDate(currentTrip.end_date);
      setIsEditingDates(true);
    }
  };

  const handleDateCancel = () => {
    setIsEditingDates(false);
    setVacationStartDate('');
    setVacationEndDate('');
  };

  const handleDateSave = async () => {
    if (!currentTrip || !vacationStartDate || !vacationEndDate) return;

    try {
      // Update trip in database
      await api.put(`/api/trips/${currentTrip.id}`, {
        start_date: vacationStartDate,
        end_date: vacationEndDate,
      });

      // Update local state
      setCurrentTrip({
        ...currentTrip,
        start_date: vacationStartDate,
        end_date: vacationEndDate,
      });

      setIsEditingDates(false);
    } catch (error) {
      console.error('Failed to update trip dates:', error);
      alert('Failed to update trip dates. Please try again.');
    }
  };

  const loadTripItinerary = useCallback(async (trip: any) => {
    try {
      setLoading(true);
      setCurrentTrip(trip);

      // Initialize vacation dates
      if (trip.start_date && trip.end_date) {
        setVacationStartDate(trip.start_date);
        setVacationEndDate(trip.end_date);
      }

      // Fetch itinerary items for the selected trip
      console.log(`🔍 Fetching itinerary for trip ${trip.id}...`);
      const itineraryResponse = await api.get(`/api/itinerary?trip_id=${trip.id}`);
      const items = itineraryResponse.data.items;

      console.log(`📋 Loaded ${items?.length || 0} itinerary items:`, items);

      setItinerary(items || []);

      // Calculate map center from itinerary items or geocode destination
      if (items && items.length > 0) {
        // Calculate average coordinates from all items
        const avgLat =
          items.reduce((sum: number, item: any) => sum + item.coordinates[0], 0) / items.length;
        const avgLng =
          items.reduce((sum: number, item: any) => sum + item.coordinates[1], 0) / items.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      } else if (trip.destination && typeof window !== 'undefined' && window.google?.maps) {
        // No items yet, geocode the destination to center the map
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: trip.destination }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              setMapCenter({ lat: location.lat(), lng: location.lng() });
            } else {
              // Fallback to null if geocoding fails
              setMapCenter(null);
            }
          });
        } catch (error) {
          console.error('Geocoding failed:', error);
          setMapCenter(null);
        }
      } else {
        // No items and can't geocode, reset map center
        setMapCenter(null);
      }
      // Initialize expanded days for days that have activities (start collapsed by default)
      setExpandedDays(new Set());
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
      setItinerary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setTrips([]);
        setItinerary([]);
        setCurrentTrip(null);
      }
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Fetch trips when user logs in
    const fetchTrips = async () => {
      if (!user) {
        setTrips([]);
        setItinerary([]);
        setCurrentTrip(null);
        setLoading(false);
        hasLoadedDataRef.current = false;
        return;
      }

      // Only fetch if we haven't loaded data yet for this user
      if (hasLoadedDataRef.current) {
        return;
      }

      try {
        setLoading(true);
        // Fetch user's trips
        const tripsResponse = await api.get('/api/trips');
        const fetchedTrips = tripsResponse.data.trips;
        setTrips(fetchedTrips || []);

        if (fetchedTrips && fetchedTrips.length > 0) {
          // Load the first trip by default
          const firstTrip = fetchedTrips[0];
          await loadTripItinerary(firstTrip);
        } else {
          setItinerary([]);
          setCurrentTrip(null);
        }

        // Mark data as loaded
        hasLoadedDataRef.current = true;
      } catch (error) {
        console.error('Failed to fetch trips:', error);
        setTrips([]);
        setItinerary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user, loadTripItinerary]);

  const handleTripSelect = (trip: any) => {
    loadTripItinerary(trip);
  };

  const handleTripCreated = async (newTrip?: any) => {
    // Refresh trips list
    try {
      const tripsResponse = await api.get('/api/trips');
      const fetchedTrips = tripsResponse.data.trips;
      setTrips(fetchedTrips || []);

      // If we have the new trip, load it directly
      // Otherwise load the first trip in the refreshed list
      if (newTrip) {
        console.log('🎯 Auto-selecting newly created trip:', newTrip.title);
        console.log('🎯 New trip details:', newTrip);
        await loadTripItinerary(newTrip);
      } else if (fetchedTrips && fetchedTrips.length > 0) {
        console.log('🔄 Loading first trip from refreshed list');
        await loadTripItinerary(fetchedTrips[0]);
      }

      // Keep the loaded flag as true since we just loaded data
      hasLoadedDataRef.current = true;
    } catch (error) {
      console.error('Failed to refresh trips:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
      // Escape to close sidebar
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Handle drag start
  const handleDragStart = (result: any) => {
    // Disable drag on mobile devices
    if (isMobile) {
      return;
    }
    console.log('Drag start result:', result);
    setIsDragging(true);
  };

  // Track which day is being dragged over for hover-to-expand
  const [draggedOverDay, setDraggedOverDay] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dragFeedback, setDragFeedback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle hover-to-expand for empty day boxes
  useEffect(() => {
    if (isDragging && draggedOverDay) {
      // Get the activities for this day
      const dayActivities = itinerary.filter((item) => item.date === draggedOverDay);
      if (dayActivities.length === 0) {
        setExpandedDays((prev) => new Set([...Array.from(prev), draggedOverDay]));
      }
    } else if (isDragging && !draggedOverDay) {
      // Close all empty day boxes when not hovering over any
      const activitiesByDay = getActivitiesByDay();
      const emptyDays = Object.keys(activitiesByDay).filter(
        (day) => activitiesByDay[day].length === 0
      );

      setExpandedDays((prev) => {
        const newSet = new Set(Array.from(prev));
        emptyDays.forEach((day) => {
          newSet.delete(day);
        });
        return newSet;
      });
    }
  }, [isDragging, draggedOverDay, itinerary]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Auto-close empty day boxes when they become empty
  useEffect(() => {
    const activitiesByDay = getActivitiesByDay();
    const emptyDays = Object.keys(activitiesByDay).filter(
      (day) => activitiesByDay[day].length === 0
    );

    setExpandedDays((prev) => {
      const newSet = new Set(Array.from(prev));
      emptyDays.forEach((day) => {
        newSet.delete(day);
      });
      return newSet;
    });
  }, [itinerary]);

  // Handle drag and drop
  const handleDragEnd = async (result: any) => {
    console.log('Drag end result:', result);
    setIsDragging(false);
    setDraggedOverDay(null);

    // Disable drag on mobile devices
    if (isMobile) {
      return;
    }

    // Clear any pending hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Show drag feedback if successful drop
    if (result.destination) {
      setDragFeedback(true);
      // Haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => setDragFeedback(false), 300);
    }

    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    const { source, destination, draggableId } = result;
    const sourceDay = source.droppableId;
    const destinationDay = destination.droppableId;

    console.log('Moving from', sourceDay, 'to', destinationDay);
    console.log('All vacation days:', generateVacationDays());
    console.log('Source day exists:', generateVacationDays().includes(sourceDay));
    console.log('Destination day exists:', generateVacationDays().includes(destinationDay));

    if (sourceDay === destinationDay) {
      // Same day - reorder within the day
      const dayActivities = itinerary.filter((item) => item && item.date === sourceDay);
      const otherActivities = itinerary.filter((item) => item && item.date !== sourceDay);

      const [reorderedItem] = dayActivities.splice(source.index, 1);
      dayActivities.splice(destination.index, 0, reorderedItem);

      // Update times based on new order
      const updatedDayActivities = dayActivities.map((item, index) => {
        const baseTime = new Date(`${sourceDay}T09:00:00`);
        const newTime = new Date(baseTime.getTime() + index * 60 * 60 * 1000); // Add 1 hour per activity
        return {
          ...item,
          time: newTime.toISOString(),
        };
      });

      const newItinerary = [...otherActivities, ...updatedDayActivities];
      setItinerary(newItinerary);

      // Update backend for all reordered activities
      try {
        await Promise.all(
          updatedDayActivities.map(async (item) => {
            await api.put(`/api/itinerary/${item.id}`, {
              time: item.time,
            });
          })
        );
        console.log('Successfully updated activity times');
      } catch (error) {
        console.error('Failed to update activity times:', error);
        setItinerary(itinerary);
      }
    } else {
      // Different day - move to new day
      const sourceActivities = itinerary.filter((item) => item && item.date === sourceDay);
      const destinationActivities = itinerary.filter(
        (item) => item && item.date === destinationDay
      );
      const otherActivities = itinerary.filter(
        (item) => item && item.date !== sourceDay && item.date !== destinationDay
      );

      console.log('Source activities:', sourceActivities);
      console.log('Destination activities:', destinationActivities);

      // Remove from source day
      const [movedItem] = sourceActivities.splice(source.index, 1);

      // Add to destination day at specific position
      const updatedItem = { ...movedItem, date: destinationDay };
      destinationActivities.splice(destination.index, 0, updatedItem);

      // Rebuild itinerary
      const newItinerary = [...otherActivities, ...sourceActivities, ...destinationActivities];
      setItinerary(newItinerary);

      // Expand the destination day when activity is moved to it
      setExpandedDays((prev) => new Set([...Array.from(prev), destinationDay]));

      // Close source day if it becomes empty
      if (sourceActivities.length === 0) {
        setExpandedDays((prev) => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(sourceDay);
          return newSet;
        });
      }

      // Update in backend
      try {
        await api.put(`/api/itinerary/${movedItem.id}`, {
          date: destinationDay,
        });
        console.log('Successfully updated activity date');
      } catch (error) {
        console.error('Failed to update activity date:', error);
        // Revert on error
        setItinerary(itinerary);
      }
    }
  };

  const handleItineraryUpdate = (updatedItinerary: any) => {
    if (updatedItinerary) {
      setItinerary(updatedItinerary);
    }
  };

  const handleLoginSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser);
    // Data will be fetched automatically by the useEffect when user state changes
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase client-side
      await supabase.auth.signOut();
      setUser(null);
      setAnchorEl(null);
      setTrips([]);
      setItinerary([]);
      setCurrentTrip(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Generate vacation days based on date range
  const generateVacationDays = () => {
    if (!currentTrip || !currentTrip.start_date || !currentTrip.end_date) {
      return [];
    }

    const startDate = new Date(currentTrip.start_date);
    const endDate = new Date(currentTrip.end_date);
    const days = [];

    console.log('Generating days from', startDate, 'to', endDate);

    // Generate all days in the vacation range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayString = date.toISOString().split('T')[0];
      days.push(dayString);
      console.log('Added day:', dayString);
    }

    console.log('Generated days:', days);
    return days;
  };

  // Group activities by day based on vacation date range
  const getActivitiesByDay = () => {
    const grouped: { [key: string]: any[] } = {};

    // Get vacation days from date range
    const vacationDays = generateVacationDays();
    console.log('Generated vacation days:', vacationDays);

    // Initialize all vacation days with empty arrays
    vacationDays.forEach((day) => {
      grouped[day] = [];
    });

    // Add activities to their respective days
    itinerary
      .filter((activity) => activity != null)
      .forEach((activity) => {
        // Skip activities without a date
        if (!activity || !activity.date) {
          return;
        }

        const day = activity.date;

        if (grouped[day]) {
          grouped[day].push(activity);
        } else {
          // If activity is outside vacation range, add to the last day
          const lastDay = vacationDays[vacationDays.length - 1];
          if (lastDay) {
            const migratedActivity = {
              ...activity,
              date: lastDay,
              migrated: true,
            };
            grouped[lastDay].push(migratedActivity);
          }
        }
      });

    console.log('Final grouped activities:', grouped);
    return grouped;
  };

  // Activity suggestions based on type
  const getActivitySuggestions = (type: string) => {
    const suggestions: { [key: string]: string[] } = {
      activity: [
        'Walking Tour',
        'Photography Session',
        'Hiking',
        'Cycling',
        'Swimming',
        'Yoga Class',
        'Dance Lesson',
        'Cooking Class',
        'Art Workshop',
        'Fitness Training',
      ],
      museum: [
        'Art Museum Visit',
        'History Museum Tour',
        'Science Museum Exploration',
        'Natural History Museum',
        'Modern Art Gallery',
        'Cultural Center Tour',
        'Historical Site Visit',
        'Exhibition Viewing',
        'Guided Museum Tour',
      ],
      shopping: [
        'Shopping Mall Visit',
        'Local Market Tour',
        'Boutique Shopping',
        'Antique Shopping',
        'Flea Market',
        'Department Store',
        'Street Shopping',
        'Artisan Market',
        'Fashion Shopping',
      ],
      landmark: [
        'Monument Visit',
        'Historic Site Tour',
        'Architecture Tour',
        'Scenic Viewpoint',
        'Famous Building Visit',
        'Cultural Landmark',
        'Religious Site Visit',
        'Public Square Tour',
        'Heritage Site Visit',
      ],
    };
    return suggestions[type] || suggestions.activity;
  };

  // Handle address autocomplete
  const handleAddressChange = (value: string) => {
    setNewActivity({ ...newActivity, address: value });

    if (value.length > 2) {
      // Simple fallback suggestions for common addresses with coordinates
      const commonAddresses = [
        { address: 'Times Square, New York, NY', coordinates: [40.758, -73.9855] },
        { address: 'Central Park, New York, NY', coordinates: [40.7829, -73.9654] },
        { address: 'Brooklyn Bridge, New York, NY', coordinates: [40.7061, -73.9969] },
        { address: 'Statue of Liberty, New York, NY', coordinates: [40.6892, -74.0445] },
        { address: 'Empire State Building, New York, NY', coordinates: [40.7484, -73.9857] },
        { address: 'High Line, New York, NY', coordinates: [40.748, -74.0048] },
        { address: '9/11 Memorial, New York, NY', coordinates: [40.7115, -74.0134] },
        { address: 'One World Trade Center, New York, NY', coordinates: [40.7127, -74.0134] },
        { address: 'Broadway, New York, NY', coordinates: [40.7589, -73.9851] },
        { address: 'Fifth Avenue, New York, NY', coordinates: [40.7505, -73.9934] },
      ];

      const filtered = commonAddresses.filter((addr) =>
        addr.address.toLowerCase().includes(value.toLowerCase())
      );

      setAddressSuggestions(
        filtered.map((addr) => ({
          label: addr.address,
          value: addr.address,
          coordinates: addr.coordinates,
        }))
      );

      // Try Google Places API if available
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        try {
          const service = new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            {
              input: value,
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'us' },
            },
            (predictions, status) => {
              if (
                window.google?.maps?.places &&
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                const googleSuggestions = predictions.map((prediction) => ({
                  label: prediction.description,
                  value: prediction.description,
                  placeId: prediction.place_id,
                }));
                // Combine with fallback suggestions
                setAddressSuggestions([
                  ...googleSuggestions,
                  ...filtered.map((addr) => ({
                    label: addr.address,
                    value: addr.address,
                    coordinates: addr.coordinates,
                  })),
                ]);
              }
            }
          );
        } catch (error) {
          console.error('Google Places API not ready yet:', error);
        }
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  // Handle address selection and geocoding
  const handleAddressSelect = (selectedAddress: any) => {
    if (selectedAddress && selectedAddress.coordinates) {
      // Use coordinates from fallback suggestions
      setNewActivity({
        ...newActivity,
        address: selectedAddress.value,
        coordinates: selectedAddress.coordinates,
      });
    } else if (
      selectedAddress &&
      selectedAddress.placeId &&
      typeof window !== 'undefined' &&
      window.google?.maps
    ) {
      // Geocode the selected address to get coordinates
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: selectedAddress.placeId }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const coords = [location.lat(), location.lng()];
            setNewActivity({
              ...newActivity,
              address: selectedAddress.value,
              coordinates: coords,
            });
          }
        });
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    } else if (selectedAddress && typeof window !== 'undefined' && window.google?.maps) {
      // Fallback: geocode by address string
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: selectedAddress.value }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const coords = [location.lat(), location.lng()];
            setNewActivity({
              ...newActivity,
              address: selectedAddress.value,
              coordinates: coords,
            });
          }
        });
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }
  };

  // Handle activity autocomplete
  const handleActivityChange = (value: string) => {
    setNewActivity({ ...newActivity, activity: value });

    if (value.length > 1) {
      const suggestions = getActivitySuggestions(newActivity.type);
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setActivitySuggestions(
        filtered.map((suggestion) => ({
          label: suggestion,
          value: suggestion,
        }))
      );
    } else {
      setActivitySuggestions([]);
    }
  };

  const openEditDialog = (item: any) => {
    setEditingActivity({
      ...item,
      // Convert time from HH:MM:SS to HH:MM for the time input
      time: item.time?.substring(0, 5) || '09:00',
    });
    setEditDialogOpen(true);
  };

  const updateActivity = async () => {
    if (!editingActivity || !editingActivity.location || !editingActivity.activity) {
      alert('Please fill in location and activity name');
      return;
    }

    if (!currentTrip) {
      alert('Please select a trip first');
      return;
    }

    try {
      // Update in backend
      await api.put(`/api/itinerary/${editingActivity.id}`, {
        location: editingActivity.location,
        address: editingActivity.address,
        activity: editingActivity.activity,
        type: editingActivity.type,
        date: editingActivity.date,
        time: editingActivity.time,
        duration: editingActivity.duration,
        rating: editingActivity.rating,
        coordinates: editingActivity.coordinates,
      });

      // Update local state
      const updatedItinerary = itinerary.map((item) =>
        item.id === editingActivity.id
          ? {
              ...item,
              ...editingActivity,
              time: editingActivity.time + ':00', // Add seconds back
            }
          : item
      );
      setItinerary(updatedItinerary);
      setEditDialogOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Failed to update activity:', error);
      alert('Failed to update activity. Please try again.');
    }
  };

  const removeActivity = async (activityId: number) => {
    if (!currentTrip) return;

    try {
      // Delete from backend
      await api.delete(`/api/itinerary/${activityId}`);

      // Update local state
      const updatedItinerary = itinerary.filter((item) => item.id !== activityId);
      setItinerary(updatedItinerary);

      // Clear selection if the removed item was selected
      if (selectedItem && selectedItem.id === activityId) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to remove activity:', error);
    }
  };

  const addActivity = async () => {
    if (!newActivity.location || !newActivity.activity) {
      alert('Please fill in location and activity name');
      return;
    }

    if (!currentTrip) {
      alert('Please select a trip first');
      return;
    }

    try {
      // Add to backend
      const response = await api.post('/api/itinerary', {
        trip_id: currentTrip.id,
        location: newActivity.location,
        address: newActivity.address,
        activity: newActivity.activity,
        type: newActivity.type,
        date: newActivity.date,
        time: newActivity.time,
        duration: newActivity.duration,
        rating: newActivity.rating,
        coordinates: newActivity.coordinates,
      });

      // Format the response to match frontend format
      const formattedItem = {
        id: response.data.item.id,
        date: response.data.item.date,
        time: response.data.item.time,
        location: response.data.item.location,
        address: response.data.item.address,
        activity: response.data.item.activity,
        duration: response.data.item.duration,
        type: response.data.item.type,
        rating: response.data.item.rating,
        coordinates: [response.data.item.latitude, response.data.item.longitude],
      };

      // Add to local state
      setItinerary([...itinerary, formattedItem]);
      setAddDialogOpen(false);
      setNewActivity({
        location: '',
        address: '',
        activity: '',
        type: 'activity',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: '2 hours',
        rating: 4.5,
        coordinates: [40.758, -73.9855],
      });
    } catch (error) {
      console.error('Failed to add activity:', error);
      alert('Failed to add activity. Please try again.');
    }
  };

  const handleTitleClick = () => {
    if (currentTrip) {
      setEditedTripTitle(currentTrip.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTripTitle(event.target.value);
  };

  const handleTitleSubmit = async () => {
    if (!currentTrip || !editedTripTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await api.put(`/api/trips/${currentTrip.id}`, {
        title: editedTripTitle,
      });

      // Update local state
      setCurrentTrip({ ...currentTrip, title: editedTripTitle });
      setTrips(
        trips.map((trip) =>
          trip.id === currentTrip.id ? { ...trip, title: editedTripTitle } : trip
        )
      );
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update trip title:', error);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleTitleSubmit();
    }
    if (event.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return '🚶';
      case 'museum':
        return '🏛️';
      case 'shopping':
        return '🛍️';
      case 'landmark':
        return '🗽';
      case 'accommodation':
        return '🏨';
      case 'restaurant':
        return '🍽️';
      case 'outdoor':
        return '🌳';
      default:
        return '📍';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'activity':
        return '#4caf50';
      case 'museum':
        return '#2196f3';
      case 'shopping':
        return '#ff9800';
      case 'landmark':
        return '#9c27b0';
      case 'accommodation':
        return '#673ab7';
      case 'restaurant':
        return '#f44336';
      case 'outdoor':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  // Get day-based color for numbered pins using Apple's refined color palette
  const getDayColor = (date: string) => {
    if (!date) return '#007AFF';

    const dayColors = [
      '#FF3B30', // iOS Red - clean and vibrant
      '#007AFF', // iOS Blue - primary blue
      '#34C759', // iOS Green - success green
      '#FF9500', // iOS Orange - warm orange
      '#5856D6', // iOS Purple - deep purple
      '#FF2D92', // iOS Pink - vibrant pink
      '#5AC8FA', // iOS Light Blue - sky blue
      '#FFCC00', // iOS Yellow - bright yellow
      '#FF6B6B', // Coral - soft coral
      '#4ECDC4', // Teal - mint teal
    ];

    // Get vacation days and find the index
    const vacationDays = generateVacationDays();
    const dayIndex = vacationDays.indexOf(date);
    return dayColors[dayIndex % dayColors.length];
  };

  // Get sequential number within each day
  const getDayNumber = (item: any) => {
    if (!item || !item.date) return 1;

    const dayItems = itinerary
      .filter((dayItem) => dayItem && dayItem.date === item.date)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return dayItems.indexOf(item) + 1;
  };

  // Show landing page if not logged in and not loading
  if (!user && !loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LandingPage onGetStarted={() => setLoginModalOpen(true)} />
        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Top Header with Login */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(25, 118, 210, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
              <Image
                src="/logo.png"
                alt="SkyFinder Logo"
                width={40}
                height={40}
                style={{ borderRadius: '8px' }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                SkyFinder
              </Typography>
            </Box>

            {user ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<AccountCircle />}
                  onClick={handleMenuOpen}
                  sx={{ textTransform: 'none' }}
                >
                  {user.email}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem
                    onClick={() => {
                      window.open('https://discord.gg/btd7PUjYkW', '_blank');
                      handleMenuClose();
                    }}
                  >
                    <SupportIcon sx={{ mr: 1 }} />
                    Discord Support
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setShowMapControls(!showMapControls);
                      handleMenuClose();
                    }}
                  >
                    {showMapControls ? (
                      <VisibilityOffIcon sx={{ mr: 1 }} />
                    ) : (
                      <VisibilityIcon sx={{ mr: 1 }} />
                    )}
                    {showMapControls ? 'Hide Map Controls' : 'Show Map Controls'}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => setLoginModalOpen(true)}
                variant="outlined"
                sx={{
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            pt: { xs: '56px', sm: '64px' }, // Smaller top padding on mobile
          }}
        >
          {/* Apple-Style Sidebar */}
          <Drawer
            variant="persistent"
            anchor="left"
            open={sidebarOpen}
            sx={{
              width: sidebarOpen ? { xs: '100vw', sm: 320 } : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: { xs: '100vw', sm: 320 },
                boxSizing: 'border-box',
                background:
                  'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(240 4.8% 95.9%) 50%, hsl(240 4.8% 98%) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid hsl(220 13% 91%)',
                borderLeft: 'none',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                marginTop: { xs: '56px', sm: '64px' },
                height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
                zIndex: 1000,
                overflow: 'visible',
              },
            }}
          >
            {/* Sidebar Header */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid hsl(220 13% 91%)',
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  {isEditingTitle ? (
                    <TextField
                      value={editedTripTitle}
                      onChange={handleTitleChange}
                      onBlur={handleTitleSubmit}
                      onKeyDown={handleTitleKeyPress}
                      autoFocus
                      variant="standard"
                      sx={{
                        '& .MuiInput-root': {
                          color: 'hsl(240 5.9% 10%)',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          '&:before': { borderBottomColor: 'hsl(220 13% 91%)' },
                          '&:after': { borderBottomColor: 'hsl(217.2 91.2% 59.8%)' },
                          '&:hover:not(.Mui-disabled):before': {
                            borderBottomColor: 'hsl(220 13% 91%)',
                          },
                        },
                        '& .MuiInput-input': {
                          color: 'hsl(240 5.9% 10%)',
                          fontSize: '1.25rem',
                          fontWeight: 600,
                        },
                      }}
                    />
                  ) : (
                    <Typography
                      variant="h5"
                      component="div"
                      onClick={handleTitleClick}
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        color: 'hsl(240 5.9% 10%)',
                        cursor: currentTrip ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        borderRadius: '4px',
                        px: 1,
                        py: 0.5,
                        '&:hover': currentTrip
                          ? {
                              backgroundColor: 'hsl(240 4.8% 95.9%)',
                            }
                          : {},
                      }}
                    >
                      {currentTrip ? currentTrip.title : 'My Itinerary'}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'hsl(240 3.8% 46.1%)',
                      mt: 0.5,
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    }}
                    component="div"
                  >
                    {currentTrip ? (
                      isEditingDates ? (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                        >
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            {currentTrip.destination || 'Destination'} •
                          </Typography>
                          <TextField
                            type="date"
                            value={vacationStartDate}
                            onChange={(e) => setVacationStartDate(e.target.value)}
                            size="small"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                height: 28,
                              },
                              '& .MuiInputBase-input': {
                                py: 0.5,
                                px: 1,
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            -
                          </Typography>
                          <TextField
                            type="date"
                            value={vacationEndDate}
                            onChange={(e) => setVacationEndDate(e.target.value)}
                            size="small"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                height: 28,
                              },
                              '& .MuiInputBase-input': {
                                py: 0.5,
                                px: 1,
                              },
                            }}
                          />
                          <Button
                            size="small"
                            onClick={handleDateSave}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              backgroundColor: '#007AFF',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#0056CC',
                              },
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={handleDateCancel}
                            sx={{
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5,
                              fontSize: '0.75rem',
                              color: '#8E8E93',
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.7,
                            },
                          }}
                          onClick={() => handleDateEdit()}
                        >
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            {currentTrip.destination || 'Destination'} •{' '}
                            {formatLocalDateSimple(currentTrip.start_date)} -{' '}
                            {formatLocalDateSimple(currentTrip.end_date)}
                          </Typography>
                          <EditIcon sx={{ fontSize: 14, color: '#8E8E93' }} />
                        </Box>
                      )
                    ) : user ? (
                      'No trip selected'
                    ) : (
                      'Sign in to get started'
                    )}
                  </Typography>
                </Box>

                {/* Close Button */}
                {sidebarOpen && (
                  <Tooltip title="Close Sidebar (Esc)" placement="right" arrow>
                    <IconButton
                      onClick={toggleSidebar}
                      aria-label="Close sidebar"
                      sx={{
                        position: 'fixed',
                        top: '50%',
                        left: sidebarOpen ? { xs: 'calc(100vw - 24px)', sm: 308 } : -100,
                        transform: 'translateY(-50%)',
                        width: 24,
                        height: 60,
                        background: 'hsl(0 0% 100%)',
                        border: '2px solid hsl(220 13% 91%)',
                        borderRadius: '0 6px 6px 0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        color: 'hsl(240 5.9% 10%)',
                        zIndex: 1001,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'hsl(240 4.8% 95.9%)',
                          transform: 'translateY(-50%) translateX(2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {user && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => setTripSelectorOpen(true)}
                  sx={{
                    mt: 1.5,
                    color: 'hsl(240 5.9% 10%)',
                    borderColor: 'hsl(220 13% 91%)',
                    '&:hover': {
                      borderColor: 'hsl(217.2 91.2% 59.8%)',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    },
                  }}
                >
                  {trips.length === 0 ? 'Create Your First Trip' : `Switch Trip (${trips.length})`}
                </Button>
              )}
            </Box>

            {/* Sidebar Content */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: { xs: 1.5, sm: 2 },
                position: 'relative',
                zIndex: 1, // Ensure content is above background but below drag elements
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    p: 4,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : !user ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    🗺️ Welcome!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to create and manage your saved places.
                  </Typography>
                </Box>
              ) : selectedList ? (
                /* List Items View */
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconButton size="small" onClick={() => setSelectedList(null)}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {selectedList.icon} {selectedList.name}
                    </Typography>
                    {!selectedList.is_default && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteList(selectedList.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {listItems.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No places saved yet
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {listItems.map((item) => (
                        <ListItem
                          key={item.id}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <PlaceIcon sx={{ color: selectedList.color }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.name}
                            secondary={item.address}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFromList(selectedList.id, item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ) : (
                /* Saved Lists View */
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Saved Lists</Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateListDialogOpen(true)}
                    >
                      New List
                    </Button>
                  </Box>

                  {savedLists.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No lists yet
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCreateListDialogOpen(true)}
                      >
                        Create Your First List
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {savedLists.map((list) => (
                        <ListItem
                          key={list.id}
                          button
                          onClick={() => {
                            setSelectedList(list);
                            fetchListItems(list.id);
                          }}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Typography sx={{ fontSize: '1.5rem' }}>{list.icon}</Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={list.name}
                            secondary={`${list.items_count || 0} places`}
                          />
                          {!list.is_default && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          </Drawer>

          {/* Google Map Background */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {loadError && (
                        onChange={(event, isExpanded) => {
                          // Only allow expansion/collapse if there are activities
                          if (activities.length > 0) {
                            if (isExpanded) {
                              setExpandedDays((prev) => new Set([...Array.from(prev), day]));
                            } else {
                              setExpandedDays((prev) => {
                                const newSet = new Set(Array.from(prev));
                                newSet.delete(day);
                                return newSet;
                              });
                            }
                          }
                        }}
                        sx={{
                          boxShadow:
                            activities.length > 0 && expandedDays.has(day)
                              ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                              : 'none',
                          borderRadius: 2,
                          mb: isLastDay
                            ? 12
                            : activities.length > 0 && expandedDays.has(day)
                              ? 1
                              : 0,
                          '&:before': { display: 'none' },
                          '&.Mui-expanded': {
                            margin: '0 0 8px 0',
                            animation: 'bounceIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          },
                          backgroundColor: 'transparent',
                          minHeight: activities.length > 0 ? 'auto' : { xs: '44px', sm: '48px' },
                          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          '@keyframes bounceIn': {
                            '0%': {
                              transform: 'scale(0.95)',
                              opacity: 0.8,
                            },
                            '50%': {
                              transform: 'scale(1.02)',
                              opacity: 1,
                            },
                            '100%': {
                              transform: 'scale(1)',
                              opacity: 1,
                            },
                          },
                          '& .MuiAccordionSummary-root': {
                            minHeight: '48px',
                            cursor: activities.length > 0 ? 'pointer' : 'default',
                          },
                          '& .MuiAccordionSummary-expandIconWrapper': {
                            display: activities.length > 0 ? 'block' : 'none',
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ color: 'white', fontSize: 20 }} />}
                          sx={{
                            backgroundColor: `${getDayColor(day)} !important`,
                            borderRadius: 2,
                            color: 'white',
                            minHeight: 48,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            '&.MuiAccordionSummary-root': {
                              backgroundColor: `${getDayColor(day)} !important`,
                            },
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 12px ${getDayColor(day)}40`,
                              filter: 'brightness(1.05)',
                            },
                            '&.Mui-expanded': {
                              borderRadius: '8px 8px 0 0',
                              boxShadow: `0 2px 8px ${getDayColor(day)}40`,
                            },
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <EventIcon
                              sx={{
                                color: 'white',
                                fontSize: 22,
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                              }}
                            />
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                fontSize: '1rem',
                                letterSpacing: '0.01em',
                              }}
                            >
                              {formatLocalDate(day)}
                            </Typography>
                            <Chip
                              label={`${activities.length} activities`}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                color: 'white',
                                fontSize: '0.75rem',
                                height: 22,
                                fontWeight: 600,
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                '& .MuiChip-label': { px: 1.5 },
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            />
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails
                          sx={{
                            p: 1,
                            backgroundColor: 'rgba(248, 249, 250, 0.5)',
                            borderRadius: '0 0 8px 8px',
                          }}
                        >
                          <Droppable droppableId={day.toString()}>
                            {(provided, snapshot) => {
                              // Handle hover-to-expand for empty day boxes
                              if (
                                isDragging &&
                                snapshot.isDraggingOver &&
                                activities.length === 0
                              ) {
                                setDraggedOverDay(day);
                              }

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  onMouseEnter={() => {
                                    if (isDragging && activities.length === 0) {
                                      // Clear any existing timeout
                                      if (hoverTimeout) {
                                        clearTimeout(hoverTimeout);
                                        setHoverTimeout(null);
                                      }
                                      setDraggedOverDay(day);
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (isDragging && activities.length === 0) {
                                      // Clear any existing timeout
                                      if (hoverTimeout) {
                                        clearTimeout(hoverTimeout);
                                        setHoverTimeout(null);
                                      }
                                      // Set a small delay before closing to prevent flickering
                                      const timeout = setTimeout(() => {
                                        setDraggedOverDay(null);
                                        setExpandedDays((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete(day);
                                          return newSet;
                                        });
                                      }, 100);
                                      setHoverTimeout(timeout);
                                    }
                                  }}
                                  style={{
                                    minHeight: '60px',
                                    backgroundColor: snapshot.isDraggingOver
                                      ? 'rgba(0, 122, 255, 0.1)'
                                      : activities.length === 0 && isDragging
                                        ? 'rgba(0, 122, 255, 0.05)'
                                        : 'transparent',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    position: 'relative',
                                    zIndex: snapshot.isDraggingOver ? 1000 : 'auto',
                                    pointerEvents: 'auto', // Ensure droppable areas are interactive
                                    border: snapshot.isDraggingOver
                                      ? '2px solid #007AFF'
                                      : activities.length === 0 && isDragging
                                        ? '2px dashed rgba(0, 122, 255, 0.3)'
                                        : '2px solid transparent',
                                    boxShadow: snapshot.isDraggingOver
                                      ? '0 8px 25px rgba(0, 122, 255, 0.3), 0 0 0 1px rgba(0, 122, 255, 0.1)'
                                      : activities.length === 0 && isDragging
                                        ? '0 4px 12px rgba(0, 122, 255, 0.2)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    transform: snapshot.isDraggingOver
                                      ? 'scale(1.02) translateY(-3px)'
                                      : activities.length === 0 && isDragging
                                        ? 'scale(1.01) translateY(-1px)'
                                        : 'scale(1) translateY(0)',
                                  }}
                                >
                                  {activities.map((item: any, index: number) => (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id.toString()}
                                      index={index}
                                      isDragDisabled={isMobile}
                                    >
                                      {(provided, snapshot) => {
                                        const child = (
                                          <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...(!isMobile ? provided.dragHandleProps : {})}
                                            onClick={() => setSelectedItem(item)}
                                            sx={{
                                              p: { xs: 1.5, sm: 2 },
                                              mx: 0.5,
                                              mb: 0.5,
                                              borderRadius: 2,
                                              cursor: isMobile
                                                ? 'pointer'
                                                : snapshot.isDragging
                                                  ? 'grabbing'
                                                  : 'grab',
                                              touchAction: isMobile ? 'auto' : 'none', // Allow scrolling on mobile, prevent during drag on desktop
                                              backgroundColor:
                                                selectedItem?.id === item.id
                                                  ? 'rgba(0, 122, 255, 0.1)'
                                                  : snapshot.isDragging
                                                    ? 'rgba(0, 122, 255, 0.15)'
                                                    : 'rgba(248, 249, 250, 0.8)',
                                              border:
                                                selectedItem?.id === item.id
                                                  ? '1px solid rgba(0, 122, 255, 0.3)'
                                                  : snapshot.isDragging
                                                    ? '1px solid rgba(0, 122, 255, 0.5)'
                                                    : '1px solid rgba(0, 0, 0, 0.05)',
                                              transition:
                                                'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                              position: 'relative',
                                              transform: snapshot.isDragging
                                                ? 'rotate(1deg) scale(1.03) translateY(-4px)'
                                                : 'rotate(0deg) scale(1) translateY(0)',
                                              zIndex: snapshot.isDragging ? 99999 : 'auto',
                                              boxShadow: snapshot.isDragging
                                                ? '0 12px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 122, 255, 0.1)'
                                                : selectedItem?.id === item.id
                                                  ? '0 4px 12px rgba(0, 122, 255, 0.3)'
                                                  : '0 2px 6px rgba(0, 0, 0, 0.1)',
                                              '&:hover': {
                                                backgroundColor:
                                                  selectedItem?.id === item.id
                                                    ? 'rgba(0, 122, 255, 0.15)'
                                                    : 'rgba(0, 122, 255, 0.05)',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.15)',
                                              },
                                              '&:active': {
                                                cursor: 'grabbing',
                                                transform: 'translateY(0) scale(0.98)',
                                              },
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                minHeight: 64,
                                                py: 1,
                                              }}
                                            >
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: 0.5,
                                                  flex: 1,
                                                  minWidth: 0,
                                                }}
                                              >
                                                {/* First line: Icon + Title */}
                                                <Box
                                                  sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      width: 36,
                                                      height: 36,
                                                      borderRadius: 2,
                                                      backgroundColor:
                                                        selectedItem?.id === item.id
                                                          ? '#007AFF'
                                                          : '#F2F2F7',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      flexShrink: 0,
                                                      transition: 'all 0.2s ease',
                                                      boxShadow:
                                                        selectedItem?.id === item.id
                                                          ? '0 2px 8px rgba(0, 122, 255, 0.3)'
                                                          : '0 1px 3px rgba(0,0,0,0.1)',
                                                      '&:hover': {
                                                        transform: 'scale(1.05)',
                                                      },
                                                    }}
                                                  >
                                                    {item.type === 'museum' ? (
                                                      <MuseumIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : item.type === 'shopping' ? (
                                                      <ShoppingIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : item.type === 'landmark' ? (
                                                      <PlaceIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : item.type === 'accommodation' ? (
                                                      <EventIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : item.type === 'restaurant' ? (
                                                      <StarIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : item.type === 'outdoor' ? (
                                                      <AttractionsIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    ) : (
                                                      <AttractionsIcon
                                                        sx={{
                                                          fontSize: 16,
                                                          color:
                                                            selectedItem?.id === item.id
                                                              ? 'white'
                                                              : '#8E8E93',
                                                        }}
                                                      />
                                                    )}
                                                  </Box>
                                                  <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                      fontWeight: 500,
                                                      color: '#1D1D1F',
                                                      fontSize: '0.875rem',
                                                      lineHeight: 1.4,
                                                      flex: 1,
                                                      minWidth: 0,
                                                      wordBreak: 'break-word',
                                                    }}
                                                  >
                                                    {item.location}
                                                  </Typography>
                                                </Box>

                                                {/* Second line: Time + Location */}
                                                <Box
                                                  sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1.5,
                                                    flexWrap: 'wrap',
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: 0.5,
                                                      flexShrink: 0,
                                                    }}
                                                  >
                                                    <ScheduleIcon
                                                      sx={{ fontSize: 14, color: '#8E8E93' }}
                                                    />
                                                    <Typography
                                                      variant="caption"
                                                      sx={{
                                                        color: '#8E8E93',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 400,
                                                      }}
                                                    >
                                                      {item.time}
                                                    </Typography>
                                                  </Box>
                                                  <Box
                                                    sx={{
                                                      display: 'flex',
                                                      alignItems: 'flex-start',
                                                      gap: 0.5,
                                                      flex: '1 1 auto',
                                                      minWidth: 0,
                                                    }}
                                                  >
                                                    <LocationIcon
                                                      sx={{
                                                        fontSize: 14,
                                                        color: '#8E8E93',
                                                        flexShrink: 0,
                                                        mt: 0.5,
                                                      }}
                                                    />
                                                    <Typography
                                                      variant="caption"
                                                      sx={{
                                                        color: '#8E8E93',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 400,
                                                        wordBreak: 'break-word',
                                                        lineHeight: 1.4,
                                                      }}
                                                    >
                                                      {item.address}
                                                    </Typography>
                                                  </Box>
                                                </Box>

                                                {/* Third line: Tags */}
                                                <Box
                                                  sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    flexWrap: 'wrap',
                                                  }}
                                                >
                                                  {item.migrated && (
                                                    <Chip
                                                      label="Moved"
                                                      size="small"
                                                      sx={{
                                                        backgroundColor: '#FF950020',
                                                        color: '#FF9500',
                                                        fontWeight: 500,
                                                        fontSize: '0.7rem',
                                                        height: 18,
                                                        borderRadius: 2,
                                                        flexShrink: 0,
                                                      }}
                                                    />
                                                  )}
                                                  <Chip
                                                    label={item.type}
                                                    size="small"
                                                    sx={{
                                                      backgroundColor: `${getActivityColor(item.type)}20`,
                                                      color: getActivityColor(item.type),
                                                      fontWeight: 500,
                                                      fontSize: '0.75rem',
                                                      height: 20,
                                                      borderRadius: 2,
                                                      flexShrink: 0,
                                                      transition: 'all 0.2s ease',
                                                      '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        backgroundColor: `${getActivityColor(item.type)}30`,
                                                      },
                                                    }}
                                                  />
                                                </Box>
                                              </Box>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: 0.5,
                                                  alignSelf: 'flex-start',
                                                  pt: 0.5,
                                                }}
                                              >
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditDialog(item);
                                                  }}
                                                  size="small"
                                                  sx={{
                                                    color: '#8E8E93',
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s ease',
                                                    flexShrink: 0,
                                                    '&:hover': {
                                                      color: '#007AFF',
                                                      backgroundColor: 'rgba(0, 122, 255, 0.08)',
                                                      transform: 'scale(1.05)',
                                                    },
                                                  }}
                                                >
                                                  <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeActivity(item.id);
                                                  }}
                                                  size="small"
                                                  sx={{
                                                    color: '#8E8E93',
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s ease',
                                                    flexShrink: 0,
                                                    '&:hover': {
                                                      color: '#FF3B30',
                                                      backgroundColor: 'rgba(255, 59, 48, 0.08)',
                                                      transform: 'scale(1.05)',
                                                    },
                                                  }}
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                          </Box>
                                        );

                                        return snapshot.isDragging
                                          ? createPortal(child, document.body)
                                          : child;
                                      }}
                                    </Draggable>
                                  ))}
                                  {activities.length === 0 && (
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '80px',
                                        color: isDragging
                                          ? 'rgba(0, 122, 255, 0.8)'
                                          : 'rgba(0, 0, 0, 0.4)',
                                        fontSize: '14px',
                                        fontStyle: 'italic',
                                        border: isDragging
                                          ? '2px dashed rgba(0, 122, 255, 0.5)'
                                          : '2px dashed rgba(0, 122, 255, 0.3)',
                                        borderRadius: '12px',
                                        backgroundColor: isDragging
                                          ? 'rgba(0, 122, 255, 0.08)'
                                          : 'rgba(0, 122, 255, 0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                        cursor: 'pointer',
                                        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                                        boxShadow: isDragging
                                          ? '0 4px 12px rgba(0, 122, 255, 0.2)'
                                          : '0 2px 6px rgba(0, 0, 0, 0.05)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                          borderColor: 'rgba(0, 122, 255, 0.5)',
                                          color: 'rgba(0, 122, 255, 0.8)',
                                          transform: 'scale(1.01)',
                                        },
                                      }}
                                    >
                                      {isDragging
                                        ? 'Drop here to add activity'
                                        : 'Drop activities here'}
                                    </Box>
                                  )}
                                  {provided.placeholder}
                                </div>
                              );
                            }}
                          </Droppable>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })
              )}
            </Box>

            {/* Sidebar Footer */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(240 4.8% 95.9%) 100%)',
                borderTop: '1px solid hsl(220 13% 91%)',
                p: { xs: 2, sm: 3 },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                disabled={!currentTrip}
                sx={{
                  width: { xs: 'calc(100% - 80px)', sm: '100%' }, // Shorter on mobile to avoid AI button overlap
                  mr: { xs: 0, sm: 0 }, // Remove margin since we're using calc width
                  background:
                    'linear-gradient(135deg, hsl(240 5.9% 10%) 0%, hsl(240 5.9% 10%) 100%)',
                  color: 'hsl(0 0% 98%)',
                  borderRadius: '8px',
                  py: 1.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, hsl(240 5.9% 10%) 0%, hsl(240 5.9% 10%) 100%)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                  '&:disabled': {
                    background: 'hsl(240 4.8% 95.9%)',
                    color: 'hsl(240 3.8% 46.1%)',
                  },
                }}
              >
                Add New Activity
              </Button>
            </Box>
          </Drawer>

          {/* Google Map Background */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {loadError && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography color="error">Error loading Google Maps</Typography>
              </Box>
            )}
            {!isGoogleMapsLoaded && !loadError && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {isGoogleMapsLoaded && !loadError && !mapCenter && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select or create a trip to view on the map
                </Typography>
              </Box>
            )}
            {isGoogleMapsLoaded && !loadError && mapCenter && (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '100vh',
                }}
                center={mapCenter}
                zoom={13}
                options={{
                  styles: [
                    {
                      featureType: 'water',
                      elementType: 'geometry',
                      stylers: [{ color: '#a2daf2' }],
                    },
                    {
                      featureType: 'landscape',
                      elementType: 'geometry',
                      stylers: [{ color: '#f8f8f8' }],
                    },
                    {
                      featureType: 'landscape.natural',
                      elementType: 'geometry',
                      stylers: [{ color: '#e8f5e8' }],
                    },
                    {
                      featureType: 'landscape.man_made',
                      elementType: 'geometry',
                      stylers: [{ color: '#ffffff' }],
                    },
                    {
                      featureType: 'poi',
                      elementType: 'geometry',
                      stylers: [{ color: '#f0f0f0' }],
                    },
                    {
                      featureType: 'poi.park',
                      elementType: 'geometry',
                      stylers: [{ color: '#d4edda' }],
                    },
                    {
                      featureType: 'poi.attraction',
                      elementType: 'geometry',
                      stylers: [{ color: '#fff3cd' }],
                    },
                    {
                      featureType: 'poi.business',
                      elementType: 'geometry',
                      stylers: [{ color: '#f8f9fa' }],
                    },
                    {
                      featureType: 'road',
                      elementType: 'geometry',
                      stylers: [{ color: '#f0f0f0' }],
                    },
                    {
                      featureType: 'road',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#d0d0d0' }],
                    },
                    {
                      featureType: 'road.highway',
                      elementType: 'geometry',
                      stylers: [{ color: '#d0d0d0' }],
                    },
                    {
                      featureType: 'road.highway',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#b0b0b0' }],
                    },
                    {
                      featureType: 'road.arterial',
                      elementType: 'geometry',
                      stylers: [{ color: '#e8e8e8' }],
                    },
                    {
                      featureType: 'road.arterial',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#d8d8d8' }],
                    },
                    {
                      featureType: 'road.local',
                      elementType: 'geometry',
                      stylers: [{ color: '#f5f5f5' }],
                    },
                    {
                      featureType: 'road.local',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#e5e5e5' }],
                    },
                    {
                      featureType: 'transit',
                      elementType: 'geometry',
                      stylers: [{ color: '#d0d0d0' }],
                    },
                    {
                      featureType: 'transit',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#e0e0e0' }],
                    },
                    {
                      featureType: 'transit.station',
                      elementType: 'geometry',
                      stylers: [{ color: '#e8e8e8' }],
                    },
                    {
                      featureType: 'administrative',
                      elementType: 'geometry',
                      stylers: [{ color: '#e3f2fd' }],
                    },
                    {
                      featureType: 'administrative.country',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#bdbdbd' }],
                    },
                    {
                      featureType: 'administrative.province',
                      elementType: 'geometry.stroke',
                      stylers: [{ color: '#e0e0e0' }],
                    },
                  ],
                  disableDefaultUI: !showMapControls,
                  zoomControl: showMapControls,
                  mapTypeControl: showMapControls,
                  scaleControl: showMapControls,
                  streetViewControl: showMapControls,
                  rotateControl: showMapControls,
                  fullscreenControl: showMapControls,
                }}
                onLoad={(map) => {
                  mapInstanceRef.current = map;
                  setMapReady(true);
                }}
              >
                {/* Map Markers for each itinerary item */}
                {mapReady &&
                  itinerary
                    .filter((item) => item != null)
                    .map((item) => {
                      // Create numbered pin with day-based color
                      let customIcon;
                      try {
                        if (
                          isGoogleMapsLoaded &&
                          typeof window !== 'undefined' &&
                          window.google?.maps?.Size &&
                          window.google?.maps?.Point
                        ) {
                          const dayColor = getDayColor(item.date);
                          const dayNumber = getDayNumber(item);

                          customIcon = {
                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.2)"/>
                        </filter>
                      </defs>
                      <circle cx="16" cy="16" r="14" fill="${dayColor}" filter="url(#shadow)"/>
                      <circle cx="16" cy="16" r="12" fill="white" opacity="0.2"/>
                      <text x="16" y="20" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="-0.01em">
                        ${dayNumber}
                      </text>
                    </svg>
                  `)}`,
                            scaledSize: new window.google.maps.Size(32, 32),
                            anchor: new window.google.maps.Point(16, 16),
                          };
                        }
                      } catch (error) {
                        console.warn('Failed to create custom marker icon:', error);
                      }

                      // Skip items without coordinates
                      if (
                        !item ||
                        !item.coordinates ||
                        !Array.isArray(item.coordinates) ||
                        item.coordinates.length < 2
                      ) {
                        return null;
                      }

                      return (
                        <Marker
                          key={item.id}
                          position={{ lat: item.coordinates[0], lng: item.coordinates[1] }}
                          onClick={() => setSelectedItem(item)}
                          icon={customIcon}
                        />
                      );
                    })}

                {/* User's current location marker */}
                {mapCenter && (
                  <Marker
                    position={mapCenter}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE || '',
                      scale: 8,
                      fillColor: '#4285F4',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    title="Your Location"
                  />
                )}

                {/* Transit Lines - Using Data component */}
                {transitDataLoaded && transitLines.length > 0 && (
                  <Data
                    options={{
                      map: undefined,
                      controlPosition: undefined,
                      controls: [],
                      drawingMode: undefined,
                      style: (feature: any) => {
                        const lineName = feature.getProperty('Line');
                        let color = '#0099CC'; // Default teal
                        
                        // Color coding for different lines
                        if (lineName?.includes('Canada Line')) color = '#0099CC'; // Teal
                        if (lineName?.includes('Expo')) color = '#FFCC00'; // Yellow
                        if (lineName?.includes('Millennium')) color = '#0066CC'; // Blue
                        if (lineName?.includes('West Coast Express')) color = '#FF6600'; // Orange
                        
                        return {
                          strokeColor: color,
                          strokeWeight: 4,
                          strokeOpacity: 0.9,
                          zIndex: 1,
                        };
                      },
                    }}
                    onLoad={(data) => {
                      const linesGeoJson = {
                        type: 'FeatureCollection',
                        features: transitLines,
                      };
                      data.addGeoJson(linesGeoJson);
                    }}
                  />
                )}

                {/* Transit Stations - Using Marker components */}
                {transitDataLoaded && transitStations.map((station, index) => {
                  const coords = station.geometry.coordinates;
                  if (!coords || coords.length < 2) {
                    return null;
                  }
                  
                  return (
                    <Marker
                      key={`station-${index}`}
                      position={{ lat: coords[0], lng: coords[1] }}
                      label={{
                        text: '🚇',
                        fontSize: '20px',
                      }}
                      title={station.properties?.Name || station.properties?.name || 'Transit Station'}
                      onClick={(e) => handleStationClick(index, e)}
                      zIndex={999}
                    />
                  );
                })}

                {/* Search Result Markers */}
                {searchResults.map((result, index) => (
                  <Marker
                    key={`search-result-${result.place_id || index}`}
                    position={{ lat: result.latitude, lng: result.longitude }}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FF6B6B">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      `),
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 32),
                    }}
                    title={result.name}
                    onClick={() => setSelectedSearchResult(result)}
                    zIndex={998}
                  />
                ))}

                {/* Info Window for selected search result */}
                {selectedSearchResult && (
                  <InfoWindow
                    position={{
                      lat: selectedSearchResult.latitude,
                      lng: selectedSearchResult.longitude,
                    }}
                    onCloseClick={() => setSelectedSearchResult(null)}
                  >
                    <Box sx={{ p: 1, minWidth: 250 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedSearchResult.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {selectedSearchResult.address}
                      </Typography>
                      {selectedSearchResult.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedSearchResult.rating}
                          </Typography>
                          {selectedSearchResult.user_ratings_total > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              ({selectedSearchResult.user_ratings_total} reviews)
                            </Typography>
                          )}
                        </Box>
                      )}
                      {selectedSearchResult.cuisine_types && selectedSearchResult.cuisine_types.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {selectedSearchResult.cuisine_types.map((cuisine: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={cuisine}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {selectedSearchResult.website && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={selectedSearchResult.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DirectionsIcon />}
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${selectedSearchResult.latitude},${selectedSearchResult.longitude}`,
                              '_blank'
                            );
                          }}
                        >
                          Directions
                        </Button>
                      </Box>
                    </Box>
                  </InfoWindow>
                )}

                {/* Info Window for selected item */}
                {mapReady && selectedItem && (
                  <InfoWindow
                    position={{
                      lat: selectedItem.coordinates[0],
                      lng: selectedItem.coordinates[1],
                    }}
                    onCloseClick={() => setSelectedItem(null)}
                  >
                    <Box sx={{ p: 1, minWidth: 250 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedItem.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        📅 {selectedItem.date} • 🕐 {selectedItem.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        📍 {selectedItem.address}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {selectedItem.activity} • {selectedItem.duration}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {selectedItem.rating}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleBookNow}
                        sx={{
                          backgroundColor: '#007AFF',
                          color: 'white',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500,
                          px: 2,
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: '#0056CC',
                            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                          },
                        }}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}

            {/* Search Bar - Positioned at top left of map */}
            {isGoogleMapsLoaded && !loadError && mapCenter && (
              <Box
                data-search-container
                sx={{
                  position: 'fixed',
                  top: { xs: 'calc(56px + 16px)', sm: 'calc(64px + 16px)', md: 'calc(64px + 16px)' },
                  left: { xs: '16px', sm: '16px', md: 'calc(300px + 16px)' },
                  zIndex: 1000,
                  width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 32px)', md: '400px' },
                  maxWidth: '400px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <SearchIcon />
                  </Box>
                  <TextField
                    fullWidth
                    placeholder={selectedStations.size > 0 ? "Search restaurants, cafes, etc..." : "Select stations to search"}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    disabled={selectedStations.size === 0}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      endAdornment: searchQuery && (
                        <IconButton size="small" onClick={handleClearSearch}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                  {isSearching && (
                    <Box sx={{ p: 1.5 }}>
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </Box>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <Box
                    sx={{
                      mt: 1,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      maxHeight: '400px',
                      overflow: 'auto',
                      position: 'relative',
                    }}
                  >
                    {/* Close button */}
                    <IconButton
                      size="small"
                      onClick={handleHideSearchResults}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        zIndex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>

                    {searchResults.map((result, index) => (
                      <Box
                        key={result.place_id || index}
                        onClick={() => {
                          setSelectedSearchResult(result);
                          handleHideSearchResults(); // Hide dropdown after selection
                        }}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: index < searchResults.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {result.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {result.address}
                        </Typography>
                        {result.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption">{result.rating}</Typography>
                            {result.user_ratings_total > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                ({result.user_ratings_total})
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Sidebar Trigger */}
          <Box
            sx={{
              position: 'fixed',
              top: { xs: 'calc(56px + 8px)', sm: 'calc(64px + 8px)', md: 'calc(50% - 250px)' },
              left: 0,
              transform: { xs: 'none', sm: 'none', md: 'translateY(-50%)' },
              zIndex: 1001,
              opacity: sidebarOpen ? 0 : 1,
              visibility: sidebarOpen ? 'hidden' : 'visible',
              transition: sidebarOpen
                ? 'opacity 0.1s ease-out, visibility 0.1s ease-out'
                : 'opacity 0.3s ease-in 0.3s, visibility 0.3s ease-in 0.3s',
            }}
          >
            <Tooltip title="Open Sidebar (Ctrl+B)" placement="right" arrow>
              <IconButton
                onClick={toggleSidebar}
                aria-label="Open sidebar"
                sx={{
                  left: sidebarOpen ? -100 : { xs: 0, sm: 0 },
                  width: 32,
                  height: 80,
                  background: 'rgba(0, 122, 255, 0.9)',
                  color: 'white',
                  borderRadius: '0 6px 6px 0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  border: '2px solid hsl(220 13% 91%)',
                  zIndex: 1001,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    },
                    '50%': {
                      boxShadow:
                        '0 4px 12px rgba(0, 122, 255, 0.4), 0 0 0 4px rgba(0, 122, 255, 0.1)',
                    },
                    '100%': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0, 122, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                    animation: 'none',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                <MenuIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* AI Chat Bot - Overlaid on top of everything */}
        <ChatBot
          itinerary={itinerary}
          onItineraryUpdate={handleItineraryUpdate}
          currentTrip={currentTrip}
        />

        {/* Login Modal */}
        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Trip Selector Modal */}
        <TripSelector
          open={tripSelectorOpen}
          onClose={() => setTripSelectorOpen(false)}
          trips={trips}
          currentTrip={currentTrip}
          onTripSelect={handleTripSelect}
          onTripCreated={handleTripCreated}
        />

        {/* Add Activity Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Location Name"
                value={newActivity.location}
                onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                fullWidth
                required
              />
              <Autocomplete
                freeSolo
                options={addressSuggestions}
                value={newActivity.address}
                onInputChange={(event, newValue) => handleAddressChange(newValue)}
                onChange={(event, selectedOption) => handleAddressSelect(selectedOption)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Address"
                    fullWidth
                    placeholder="Start typing an address..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      {option.label}
                    </Box>
                  );
                }}
              />
              <Autocomplete
                freeSolo
                options={activitySuggestions}
                value={newActivity.activity}
                onInputChange={(event, newValue) => handleActivityChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Activity Description"
                    fullWidth
                    required
                    placeholder="Start typing an activity..."
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      {option.label}
                    </Box>
                  );
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                  label="Activity Type"
                >
                  <MenuItem value="activity">Activity</MenuItem>
                  <MenuItem value="museum">Museum</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="landmark">Landmark</MenuItem>
                  <MenuItem value="accommodation">Accommodation</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="outdoor">Outdoor</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Duration"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Rating"
                  type="number"
                  value={newActivity.rating}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, rating: parseFloat(e.target.value) })
                  }
                  inputProps={{ min: 1, max: 5, step: 0.1 }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Note: Coordinates will be set to Times Square by default. You can update them later
                by using the address autocomplete.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={addActivity} variant="contained">
              Add Activity
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Activity Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogContent>
            {editingActivity && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Location Name"
                  value={editingActivity.location}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, location: e.target.value })
                  }
                  fullWidth
                  required
                />
                <TextField
                  label="Address"
                  value={editingActivity.address}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, address: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Activity Description"
                  value={editingActivity.activity}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, activity: e.target.value })
                  }
                  fullWidth
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    value={editingActivity.type}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, type: e.target.value })
                    }
                    label="Activity Type"
                  >
                    <MenuItem value="activity">Activity</MenuItem>
                    <MenuItem value="museum">Museum</MenuItem>
                    <MenuItem value="shopping">Shopping</MenuItem>
                    <MenuItem value="landmark">Landmark</MenuItem>
                    <MenuItem value="accommodation">Accommodation</MenuItem>
                    <MenuItem value="restaurant">Restaurant</MenuItem>
                    <MenuItem value="outdoor">Outdoor</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Date"
                    type="date"
                    value={editingActivity.date}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, date: e.target.value })
                    }
                    sx={{ flex: 1 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    label="Time"
                    type="time"
                    value={editingActivity.time}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, time: e.target.value })
                    }
                    sx={{ flex: 1 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Duration"
                    value={editingActivity.duration}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, duration: e.target.value })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Rating"
                    type="number"
                    value={editingActivity.rating}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, rating: parseFloat(e.target.value) })
                    }
                    inputProps={{ min: 1, max: 5, step: 0.1 }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
                setEditingActivity(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateActivity} variant="contained">
              Update Activity
            </Button>
          </DialogActions>
        </Dialog>

        {/* Book Now Snackbar */}
        <Snackbar
          open={bookNowSnackbarOpen}
          autoHideDuration={3000}
          onClose={handleBookNowSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleBookNowSnackbarClose}
            severity="info"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Coming Soon! Booking feature will be available soon.
          </Alert>
        </Snackbar>
      </DragDropContext>
    </ThemeProvider>
  );
}
