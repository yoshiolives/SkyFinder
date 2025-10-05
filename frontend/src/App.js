/* global google */
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Chip,
  IconButton,
  Fab,
  Drawer,
  Button,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Directions as DirectionsIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { GoogleMap, LoadScript, InfoWindow } from '@react-google-maps/api';
import ChatBot from './ChatBot';

// Constants to prevent re-renders
const LIBRARIES = ['places'];

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
  const [mapInstance, setMapInstance] = useState(null);
  const [itinerary, setItinerary] = useState(sampleItinerary);
  const [markers, setMarkers] = useState([]);

  // Debug selectedItem changes
  React.useEffect(() => {
    console.log('selectedItem changed:', selectedItem);
  }, [selectedItem]);

  // Create markers only once when map is ready
  useEffect(() => {
    if (isGoogleMapsLoaded && mapInstance && markers.length === 0) {
      console.log('Creating markers once...');
      const newMarkers = [];

      itinerary.forEach((item, index) => {
        // Add delay between marker creation
        setTimeout(() => {
          const lat = Number(item.coordinates[0]);
          const lng = Number(item.coordinates[1]);
          console.log(`Creating marker ${item.id}: ${item.location} at [${lat}, ${lng}]`);
          console.log(`Marker ${item.id} coordinates: lat=${lat}, lng=${lng}`);

          // Add larger offset to ensure markers are clearly separated
          const offsetLat = lat + (item.id * 0.001); // Larger offset based on ID
          const offsetLng = lng + (item.id * 0.001);

          // Create marker using native Google Maps API with different colors
          const colors = ['red', 'blue', 'green', 'orange', 'purple'];
          const marker = new google.maps.Marker({
            position: { lat: offsetLat, lng: offsetLng },
            map: mapInstance,
            title: item.location,
            zIndex: 1000 + item.id, // Higher z-index to ensure visibility
            clickable: true,
            animation: google.maps.Animation.DROP,
            optimized: false, // Disable optimization to ensure all markers are visible
            icon: {
              url: `https://maps.google.com/mapfiles/ms/icons/${colors[item.id - 1]}-dot.png`,
              scaledSize: new google.maps.Size(32, 32)
            },
            label: {
              text: item.id.toString(),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          });

          // Add click listener with proper event handling
          google.maps.event.addListener(marker, 'click', () => {
            console.log('Marker clicked:', item.location);
            console.log('Setting selected item:', item);
            setSelectedItem(item);
          });

          console.log(`Marker ${item.id} created:`, marker);
          console.log(`Marker ${item.id} visible:`, marker.getVisible());
          console.log(`Marker ${item.id} clickable:`, marker.getClickable());
          console.log(`Marker ${item.id} zIndex:`, marker.getZIndex());
          console.log(`Marker ${item.id} final position: lat=${offsetLat}, lng=${offsetLng}`);

          newMarkers.push(marker);

          // Final check after delay
          setTimeout(() => {
            console.log(`Marker ${item.id} after delay - visible:`, marker.getVisible());
            console.log(`Marker ${item.id} after delay - position:`, marker.getPosition());
          }, 500);
        }, index * 200); // 200ms delay between each marker
      });

      setMarkers(newMarkers);
      console.log('All markers created:', newMarkers.length);
    }
  }, [isGoogleMapsLoaded, mapInstance, itinerary, markers.length]);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleGoogleMapsLoad = () => {
    console.log('Google Maps loaded successfully!');
    console.log('Google Maps API available:', !!window.google?.maps);
    console.log('Marker constructor available:', !!window.google?.maps?.Marker);
    console.log('Animation available:', !!window.google?.maps?.Animation);
    console.log('Total markers to render:', itinerary.length);
    // Don't set isGoogleMapsLoaded here - wait for map onLoad
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
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          '& .gm-style': {
            zIndex: 'auto !important'
          },
          '& .gm-style-iw': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-d': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-c': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-t': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-tc': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-t::after': {
            zIndex: '1000 !important'
          },
          '& .gm-style-iw-tc::after': {
            zIndex: '1000 !important'
          },
          '& .gm-style-marker': {
            zIndex: '100 !important'
          },
          '& .gm-style-marker div': {
            zIndex: '100 !important'
          },
          '& .gm-style img': {
            zIndex: '100 !important'
          },
          '& .gm-style div[style*="position: absolute"]': {
            zIndex: '100 !important'
          }
        }}>
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            onLoad={handleGoogleMapsLoad}
            onError={(error) => {
              console.error('Google Maps failed to load:', error);
              console.error('Error details:', error);
            }}
            libraries={LIBRARIES}
          >
            <GoogleMap
              mapContainerStyle={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                zIndex: 1
              }}
              center={{ lat: 40.758, lng: -73.9855 }} // Optimized center for all markers
              zoom={11}
              onLoad={(map) => {
                console.log('GoogleMap onLoad called, map instance:', map);
                console.log('Map center:', map.getCenter());
                console.log('Map zoom:', map.getZoom());
                console.log('Map container size:', map.getDiv().offsetWidth, 'x', map.getDiv().offsetHeight);
                setMapInstance(map);
                setIsGoogleMapsLoaded(true);

                // Test creating markers directly with native Google Maps API
                console.log('Testing native Google Maps markers...');
                const testMarker = new google.maps.Marker({
                  position: { lat: 40.758, lng: -73.9855 },
                  map: map,
                  title: "Test Marker",
                  zIndex: 999
                });
                console.log('Test marker created:', testMarker);
                console.log('Test marker visible:', testMarker.getVisible());
              }}
              options={{
                // Remove custom styling to show default colorful map
                mapTypeId: 'roadmap',
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                styles: [] // Remove any custom styles that might hide markers
              }}
            >
              {/* Markers are now created in useEffect to prevent duplication */}

              {/* Info Window for selected item */}
              {selectedItem && (
                <InfoWindow
                  position={{ lat: Number(selectedItem.coordinates[0]), lng: Number(selectedItem.coordinates[1]) }}
                  onCloseClick={() => {
                    console.log('InfoWindow close clicked');
                    setSelectedItem(null);
                  }}
                  onLoad={() => {
                    console.log('InfoWindow loaded for:', selectedItem.location);
                  }}
                >
                  <Box sx={{ p: 1, minWidth: 250 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }} component="div">
                      {selectedItem.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} component="div">
                      📅 {selectedItem.date} • 🕐 {selectedItem.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} component="div">
                      📍 {selectedItem.address}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }} component="div">
                      {selectedItem.activity} • {selectedItem.duration}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" component="div">
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
            component="div"
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
            zIndex: 1000,
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(250, 250, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1000
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
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }} component="div">
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} component="div">
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
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="div">
                          📅 {item.date} • 🕐 {item.time}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          📍 {item.address}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }} component="div">
                          {item.activity} • {item.duration}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <StarIcon sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" component="div">
                            {item.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
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
            display: { xs: 'flex', sm: 'none' },
            zIndex: 1001
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
