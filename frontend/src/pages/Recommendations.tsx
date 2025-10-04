import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
  TextField,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Star, LocationOn, AttachMoney, Chat, Refresh } from '@mui/icons-material';
import { useAI } from '../context/AIContext';
import { usePlaces } from '../context/PlacesContext';

const Recommendations: React.FC = () => {
  const { state: aiState, getSuggestions, sendMessage, clearChat } = useAI();
  const { state: placesState } = usePlaces();
  const [userPreferences, setUserPreferences] = useState({
    categories: ['restaurant', 'attraction'],
    priceRange: [1, 3],
    ratingThreshold: 4.0,
    maxDistance: 10,
  });
  const [chatMessage, setChatMessage] = useState('');
  const [viewMode, setViewMode] = useState<'suggestions' | 'chat'>('suggestions');

  const handleGetSuggestions = async () => {
    await getSuggestions(userPreferences);
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      await sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getPriceLevel = (level: number) => {
    return '$'.repeat(level);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        AI Recommendations
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Get personalized place recommendations powered by AI
      </Typography>

      {/* View Mode Toggle */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(event, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="suggestions" aria-label="suggestions">
            <Star sx={{ mr: 1 }} />
            Suggestions
          </ToggleButton>
          <ToggleButton value="chat" aria-label="chat">
            <Chat sx={{ mr: 1 }} />
            Chat with AI
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'suggestions' ? (
        <Box>
          {/* Preferences */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Categories (comma-separated)"
                    value={userPreferences.categories.join(', ')}
                    onChange={(e) => setUserPreferences({
                      ...userPreferences,
                      categories: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                    })}
                    helperText="e.g., restaurant, attraction, hotel"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Price Level"
                    type="number"
                    value={userPreferences.priceRange[0]}
                    onChange={(e) => setUserPreferences({
                      ...userPreferences,
                      priceRange: [parseInt(e.target.value), userPreferences.priceRange[1]]
                    })}
                    inputProps={{ min: 1, max: 4 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Max Price Level"
                    type="number"
                    value={userPreferences.priceRange[1]}
                    onChange={(e) => setUserPreferences({
                      ...userPreferences,
                      priceRange: [userPreferences.priceRange[0], parseInt(e.target.value)]
                    })}
                    inputProps={{ min: 1, max: 4 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Min Rating"
                    type="number"
                    value={userPreferences.ratingThreshold}
                    onChange={(e) => setUserPreferences({
                      ...userPreferences,
                      ratingThreshold: parseFloat(e.target.value)
                    })}
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Distance (km)"
                    type="number"
                    value={userPreferences.maxDistance}
                    onChange={(e) => setUserPreferences({
                      ...userPreferences,
                      maxDistance: parseInt(e.target.value)
                    })}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGetSuggestions}
                  disabled={aiState.loading}
                  startIcon={aiState.loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {aiState.loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {aiState.loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                AI is analyzing your preferences...
              </Typography>
            </Box>
          )}

          {aiState.error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {aiState.error}
            </Alert>
          )}

          {aiState.suggestions.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Personalized Recommendations
              </Typography>
              <Grid container spacing={3}>
                {aiState.suggestions.map((suggestion, index) => {
                  const place = placesState.places.find(p => p.id === suggestion.placeId);
                  if (!place) return null;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {place.photos && place.photos.length > 0 && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={place.photos[0]}
                            alt={place.name}
                          />
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {place.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {suggestion.reason}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Star fontSize="small" />
                            <Typography variant="body2">
                              {place.rating.toFixed(1)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AttachMoney fontSize="small" />
                            <Typography variant="body2">
                              {getPriceLevel(place.priceLevel)}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${(suggestion.confidence * 100).toFixed(0)}% match`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </CardContent>
                        <CardActions>
                          <Button size="small">View Details</Button>
                          <Button size="small" color="primary">
                            Get Directions
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          {/* Chat Interface */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chat with AI Assistant
              </Typography>
              <Box sx={{ height: 400, overflow: 'auto', mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                {aiState.chatHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Start a conversation with our AI assistant to get personalized recommendations!
                  </Typography>
                ) : (
                  aiState.chatHistory.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: message.role === 'user' ? 'primary.main' : 'grey.200',
                        color: message.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: 1,
                        ml: message.role === 'assistant' ? 0 : 'auto',
                        mr: message.role === 'user' ? 0 : 'auto',
                        maxWidth: '80%',
                      }}
                    >
                      <Typography variant="body2">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))
                )}
                {aiState.loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">AI is thinking...</Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Ask about places, get recommendations..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={aiState.loading}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || aiState.loading}
                >
                  Send
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearChat}
                  disabled={aiState.chatHistory.length === 0}
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Recommendations;





