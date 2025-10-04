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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, LocationOn, Star, AttachMoney } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { usePlaces } from '../context/PlacesContext';
import { Place } from '../types';

const Places: React.FC = () => {
  const { state, fetchPlaces, selectPlace } = usePlaces();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const categories = [
    'restaurant',
    'attraction',
    'hotel',
    'shopping',
    'entertainment',
    'nature',
    'culture',
    'sports',
  ];

  const filteredPlaces = state.places.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || place.category === selectedCategory;
    const matchesPrice = !priceFilter || place.priceLevel === parseInt(priceFilter);
    const matchesRating = place.rating >= ratingFilter;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  const getPriceLevel = (level: number) => {
    return '$'.repeat(level);
  };

  if (state.loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading places...
        </Typography>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {state.error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Discover Places
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Explore amazing places around you
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Price</InputLabel>
              <Select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                label="Price"
              >
                <MenuItem value="">Any Price</MenuItem>
                <MenuItem value="1">$</MenuItem>
                <MenuItem value="2">$$</MenuItem>
                <MenuItem value="3">$$$</MenuItem>
                <MenuItem value="4">$$$$</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Min Rating:</Typography>
              <Rating
                value={ratingFilter}
                onChange={(event, newValue) => setRatingFilter(newValue || 0)}
                precision={0.5}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Results */}
      <Grid container spacing={3}>
        {filteredPlaces.map((place) => (
          <Grid item xs={12} sm={6} md={4} key={place.id}>
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
                  {place.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={place.rating} readOnly size="small" />
                  <Typography variant="body2">
                    {place.rating.toFixed(1)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoney fontSize="small" />
                  <Typography variant="body2">
                    {getPriceLevel(place.priceLevel)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {place.address}
                  </Typography>
                </Box>
                <Chip
                  label={place.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => selectPlace(place)}
                >
                  View Details
                </Button>
                <Button size="small" color="primary">
                  Get Directions
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlaces.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No places found matching your criteria
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setPriceFilter('');
              setRatingFilter(0);
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Places;





