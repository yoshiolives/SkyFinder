import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  IconButton,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Map as MapIcon, 
  Add as AddIcon, 
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Directions as DirectionsIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import ChatBot from './ChatBot';

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
const sampleItinerary = [
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
    coordinates: [40.7829, -73.9654]
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
    coordinates: [40.7794, -73.9632]
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
    coordinates: [40.7580, -73.9855]
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
    coordinates: [40.6892, -74.0445]
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
    coordinates: [40.7061, -73.9969]
  }
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [itinerary, setItinerary] = useState(sampleItinerary);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleGoogleMapsLoad = () => {
    setIsGoogleMapsLoaded(true);
  };

  const handleItineraryUpdate = (updatedItinerary) => {
    if (updatedItinerary) {
      setItinerary(updatedItinerary);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'activity': return '🚶';
      case 'museum': return '🏛️';
      case 'shopping': return '🛍️';
      case 'landmark': return '🗽';
      default: return '📍';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'activity': return '#4caf50';
      case 'museum': return '#2196f3';
      case 'shopping': return '#ff9800';
      case 'landmark': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Google Map Background */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <LoadScript 
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            onLoad={handleGoogleMapsLoad}
            onError={(error) => {
              console.error('Google Maps failed to load:', error);
            }}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100vh' }}
              center={{ lat: 40.7128, lng: -74.0060 }} // New York City center
              zoom={12}
              options={{
                styles: [
                  {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#f5f5f5' }]
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#c9c9c9' }]
                  },
                  {
                    featureType: 'poi',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#757575' }]
                  }
                ]
              }}
            >
              {/* Map Markers for each itinerary item */}
                     {itinerary.map((item) => (
                <Marker
                  key={item.id}
                  position={{ lat: item.coordinates[0], lng: item.coordinates[1] }}
                  onClick={() => setSelectedItem(item)}
                  icon={isGoogleMapsLoaded ? {
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="${getActivityColor(item.type)}" stroke="white" stroke-width="3"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">
                          ${getActivityIcon(item.type)}
                        </text>
                      </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 20)
                  } : undefined}
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

          {/* Map Title Overlay */}
          <Typography 
            variant="h4" 
            sx={{ 
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              zIndex: 1000
            }}
          >
            🗺️ Your Travel Itinerary
          </Typography>
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            },
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                📅 My Itinerary
              </Typography>
              <IconButton
                color="inherit"
                onClick={toggleSidebar}
                sx={{ display: { xs: 'block', sm: 'none' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              New York City • Jan 15-16, 2024
            </Typography>
          </Box>

          {/* Itinerary List */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
                     {itinerary.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedItem?.id === item.id ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{
                        bgcolor: getActivityColor(item.type),
                        width: 40,
                        height: 40
                      }}>
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
                              fontSize: '0.7rem'
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
          </Box>

          {/* Sidebar Footer */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(245, 245, 245, 0.8)' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Add New Activity
            </Button>
            <Button
              variant="outlined"
              startIcon={<DirectionsIcon />}
              fullWidth
            >
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
            display: { xs: 'flex', sm: 'none' }
          }}
        >
          <MenuIcon />
        </Fab>

        {/* AI Chat Bot */}
        <ChatBot itinerary={itinerary} onItineraryUpdate={handleItineraryUpdate} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
