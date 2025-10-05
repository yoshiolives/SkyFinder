'use client';

import {
  AccountCircle,
  Add as AddIcon,
  Close as CloseIcon,
  Directions as DirectionsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import React, { useCallback, useEffect, useState } from 'react';
import ChatBot from '@/components/ChatBot';
import LoginModal from '@/components/LoginModal';
import TripSelector from '@/components/TripSelector';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Sample itinerary data
const _sampleItinerary = [
  {
    id: 1,
    date: '2024-01-15',
    time: '09:00',
    location: 'Central Park',
    address: 'New York, NY 10024',
    activity: 'Morning Walk & Photography',
    duration: '2 hours',
    type: 'activity',
    rating: 4.8,
    coordinates: [40.7829, -73.9654],
  },
  {
    id: 2,
    date: '2024-01-15',
    time: '12:00',
    location: 'The Metropolitan Museum of Art',
    address: '1000 5th Ave, New York, NY 10028',
    activity: 'Museum Visit',
    duration: '3 hours',
    type: 'museum',
    rating: 4.7,
    coordinates: [40.7794, -73.9632],
  },
  {
    id: 3,
    date: '2024-01-15',
    time: '16:00',
    location: 'Times Square',
    address: 'Times Square, New York, NY 10036',
    activity: 'Shopping & Sightseeing',
    duration: '2 hours',
    type: 'shopping',
    rating: 4.2,
    coordinates: [40.758, -73.9855],
  },
  {
    id: 4,
    date: '2024-01-16',
    time: '10:00',
    location: 'Statue of Liberty',
    address: 'Liberty Island, New York, NY 10004',
    activity: 'Ferry Tour & Monument Visit',
    duration: '4 hours',
    type: 'landmark',
    rating: 4.9,
    coordinates: [40.6892, -74.0445],
  },
  {
    id: 5,
    date: '2024-01-16',
    time: '15:00',
    location: 'Brooklyn Bridge',
    address: 'Brooklyn Bridge, New York, NY 10038',
    activity: 'Bridge Walk & Photography',
    duration: '1.5 hours',
    type: 'activity',
    rating: 4.6,
    coordinates: [40.7061, -73.9969],
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripSelectorOpen, setTripSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTripItinerary = useCallback(async (trip: any) => {
    try {
      setLoading(true);
      setCurrentTrip(trip);

      // Fetch itinerary items for the selected trip
      const itineraryResponse = await api.get(`/api/itinerary?trip_id=${trip.id}`);
      const items = itineraryResponse.data.items;

      setItinerary(items || []);
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
      console.log('Auth state changed:', _event, session?.user?.email);
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
        console.log('Initial session found for user:', session.user.email);
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

  const handleTripCreated = async () => {
    // Refresh trips list
    try {
      const tripsResponse = await api.get('/api/trips');
      const fetchedTrips = tripsResponse.data.trips;
      setTrips(fetchedTrips || []);

      // Load the newly created trip (first in list after refresh)
      if (fetchedTrips && fetchedTrips.length > 0) {
        await loadTripItinerary(fetchedTrips[0]);
      }
    } catch (error) {
      console.error('Failed to refresh trips:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleGoogleMapsLoad = () => {
    setIsGoogleMapsLoaded(true);
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🗺️ Travel Itinerary Planner
          </Typography>

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
        {/* Google Map Background */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            onLoad={handleGoogleMapsLoad}
            onError={(error) => {
              console.error('Google Maps failed to load:', error);
            }}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100vh' }}
              center={{ lat: 40.7128, lng: -74.006 }} // New York City center
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
            >
              {/* Map Markers for each itinerary item */}
              {itinerary.map((item) => (
                <Marker
                  key={item.id}
                  position={{ lat: item.coordinates[0], lng: item.coordinates[1] }}
                  onClick={() => setSelectedItem(item)}
                  icon={
                    isGoogleMapsLoaded
                      ? {
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
                        }
                      : undefined
                  }
                />
              ))}

              {/* Info Window for selected item */}
              {selectedItem && (
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
          </LoadScript>
        </Box>

        {/* Left Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 400 : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(250, 250, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              marginTop: '64px',
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                📅 {currentTrip ? currentTrip.title : 'My Itinerary'}
              </Typography>
              <IconButton
                color="inherit"
                onClick={toggleSidebar}
                sx={{ display: { xs: 'block', sm: 'none' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}
            >
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {currentTrip
                  ? `${currentTrip.destination} • ${new Date(currentTrip.start_date).toLocaleDateString()} - ${new Date(currentTrip.end_date).toLocaleDateString()}`
                  : user
                    ? 'No trip selected'
                    : 'Sign in to get started'}
              </Typography>
            </Box>
            {user && (
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setTripSelectorOpen(true)}
                sx={{
                  mt: 1.5,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {trips.length === 0 ? 'Create Your First Trip' : `Switch Trip (${trips.length})`}
              </Button>
            )}
          </Box>

          {/* Itinerary List */}
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
              <List sx={{ p: 0 }}>
                {itinerary.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        backgroundColor:
                          selectedItem?.id === item.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
                      }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: getActivityColor(item.type),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getActivityIcon(item.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {item.location}
                            </Typography>
                            <Chip
                              label={item.type}
                              size="small"
                              sx={{
                                backgroundColor: getActivityColor(item.type),
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              📅 {item.date} • 🕐 {item.time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📍 {item.address}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {item.activity} • {item.duration}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <StarIcon sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {item.rating}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < itinerary.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Sidebar Footer */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(245, 245, 245, 0.8)' }}>
            <Button variant="contained" startIcon={<AddIcon />} fullWidth sx={{ mb: 1 }}>
              Add New Activity
            </Button>
            <Button variant="outlined" startIcon={<DirectionsIcon />} fullWidth>
              Get Directions
            </Button>
          </Box>
        </Drawer>

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

        {/* AI Chat Bot */}
        <ChatBot itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} />
      </Box>

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
    </ThemeProvider>
  );
}
