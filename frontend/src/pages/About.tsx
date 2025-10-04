import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Storage,
  Psychology,
  Language,
  Map,
  Security,
  Speed,
  Cloud,
  Analytics,
} from '@mui/icons-material';

const About: React.FC = () => {
  const technologies = [
    { name: 'React', category: 'Frontend', icon: '⚛️' },
    { name: 'TypeScript', category: 'Language', icon: '🔷' },
    { name: 'Material-UI', category: 'UI Library', icon: '🎨' },
    { name: 'Node.js/Express', category: 'Backend', icon: '🟢' },
    { name: 'Flask', category: 'Backend', icon: '🐍' },
    { name: 'Snowflake', category: 'Database', icon: '❄️' },
    { name: 'Google Gemini', category: 'AI', icon: '🤖' },
    { name: 'Leaflet', category: 'Maps', icon: '🗺️' },
  ];

  const features = [
    {
      icon: <Storage />,
      title: 'Snowflake Data Warehouse',
      description: 'Scalable cloud data warehouse for storing and analyzing place data with advanced analytics capabilities.',
    },
    {
      icon: <Psychology />,
      title: 'AI-Powered Recommendations',
      description: 'Google Gemini AI provides intelligent, personalized place recommendations based on user preferences.',
    },
    {
      icon: <Map />,
      title: 'Interactive Maps',
      description: 'Leaflet-powered maps with real-time location data and spatial queries for discovering nearby places.',
    },
    {
      icon: <Security />,
      title: 'Secure & Scalable',
      description: 'Built with security best practices, rate limiting, and scalable architecture for production use.',
    },
    {
      icon: <Speed />,
      title: 'High Performance',
      description: 'Optimized database queries, efficient API endpoints, and responsive frontend for fast user experience.',
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'User interaction tracking, preference analysis, and recommendation confidence scoring.',
    },
  ];

  const benefits = [
    'Discover amazing places with AI-powered recommendations',
    'Interactive maps with real-time location data',
    'Personalized suggestions based on your preferences',
    'Secure and scalable cloud architecture',
    'Advanced analytics and user insights',
    'Responsive design for all devices',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        About Places & AI
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
        A modern full-stack application for discovering places with AI-powered recommendations
      </Typography>

      {/* Overview */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Project Overview
        </Typography>
        <Typography variant="body1" paragraph>
          Places & AI is a comprehensive application that combines the power of modern web technologies
          with artificial intelligence to help users discover amazing places around them. Built with a
          scalable architecture, it leverages Snowflake for data storage, React for the frontend,
          and Google Gemini AI for intelligent recommendations.
        </Typography>
        <Typography variant="body1" paragraph>
          The application provides an intuitive interface for exploring places, getting personalized
          recommendations, and interacting with an AI assistant that understands your preferences
          and suggests the perfect places to visit.
        </Typography>
      </Box>

      {/* Technologies */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Technologies Used
        </Typography>
        <Grid container spacing={2}>
          {technologies.map((tech, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {tech.icon}
                  </Typography>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {tech.name}
                  </Typography>
                  <Chip
                    label={tech.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Benefits */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Benefits
        </Typography>
        <List>
          {benefits.map((benefit, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Box sx={{ color: 'primary.main' }}>✓</Box>
              </ListItemIcon>
              <ListItemText primary={benefit} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Architecture */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Architecture
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Frontend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  React with TypeScript, Material-UI components, and Leaflet maps
                  for an interactive user experience.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Backend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Node.js/Express or Flask API with secure endpoints,
                  rate limiting, and comprehensive error handling.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database & AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Snowflake data warehouse with Google Gemini AI
                  for intelligent recommendations and analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Getting Started */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          To get started with this application, you'll need to:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Box sx={{ color: 'primary.main' }}>1</Box>
            </ListItemIcon>
            <ListItemText primary="Set up a Snowflake account and configure your database" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Box sx={{ color: 'primary.main' }}>2</Box>
            </ListItemIcon>
            <ListItemText primary="Get a Google Gemini API key for AI functionality" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Box sx={{ color: 'primary.main' }}>3</Box>
            </ListItemIcon>
            <ListItemText primary="Configure environment variables in the .env file" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Box sx={{ color: 'primary.main' }}>4</Box>
            </ListItemIcon>
            <ListItemText primary="Run the database migrations to set up tables" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Box sx={{ color: 'primary.main' }}>5</Box>
            </ListItemIcon>
            <ListItemText primary="Start the application with 'npm run dev'" />
          </ListItem>
        </List>
      </Box>

      {/* Contact */}
      <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Ready to Explore?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start discovering amazing places with AI-powered recommendations
        </Typography>
      </Box>
    </Container>
  );
};

export default About;





