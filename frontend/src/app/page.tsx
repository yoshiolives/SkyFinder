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
  const [user, setUser] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // Saved Places State
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListIcon, setNewListIcon] = useState('📌');
  const [newListColor, setNewListColor] = useState('#4285F4');
  const [saveToListDialogOpen, setSaveToListDialogOpen] = useState(false);
  const [placeToSave, setPlaceToSave] = useState<any>(null);
  
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
  const [mapZoom, setMapZoom] = useState(13);
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
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

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

  // Helper function to convert EPSG:3857 to WGS84
  const epsg3857ToWgs84 = (x: number, y: number) => {
    const lon = (x / 20037508.34) * 180;
    let lat = (y / 20037508.34) * 180;
    lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
    return [lon, lat];
  };

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
            
            // Check if coordinates are in EPSG:3857 (Web Mercator)
            const isEpsg3857 = geoJson.crs?.properties?.name === 'EPSG:3857';
            
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
                // Transform line coordinates from EPSG:3857 to WGS84
                if (isEpsg3857 && feature.geometry.coordinates) {
                  const transformedCoords = feature.geometry.coordinates.map((coord: number[]) => {
                    const [lon, lat] = epsg3857ToWgs84(coord[0], coord[1]);
                    return [lon, lat];
                  });
                  lines.push({
                    ...feature,
                    geometry: {
                      ...feature.geometry,
                      coordinates: transformedCoords,
                    },
                  });
                } else {
                  lines.push(feature);
                }
              } else if (feature.geometry.type === 'Point') {
                // Transform point coordinates from EPSG:3857 to WGS84
                if (isEpsg3857 && feature.geometry.coordinates) {
                  const [lon, lat] = epsg3857ToWgs84(
                    feature.geometry.coordinates[0],
                    feature.geometry.coordinates[1]
                  );
                  stations.push({
                    ...feature,
                    geometry: {
                      ...feature.geometry,
                      coordinates: [lon, lat],
                    },
                  });
                } else {
                  stations.push(feature);
                }
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

  // Draw polylines for transit lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || transitLines.length === 0) return;

    // Clear existing polylines
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // Draw new polylines
    transitLines.forEach((line) => {
      if (!line.geometry || !line.geometry.coordinates) return;

      if (line.geometry.type === 'LineString') {
        const path = line.geometry.coordinates.map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0],
        }));

        const polyline = new google.maps.Polyline({
          path,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 3,
        });

        polyline.setMap(map);
        polylinesRef.current.push(polyline);
      } else if (line.geometry.type === 'MultiLineString') {
        // Draw each line segment in the MultiLineString
        line.geometry.coordinates.forEach((lineString: number[][]) => {
          const path = lineString.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0],
          }));

          const polyline = new google.maps.Polyline({
            path,
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 3,
          });

          polyline.setMap(map);
          polylinesRef.current.push(polyline);
        });
      }
    });

    console.log(`🗺️ Drew ${polylinesRef.current.length} transit lines`);
  }, [transitLines]);

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
      if (circle) {
        circle.setMap(null);
        circlesRef.current.delete(stationIndex);
        selectedStationsRef.current.delete(stationIndex);
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

  // Saved Places Functions
  const fetchSavedLists = async () => {
    try {
      const response = await api.get('/api/lists');
      setSavedLists(response.data.lists || []);
    } catch (error) {
      console.error('Error fetching saved lists:', error);
    }
  };

  const fetchSavedPlaces = async () => {
    try {
      console.log('Fetching saved places...');
      const response = await api.get('/api/lists/items');
      console.log('Saved places response:', response.data);
      setSavedPlaces(response.data.items || []);
      console.log('Set saved places:', response.data.items?.length || 0, 'items');
    } catch (error) {
      console.error('Error fetching saved places:', error);
    }
  };

  const handleSavePlace = (place: any) => {
    setPlaceToSave(place);
    setSaveToListDialogOpen(true);
  };

  const handleAddToSavedList = async (listId: string) => {
    if (!placeToSave) return;
    try {
      // Transform the place data to match the expected format
      const placeData = {
        name: placeToSave.name,
        address: placeToSave.address || placeToSave.vicinity || '',
        latitude: placeToSave.latitude || placeToSave.coordinates?.[0],
        longitude: placeToSave.longitude || placeToSave.coordinates?.[1],
        rating: placeToSave.rating || null,
        place_id: placeToSave.place_id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_ratings_total: placeToSave.user_ratings_total || 0,
        price_level: placeToSave.price_level || null,
        types: placeToSave.types || [],
        photos: placeToSave.photos || [],
      };

      console.log('Sending place data:', placeData);
      
      const response = await api.post(`/api/lists/${listId}/items`, placeData);
      console.log('Save response:', response.data);
      
      setSaveToListDialogOpen(false);
      setPlaceToSave(null);
      setSelectedSearchResult(null);
      
      // Refresh saved places
      console.log('Refreshing saved places...');
      await fetchSavedPlaces();
      
      alert('Place saved to list!');
    } catch (error: any) {
      console.error('Error adding to list:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 409) {
        alert('This place is already in the list!');
      } else if (error.response?.status === 400) {
        alert(`Validation error: ${error.response.data.error}`);
      } else {
        alert(`Failed to add to list: ${error.response?.data?.error || 'Unknown error'}`);
      }
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const response = await api.post('/api/lists', {
        name: newListName,
        icon: newListIcon,
        color: newListColor,
      });
      const newList = response.data.list;
      setSavedLists([...savedLists, newList]);
      
      // If there's a place waiting to be saved, add it to the new list
      if (placeToSave) {
        try {
          const placeData = {
            name: placeToSave.name,
            address: placeToSave.address || placeToSave.vicinity || '',
            latitude: placeToSave.latitude || placeToSave.coordinates?.[0],
            longitude: placeToSave.longitude || placeToSave.coordinates?.[1],
            rating: placeToSave.rating || null,
            place_id: placeToSave.place_id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_ratings_total: placeToSave.user_ratings_total || 0,
            price_level: placeToSave.price_level || null,
            types: placeToSave.types || [],
            photos: placeToSave.photos || [],
          };
          await api.post(`/api/lists/${newList.id}/items`, placeData);
          fetchSavedPlaces();
        } catch (error) {
          console.error('Error adding place to new list:', error);
        }
      }
      
      setCreateListDialogOpen(false);
      setNewListName('');
      setNewListIcon('📌');
      setNewListColor('#4285F4');
      setPlaceToSave(null);
      setSelectedSearchResult(null);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/api/lists/${listId}`);
      setSavedLists(savedLists.filter((list) => list.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list. Please try again.');
    }
  };

  const handleRemoveFromList = async (listId: string, itemId: string) => {
    try {
      await api.delete(`/api/lists/${listId}/items/${itemId}`);
      fetchSavedPlaces();
    } catch (error) {
      console.error('Error removing from list:', error);
      alert('Failed to remove from list. Please try again.');
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

      // Geocode destination to center the map
      if (trip.destination && typeof window !== 'undefined' && window.google?.maps) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: trip.destination }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              setMapCenter({ lat: location.lat(), lng: location.lng() });
            } else {
              setMapCenter(null);
            }
          });
        } catch (error) {
          console.error('Geocoding failed:', error);
          setMapCenter(null);
        }
      } else {
        setMapCenter(null);
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
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
        fetchSavedLists();
        fetchSavedPlaces();
      } else {
        setUser(null);
        setTrips([]);
        setCurrentTrip(null);
        setSavedLists([]);
        setSavedPlaces([]);
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
          setCurrentTrip(null);
        }

        // Mark data as loaded
        hasLoadedDataRef.current = true;
      } catch (error) {
        console.error('Failed to fetch trips:', error);
        setTrips([]);
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
      // Escape to close sidebar or hide search results
      if (event.key === 'Escape') {
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
        if (searchResults.length > 0) {
          handleHideSearchResults();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, searchResults]);

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

  // Track which day is being dragged over for hover-to-expand
  const [draggedOverDay, setDraggedOverDay] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dragFeedback, setDragFeedback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

    setIsEditingTitle(false);
    return;
  }

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

  const handleLoginSuccess = async (loggedInUser: any) => {
    setUser(loggedInUser);
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTrips([]);
    setCurrentTrip(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDragStart = (_result: any) => {
    setIsDragging(true);
  };

  const handleDragEnd = (_result: any) => {
    setIsDragging(false);
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
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Toolbar sx={{ px: 3, py: 1 }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4 }}>
              <Image
                src="/logo.png"
                alt="SkyFinder Logo"
                width={40}
                height={40}
                style={{ borderRadius: '8px' }}
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1D1D1F',
                  fontSize: '1.25rem',
                }}
              >
                SkyFinder
              </Typography>
            </Box>

            {/* Search Bar */}
            <Box sx={{ flexGrow: 1, maxWidth: 600, position: 'relative' }}>
              <TextField
                placeholder={selectedStations.size > 0 ? "Search places near stations..." : "⚠️ Click stations on map to search"}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedStations.size === 0) {
                    alert('Please select at least one station on the map first!');
                  }
                }}
                disabled={selectedStations.size === 0}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <SearchIcon sx={{ color: selectedStations.size > 0 ? '#007AFF' : '#8E8E93', fontSize: 20 }} />
                    </Box>
                  ),
                  endAdornment: searchQuery && (
                    <IconButton 
                      size="small" 
                      onClick={handleClearSearch}
                      sx={{ mr: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F5F5F7',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    '& fieldset': {
                      borderColor: selectedStations.size > 0 ? '#007AFF' : '#E5E5EA',
                    },
                    '&:hover fieldset': {
                      borderColor: '#007AFF',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: '#007AFF',
                      },
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#F5F5F7',
                      opacity: 0.5,
                    },
                  },
                }}
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '400px',
                    overflow: 'auto',
                    zIndex: 1300,
                  }}
                >
                  {searchResults.map((result, index) => (
                    <Box
                      key={result.place_id || index}
                      onClick={() => {
                        setSelectedSearchResult(result);
                        setSearchResults([]);
                      }}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderBottom: index < searchResults.length - 1 ? '1px solid' : 'none',
                        borderColor: '#E5E5EA',
                        '&:hover': {
                          backgroundColor: '#F5F5F7',
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

            {/* User Info */}
            {user ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{ 
                    textTransform: 'none',
                    color: '#1D1D1F',
                    ml: 2,
                    '&:hover': {
                      backgroundColor: '#F5F5F7',
                    },
                  }}
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#007AFF' }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  }
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
                onClick={() => setLoginModalOpen(true)}
                variant="contained"
                sx={{
                  ml: 2,
                  backgroundColor: '#007AFF',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                }}
                startIcon={<LoginIcon />}
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
                      {currentTrip ? currentTrip.title : 'Saved Lists'}
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
                  {trips.length === 0 ? 'Create Your First List' : `Switch Trip (${trips.length})`}
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
                    Sign in to save places and create your own lists.
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

                  {savedPlaces.filter((item) => item.list_id === selectedList.id).length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No places saved yet
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {savedPlaces
                        .filter((item) => item.list_id === selectedList.id)
                        .map((item) => (
                          <ListItem
                            key={item.id}
                            button
                            onClick={() => {
                              // Center map on this location
                              if (item.latitude && item.longitude) {
                                setMapCenter({ 
                                  lat: parseFloat(item.latitude), 
                                  lng: parseFloat(item.longitude) 
                                });
                                // Zoom in to show the location better
                                setMapZoom(16);
                                // Set as selected item to show in InfoWindow
                                setSelectedItem(item);
                                // Close the search result if open
                                setSelectedSearchResult(null);
                              }
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
                              <PlaceIcon sx={{ color: selectedList.color }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.name}
                              secondary={item.address}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromList(selectedList.id, item.id);
                              }}
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
                          onClick={() => setSelectedList(list)}
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
                onClick={() => setCreateListDialogOpen(true)}
                disabled={!user}
                sx={{
                  width: '100%',
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
                Create New List
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
                zoom={mapZoom}
                options={{
                  styles: [
                    {
                      featureType: 'water',
                      elementType: 'geometry',
                      stylers: [{ color: '#a2daf2' }],
                    },
                  ],
                }}
                onLoad={(map) => {
                  mapInstanceRef.current = map;
                  setMapReady(true);
                }}
              >
                {/* Transit Stations (Markers) */}
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

                {/* Saved Places Markers */}
                {savedPlaces.map((place) => (
                  <Marker
                    key={place.id}
                    position={{ lat: place.latitude, lng: place.longitude }}
                    onClick={() => setSelectedItem(place)}
                  />
                ))}

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
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
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
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<StarIcon />}
                          onClick={() => {
                            setPlaceToSave(selectedSearchResult);
                            setSaveToListDialogOpen(true);
                          }}
                        >
                          Save to List
                        </Button>
                      </Box>
                    </Box>
                  </InfoWindow>
                )}

                {/* Info Window for selected item */}
                {selectedItem && (
                  <InfoWindow
                    position={{
                      lat: selectedItem.latitude,
                      lng: selectedItem.longitude,
                    }}
                    onCloseClick={() => setSelectedItem(null)}
                  >
                    <Box sx={{ p: 1, minWidth: 250 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedItem.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {selectedItem.address}
                      </Typography>
                      {selectedItem.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedItem.rating}
                          </Typography>
                        </Box>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<StarIcon />}
                        onClick={() => handleSavePlace(selectedItem)}
                        sx={{ mt: 1 }}
                      >
                        Save to Another List
                      </Button>
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
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
          itinerary={[]}
          onItineraryUpdate={() => {}}
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

        {/* Create List Dialog */}
        <Dialog
          open={createListDialogOpen}
          onClose={() => {
            setCreateListDialogOpen(false);
            setNewListName('');
            setNewListIcon('📌');
            setNewListColor('#4285F4');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New List</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                fullWidth
                required
                placeholder="e.g., Coffee Shops, Restaurants to Try"
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Icon"
                  value={newListIcon}
                  onChange={(e) => setNewListIcon(e.target.value)}
                  sx={{ width: 100 }}
                  placeholder="📌"
                />
                <TextField
                  label="Color"
                  type="color"
                  value={newListColor}
                  onChange={(e) => setNewListColor(e.target.value)}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateListDialogOpen(false);
              setNewListName('');
              setNewListIcon('📌');
              setNewListColor('#4285F4');
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} variant="contained" disabled={!newListName.trim()}>
              Create List
            </Button>
          </DialogActions>
        </Dialog>

        {/* Save to List Dialog */}
        <Dialog
          open={saveToListDialogOpen}
          onClose={() => {
            setSaveToListDialogOpen(false);
            setPlaceToSave(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Save to List
            {placeToSave && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 'normal' }}>
                {placeToSave.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {savedLists.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No lists available. Create a list to save this place.
                </Typography>
              ) : (
                savedLists.map((list) => (
                  <Button
                    key={list.id}
                    variant="outlined"
                    fullWidth
                    startIcon={<Typography sx={{ fontSize: '1.5rem' }}>{list.icon}</Typography>}
                    onClick={() => handleAddToSavedList(list.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                    }}
                  >
                    {list.name}
                  </Button>
                ))
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => {
                  setSaveToListDialogOpen(false);
                  setCreateListDialogOpen(true);
                }}
                sx={{
                  textTransform: 'none',
                }}
              >
                Create New List
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setSaveToListDialogOpen(false);
              setPlaceToSave(null);
            }}>
              Cancel
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
