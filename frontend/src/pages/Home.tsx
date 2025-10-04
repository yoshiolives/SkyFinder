import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Discover Places',
      description: 'Explore amazing places around you with detailed information and photos.',
      icon: '📍',
    },
    {
      title: 'AI Recommendations',
      description: 'Get personalized recommendations powered by advanced AI technology.',
      icon: '🤖',
    },
    {
      title: 'Interactive Maps',
      description: 'Navigate through places with our intuitive map interface.',
      icon: '🗺️',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Discover Amazing Places
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Find the perfect places to visit with AI-powered recommendations
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/places')}
            sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}
          >
            Explore Places
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/recommendations')}
            sx={{ borderColor: 'white', color: 'white' }}
          >
            Get Recommendations
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Our Platform?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Experience the future of place discovery with AI-powered insights
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Map Preview Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Explore the World
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Discover places near you with our interactive map
          </Typography>
          
          <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer
              center={[40.7128, -74.0060]} // New York City
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[40.7128, -74.0060]}>
                <Popup>
                  <Typography variant="h6">New York City</Typography>
                  <Typography variant="body2">
                    Discover amazing places in the Big Apple!
                  </Typography>
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Ready to Start Exploring?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Join thousands of users discovering amazing places every day
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/places')}
          sx={{ mr: 2 }}
        >
          Start Exploring
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/about')}
        >
          Learn More
        </Button>
      </Container>
    </Box>
  );
};

export default Home;





