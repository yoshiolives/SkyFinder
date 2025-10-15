'use client';

import {
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Directions as DirectionsIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Web as WebIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

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

interface RestaurantCardProps {
  restaurant: Restaurant;
  onFavorite?: (restaurantId: string) => void;
  onDirections?: (restaurant: Restaurant) => void;
  isFavorite?: boolean;
}

export default function RestaurantCard({
  restaurant,
  onFavorite,
  onDirections,
  isFavorite = false,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get price level display
  const getPriceDisplay = (level?: number) => {
    if (!level) return 'Price not available';
    return '$'.repeat(level);
  };

  // Get rating display
  const getRatingDisplay = (rating?: number, total?: number) => {
    if (!rating) return 'No ratings';
    return `${rating.toFixed(1)} (${total || 0} reviews)`;
  };

  // Get Google Maps photo URL
  const getPhotoUrl = (photoReference?: string) => {
    if (!photoReference) return null;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };

  const photoUrl = restaurant.photos?.[0]
    ? getPhotoUrl(restaurant.photos[0])
    : null;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {/* Restaurant Image */}
      {photoUrl && !imageError && (
        <Box
          sx={{
            width: '100%',
            height: 200,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={photoUrl}
            alt={restaurant.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setImageError(true)}
          />
          {/* Open Now Badge */}
          {restaurant.is_open_now && (
            <Chip
              label="Open Now"
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Restaurant Name */}
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
          {restaurant.name}
        </Typography>

        {/* Rating and Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {restaurant.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {restaurant.rating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({restaurant.user_ratings_total || 0})
              </Typography>
            </Box>
          )}
          {restaurant.price_level && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                ml: 'auto',
              }}
            >
              {getPriceDisplay(restaurant.price_level)}
            </Typography>
          )}
        </Box>

        {/* Cuisine Types */}
        {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
            {restaurant.cuisine_types.slice(0, 3).map((cuisine, index) => (
              <Chip
                key={index}
                label={cuisine}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        )}

        {/* Address */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {restaurant.address}
        </Typography>

        {/* Contact Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {restaurant.phone && (
            <Typography variant="body2" color="text.secondary">
              <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {restaurant.phone}
            </Typography>
          )}
          {restaurant.website && (
            <Typography
              variant="body2"
              component="a"
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <WebIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Visit Website
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Tooltip title="Get Directions">
          <IconButton
            color="primary"
            size="small"
            onClick={() => onDirections?.(restaurant)}
          >
            <DirectionsIcon />
          </IconButton>
        </Tooltip>

        {onFavorite && (
          <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton
              color={isFavorite ? 'error' : 'default'}
              size="small"
              onClick={() => onFavorite(restaurant.id)}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}

