'use client';

import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationOnIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import RestaurantCard from '@/components/RestaurantCard';
import { api } from '@/lib/api';

interface Restaurant {
  id: string;
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  cuisine_types?: string[];
  is_open_now?: boolean;
  photos?: string[];
}

interface SearchFilters {
  cuisine?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  openNow?: boolean;
}

export default function RestaurantSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Cuisine options
  const cuisineOptions = [
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Indian',
    'Thai',
    'French',
    'American',
    'Pizza',
    'Sushi',
    'BBQ',
    'Seafood',
    'Vegetarian',
    'Vegan',
    'Fast Food',
    'Cafe',
    'Bar',
  ];

  const handleSearch = async () => {
    if (!location && !coordinates) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      // First, fetch restaurants from Google Places API
      const fetchResponse = await api.post('/api/restaurants/fetch', {
        location,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        keyword: searchQuery || undefined,
      });

      // Then search with filters
      const searchParams = new URLSearchParams();
      if (coordinates) {
        searchParams.append('latitude', coordinates.lat.toString());
        searchParams.append('longitude', coordinates.lng.toString());
      } else {
        searchParams.append('location', location);
      }
      if (filters.cuisine) searchParams.append('cuisine', filters.cuisine);
      if (filters.minPrice) searchParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) searchParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.minRating) searchParams.append('minRating', filters.minRating.toString());
      if (filters.openNow) searchParams.append('openNow', 'true');

      const searchResponse = await api.get(`/api/restaurants/search?${searchParams.toString()}`);
      setRestaurants(searchResponse.data.restaurants || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleFavorite = async (restaurantId: string) => {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite:', restaurantId);
  };

  const handleDirections = (restaurant: Restaurant) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    window.open(url, '_blank');
  };

  const getLocationFromBrowser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocation('Current Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              SkyFinder
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {/* Location Input */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Enter location or use current location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={getLocationFromBrowser}
              sx={{ minWidth: 180 }}
            >
              Use Current Location
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          </Box>

          {/* Active Filters */}
          {(filters.cuisine ||
            filters.minPrice ||
            filters.maxPrice ||
            filters.minRating ||
            filters.openNow) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.cuisine && (
                <Chip
                  label={`Cuisine: ${filters.cuisine}`}
                  onDelete={() => handleFilterChange('cuisine', undefined)}
                  color="primary"
                />
              )}
              {filters.minPrice && (
                <Chip
                  label={`Min Price: $${'$'.repeat(filters.minPrice)}`}
                  onDelete={() => handleFilterChange('minPrice', undefined)}
                  color="primary"
                />
              )}
              {filters.maxPrice && (
                <Chip
                  label={`Max Price: $${'$'.repeat(filters.maxPrice)}`}
                  onDelete={() => handleFilterChange('maxPrice', undefined)}
                  color="primary"
                />
              )}
              {filters.minRating && (
                <Chip
                  label={`Min Rating: ${filters.minRating}+`}
                  onDelete={() => handleFilterChange('minRating', undefined)}
                  color="primary"
                />
              )}
              {filters.openNow && (
                <Chip
                  label="Open Now"
                  onDelete={() => handleFilterChange('openNow', false)}
                  color="primary"
                />
              )}
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
          )}
        </Container>
      </Paper>

      {/* Results */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Finding the best restaurants...
            </Typography>
          </Box>
        )}

        {!loading && restaurants.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
            </Typography>
            <Grid container spacing={3}>
              {restaurants.map((restaurant) => (
                <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                  <RestaurantCard
                    restaurant={restaurant}
                    onFavorite={handleFavorite}
                    onDirections={handleDirections}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {!loading && restaurants.length === 0 && searchQuery && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RestaurantIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No restaurants found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}

        {!loading && restaurants.length === 0 && !searchQuery && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RestaurantIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Find Your Perfect Restaurant
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter a location and search for restaurants near you
            </Typography>
          </Box>
        )}
      </Container>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Cuisine Type
            </Typography>
            <Select
              value={filters.cuisine || ''}
              onChange={(e: SelectChangeEvent) => handleFilterChange('cuisine', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Cuisines</MenuItem>
              {cuisineOptions.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Price Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Select
                value={filters.minPrice || ''}
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)
                }
                displayEmpty
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Min</MenuItem>
                <MenuItem value="1">$</MenuItem>
                <MenuItem value="2">$$</MenuItem>
                <MenuItem value="3">$$$</MenuItem>
                <MenuItem value="4">$$$$</MenuItem>
              </Select>
              <Select
                value={filters.maxPrice || ''}
                onChange={(e: SelectChangeEvent) =>
                  handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)
                }
                displayEmpty
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Max</MenuItem>
                <MenuItem value="1">$</MenuItem>
                <MenuItem value="2">$$</MenuItem>
                <MenuItem value="3">$$$</MenuItem>
                <MenuItem value="4">$$$$</MenuItem>
              </Select>
            </Box>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Minimum Rating
            </Typography>
            <Select
              value={filters.minRating || ''}
              onChange={(e: SelectChangeEvent) =>
                handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              displayEmpty
            >
              <MenuItem value="">Any Rating</MenuItem>
              <MenuItem value="4.5">4.5+ Stars</MenuItem>
              <MenuItem value="4.0">4.0+ Stars</MenuItem>
              <MenuItem value="3.5">3.5+ Stars</MenuItem>
              <MenuItem value="3.0">3.0+ Stars</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Availability
            </Typography>
            <ToggleButtonGroup
              value={filters.openNow ? 'open' : ''}
              exclusive
              onChange={(_, value) => handleFilterChange('openNow', value === 'open')}
              fullWidth
            >
              <ToggleButton value="open">Open Now</ToggleButton>
            </ToggleButtonGroup>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setFilterDrawerOpen(false);
              handleSearch();
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}

