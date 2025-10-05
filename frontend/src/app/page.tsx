'use client';

import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';
import {
  AccountCircle,
  Add as AddIcon,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Directions as DirectionsIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Attractions as AttractionsIcon,
  Museum as MuseumIcon,
  ShoppingBag as ShoppingIcon,
  Place as PlaceIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Autocomplete,
  Avatar,
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
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GoogleMap, InfoWindow, Marker, useLoadScript } from '@react-google-maps/api';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
      main: '#3B82F6', // Blue-500 like iOS
    },
    secondary: {
      main: '#8B5CF6', // Purple-500 for accents
    },
    background: {
      default: '#F9FAFB', // Light gray like macOS
    },
    text: {
      primary: '#1F2937', // Dark gray for text
      secondary: '#6B7280', // Medium gray for secondary text
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "SF Pro Display", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function Home() {
  // Load Google Maps script (prevents duplicate loading on hot reload)
  const { isLoaded: isGoogleMapsLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'] as any,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any[]>([]);
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

  const loadTripItinerary = useCallback(async (trip: any) => {
    try {
      setLoading(true);
      setCurrentTrip(trip);

      // Fetch itinerary items for the selected trip
      const itineraryResponse = await api.get(`/api/itinerary?trip_id=${trip.id}`);
      const items = itineraryResponse.data.items;
      
      setItinerary(items || []);

      // Calculate map center from itinerary items
      if (items && items.length > 0) {
        // Calculate average coordinates from all items
        const avgLat = items.reduce((sum: number, item: any) => sum + item.coordinates[0], 0) / items.length;
        const avgLng = items.reduce((sum: number, item: any) => sum + item.coordinates[1], 0) / items.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      } else {
        // No items, reset map center
        setMapCenter(null);
      }
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
        await loadTripItinerary(newTrip);
      } else if (fetchedTrips && fetchedTrips.length > 0) {
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

  // Handle drag and drop
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceDay = source.droppableId;
    const destinationDay = destination.droppableId;

    if (sourceDay === destinationDay) {
      // Same day - reorder within the day
      const dayActivities = itinerary.filter((item) => item.date === sourceDay);
      const otherActivities = itinerary.filter((item) => item.date !== sourceDay);

      const [reorderedItem] = dayActivities.splice(source.index, 1);
      dayActivities.splice(destination.index, 0, reorderedItem);

      const newItinerary = [...otherActivities, ...dayActivities];
      setItinerary(newItinerary);
    } else {
      // Different day - move to new day
      const sourceActivities = itinerary.filter((item) => item.date === sourceDay);
      const destinationActivities = itinerary.filter((item) => item.date === destinationDay);
      const otherActivities = itinerary.filter(
        (item) => item.date !== sourceDay && item.date !== destinationDay
      );

      // Remove from source day
      const [movedItem] = sourceActivities.splice(source.index, 1);

      // Add to destination day at specific position
      const updatedItem = { ...movedItem, date: destinationDay };
      destinationActivities.splice(destination.index, 0, updatedItem);

      // Rebuild itinerary
      const newItinerary = [...otherActivities, ...sourceActivities, ...destinationActivities];
      setItinerary(newItinerary);

      // Update in backend
      try {
        await api.put(`/api/itinerary/${movedItem.id}`, {
          date: destinationDay,
        });
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

  // Group activities by day
  const getActivitiesByDay = () => {
    const grouped: { [key: string]: any[] } = {};
    itinerary.forEach((activity) => {
      const day = activity.date || `Day ${activity.day || 1}`;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(activity);
    });
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
              if (window.google?.maps?.places && status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
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
    } else if (selectedAddress && selectedAddress.placeId && typeof window !== 'undefined' && window.google?.maps) {
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
      default:
        return '#757575';
    }
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
      <DragDropContext onDragEnd={handleDragEnd}>
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
              alt="Places.ai Logo"
              width={40}
              height={40}
              style={{ borderRadius: '8px' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Places.ai
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

      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', pt: '64px' }}>
        {/* Apple-Style Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 320 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              boxSizing: 'border-box',
              background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(240 4.8% 95.9%) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid hsl(220 13% 91%)',
              borderLeft: 'none',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              marginTop: '64px',
              height: 'calc(100vh - 64px)',
              zIndex: 1000,
            },
          }}
        >
          {/* Sidebar Header */}
          <Box
            sx={{
              p: 3,
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
                        '&:hover:not(.Mui-disabled):before': { borderBottomColor: 'hsl(220 13% 91%)' },
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
                      fontSize: '1.25rem',
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
                  {currentTrip
                    ? `${currentTrip.destination || 'Destination'} • ${formatLocalDateSimple(currentTrip.start_date)} - ${formatLocalDateSimple(currentTrip.end_date)}`
                    : user
                      ? 'No trip selected'
                      : 'Sign in to get started'}
                </Typography>
              </Box>

              {/* Close Button */}
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: -20,
                  transform: 'translateY(-50%)',
                  width: 20,
                  height: 60,
                  background: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '0 6px 6px 0',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  color: 'hsl(240 5.9% 10%)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'hsl(240 4.8% 95.9%)',
                    transform: 'translateY(-50%) translateX(2px)',
                    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
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
                {trips.length === 0 ? 'Create Your First Trip' : `Select Trip (${trips.length})`}
              </Button>
            )}
          </Box>

          {/* Sidebar Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
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
            ) : itinerary.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {user ? '📝 No Itinerary Yet' : '🗺️ Welcome!'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user
                    ? 'Start planning your trip by adding activities and destinations.'
                    : 'Sign in to create and manage your travel itineraries.'}
                </Typography>
              </Box>
            ) : (
              Object.entries(getActivitiesByDay())
                .sort(([a], [b]) => {
                  const dateA = new Date(a);
                  const dateB = new Date(b);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(([day, activities]) => (
                  <Accordion
                    key={day}
                    defaultExpanded
                    sx={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderRadius: 2,
                      mb: 1,
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { margin: '0 0 8px 0' },
                      backgroundColor: 'transparent',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: 'white', fontSize: 20 }} />}
                      sx={{
                        backgroundColor: '#007AFF !important',
                        borderRadius: 2,
                        color: 'white',
                        minHeight: 48,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&.MuiAccordionSummary-root': {
                          backgroundColor: '#007AFF !important',
                        },
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                          filter: 'brightness(1.05)',
                        },
                        '&.Mui-expanded': {
                          borderRadius: '8px 8px 0 0',
                          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
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
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              minHeight: '50px',
                              backgroundColor: snapshot.isDraggingOver
                                ? 'rgba(0, 122, 255, 0.1)'
                                : 'transparent',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s ease',
                              position: 'relative',
                              zIndex: snapshot.isDraggingOver ? 1000 : 'auto',
                            }}
                          >
                            {activities.map((item: any, index: number) => (
                              <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                {(provided, snapshot) => {
                                  const child = (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedItem(item)}
                                      sx={{
                                        p: 2,
                                        mx: 0.5,
                                        mb: 0.5,
                                        borderRadius: 2,
                                        cursor: 'grab',
                                        backgroundColor:
                                          selectedItem?.id === item.id
                                            ? 'rgba(0, 122, 255, 0.1)'
                                            : 'rgba(248, 249, 250, 0.8)',
                                        border:
                                          selectedItem?.id === item.id
                                            ? '1px solid rgba(0, 122, 255, 0.3)'
                                            : '1px solid rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                        zIndex: snapshot.isDragging ? 99999 : 'auto',
                                        boxShadow: snapshot.isDragging
                                          ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                                          : selectedItem?.id === item.id
                                            ? '0 2px 8px rgba(0, 122, 255, 0.15)'
                                            : '0 1px 3px rgba(0, 0, 0, 0.1)',
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
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          minHeight: 64,
                                          py: 1,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            flex: 1,
                                            minWidth: 0,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 36,
                                              height: 36,
                                              borderRadius: 2,
                                              backgroundColor:
                                                selectedItem?.id === item.id ? '#007AFF' : '#F2F2F7',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              mt: 0,
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
                                                    selectedItem?.id === item.id ? 'white' : '#8E8E93',
                                                }}
                                              />
                                            ) : item.type === 'shopping' ? (
                                              <ShoppingIcon
                                                sx={{
                                                  fontSize: 16,
                                                  color:
                                                    selectedItem?.id === item.id ? 'white' : '#8E8E93',
                                                }}
                                              />
                                            ) : item.type === 'landmark' ? (
                                              <PlaceIcon
                                                sx={{
                                                  fontSize: 16,
                                                  color:
                                                    selectedItem?.id === item.id ? 'white' : '#8E8E93',
                                                }}
                                              />
                                            ) : (
                                              <AttractionsIcon
                                                sx={{
                                                  fontSize: 16,
                                                  color:
                                                    selectedItem?.id === item.id ? 'white' : '#8E8E93',
                                                }}
                                              />
                                            )}
                                          </Box>
                                          <Box
                                            sx={{
                                              flex: 1,
                                              minWidth: 0,
                                              display: 'flex',
                                              flexDirection: 'column',
                                              justifyContent: 'center',
                                              minHeight: 48,
                                              py: 0.5,
                                            }}
                                          >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                              <Typography
                                                variant="subtitle2"
                                                sx={{
                                                  fontWeight: 500,
                                                  color: '#1D1D1F',
                                                  fontSize: '0.875rem',
                                                  lineHeight: 1.4,
                                                }}
                                              >
                                                {item.location}
                                              </Typography>
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
                                                  transition: 'all 0.2s ease',
                                                  '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    backgroundColor: `${getActivityColor(item.type)}30`,
                                                  },
                                                }}
                                              />
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ScheduleIcon sx={{ fontSize: 14, color: '#8E8E93' }} />
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
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon sx={{ fontSize: 14, color: '#8E8E93' }} />
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    color: '#8E8E93',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 400,
                                                    maxWidth: 120,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                  }}
                                                >
                                                  {item.address}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5, alignSelf: 'center' }}>
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

                                  return snapshot.isDragging ? createPortal(child, document.body) : child;
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </AccordionDetails>
                  </Accordion>
                ))
            )}
          </Box>

          {/* Sidebar Footer */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(240 4.8% 95.9%) 100%)',
              borderTop: '1px solid hsl(220 13% 91%)',
              p: 3,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              disabled={!currentTrip}
              sx={{
                width: '100%',
                background: 'linear-gradient(135deg, hsl(240 5.9% 10%) 0%, hsl(240 5.9% 10%) 100%)',
                color: 'hsl(0 0% 98%)',
                borderRadius: '8px',
                py: 1.5,
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.875rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, hsl(240 5.9% 10%) 0%, hsl(240 5.9% 10%) 100%)',
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">Error loading Google Maps</Typography>
            </Box>
          )}
          {!isGoogleMapsLoaded && !loadError && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          {isGoogleMapsLoaded && !loadError && !mapCenter && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              backgroundColor: '#f5f5f5'
            }}>
              <Typography variant="h6" color="text.secondary">
                Select or create a trip to view on the map
              </Typography>
            </Box>
          )}
          {isGoogleMapsLoaded && !loadError && mapCenter && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100vh' }}
              center={mapCenter}
              zoom={12}
              options={{
                styles: [
                  {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#f5f5f5' }],
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#c9c9c9' }],
                  },
                  {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#757575' }],
                  },
                ],
              }}
              onLoad={() => setMapReady(true)}
            >
              {/* Map Markers for each itinerary item */}
              {mapReady && itinerary.map((item) => {
                // Create custom icon only if Google Maps is fully loaded
                let customIcon = undefined;
                try {
                  if (isGoogleMapsLoaded && typeof window !== 'undefined' && window.google?.maps?.Size && window.google?.maps?.Point) {
                    customIcon = {
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="${getActivityColor(item.type)}" stroke="white" stroke-width="3"/>
                      <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
                        ${getActivityIcon(item.type)}
                      </text>
                    </svg>
                  `)}`,
                      scaledSize: new window.google.maps.Size(40, 40),
                      anchor: new window.google.maps.Point(20, 20),
                    };
                  }
                } catch (error) {
                  console.warn('Failed to create custom marker icon:', error);
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

              {/* Info Window for selected item */}
              {mapReady && selectedItem && (
                <InfoWindow
                  position={{ lat: selectedItem.coordinates[0], lng: selectedItem.coordinates[1] }}
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedItem.rating}
                      </Typography>
                    </Box>
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
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            zIndex: 1001,
            opacity: sidebarOpen ? 0 : 1,
            visibility: sidebarOpen ? 'hidden' : 'visible',
            transition: sidebarOpen
              ? 'opacity 0.1s ease-out, visibility 0.1s ease-out'
              : 'opacity 0.3s ease-in 0.3s, visibility 0.3s ease-in 0.3s',
            marginTop: '32px',
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            sx={{
              background: 'hsl(0 0% 100%)',
              color: 'hsl(240 5.9% 10%)',
              width: 32,
              height: 32,
              borderRadius: '0 6px 6px 0',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              border: '1px solid hsl(220 13% 91%)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'hsl(240 4.8% 95.9%)',
                transform: 'translateX(2px)',
                boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
              },
              '&:active': {
                transform: 'translateX(1px) scale(0.98)',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <MenuIcon />
        </Fab>
      </Box>

      {/* AI Chat Bot - Overlaid on top of everything */}
      <ChatBot itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} currentTrip={currentTrip} />

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
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
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
              Note: Coordinates will be set to Times Square by default. You can update them later by
              using the address autocomplete.
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          {editingActivity && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Location Name"
                value={editingActivity.location}
                onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Address"
                value={editingActivity.address}
                onChange={(e) => setEditingActivity({ ...editingActivity, address: e.target.value })}
                fullWidth
              />
              <TextField
                label="Activity Description"
                value={editingActivity.activity}
                onChange={(e) => setEditingActivity({ ...editingActivity, activity: e.target.value })}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={editingActivity.type}
                  onChange={(e) => setEditingActivity({ ...editingActivity, type: e.target.value })}
                  label="Activity Type"
                >
                  <MenuItem value="activity">Activity</MenuItem>
                  <MenuItem value="museum">Museum</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="landmark">Landmark</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="outdoor">Outdoor</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  value={editingActivity.date}
                  onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })}
                  sx={{ flex: 1 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Time"
                  type="time"
                  value={editingActivity.time}
                  onChange={(e) => setEditingActivity({ ...editingActivity, time: e.target.value })}
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
                  onChange={(e) => setEditingActivity({ ...editingActivity, duration: e.target.value })}
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
          <Button onClick={() => {
            setEditDialogOpen(false);
            setEditingActivity(null);
          }}>
            Cancel
          </Button>
          <Button onClick={updateActivity} variant="contained">
            Update Activity
          </Button>
        </DialogActions>
      </Dialog>
      </DragDropContext>
    </ThemeProvider>
  );
}
