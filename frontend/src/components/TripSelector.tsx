'use client';

import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getRandomMessage } from '@/lib/loadingMessages';

interface TripSelectorProps {
  open: boolean;
  onClose: () => void;
  trips: any[];
  currentTrip: any;
  onTripSelect: (trip: any) => void;
  onTripCreated: (newTrip?: any) => void;
}

export default function TripSelector({
  open,
  onClose,
  trips,
  currentTrip,
  onTripSelect,
  onTripCreated,
}: TripSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoGenerateItinerary, setAutoGenerateItinerary] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [messageQueue, setMessageQueue] = useState<Array<{ id: number; text: string }>>([]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use different endpoint based on autoGenerate flag
      const endpoint = autoGenerateItinerary ? '/api/trips/generate' : '/api/trips';
      
      const response = await api.post(endpoint, {
        title,
        description,
        destination,
        start_date: startDate,
        end_date: endDate,
        autoGenerate: autoGenerateItinerary,
      });

      // Log success message if AI generated itinerary
      if (response.data.message) {
        console.log('✅', response.data.message);
      }
      if (response.data.warning) {
        console.warn('⚠️', response.data.warning);
      }

      // Get the created trip from response
      const newTrip = response.data.trip;

      // Reset form
      setTitle('');
      setDescription('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setAutoGenerateItinerary(true);
      setShowCreateForm(false);

      // Notify parent to refresh trips and pass the new trip
      onTripCreated(newTrip);

      // Close the modal after successful creation
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip: any) => {
    onTripSelect(trip);
    onClose();
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setError('');
    setAutoGenerateItinerary(true);
    onClose();
  };

  const handleDeleteClick = (trip: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent trip selection
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    
    setDeleting(true);
    setError('');

    try {
      await api.delete(`/api/trips/${tripToDelete.id}`);
      
      // Close delete dialog
      setDeleteDialogOpen(false);
      setTripToDelete(null);
      
      // Notify parent to refresh trips
      onTripCreated(); // This refreshes the trip list
      
      console.log('✅ Trip deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete trip. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTripToDelete(null);
  };

  // Handle destination autocomplete using Google Places
  const handleDestinationChange = (value: string) => {
    setDestination(value);

    if (value.length > 2) {
      // Popular destinations as fallback
      const popularDestinations = [
        'New York City, NY, USA',
        'Los Angeles, CA, USA',
        'Paris, France',
        'London, United Kingdom',
        'Tokyo, Japan',
        'Seoul, South Korea',
        'Barcelona, Spain',
        'Rome, Italy',
        'Dubai, UAE',
        'Singapore',
        'Sydney, Australia',
        'Bangkok, Thailand',
      ];

      const filtered = popularDestinations.filter((dest) =>
        dest.toLowerCase().includes(value.toLowerCase())
      );

      setDestinationSuggestions(
        filtered.map((dest) => ({
          label: dest,
          value: dest,
        }))
      );

      // Try Google Places API if available
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        try {
          const service = new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            {
              input: value,
              types: ['(cities)'], // Only show cities
            },
            (predictions, status) => {
              if (
                window.google?.maps?.places &&
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                const googleSuggestions = predictions.map((prediction) => ({
                  label: prediction.description,
                  value: prediction.description,
                  placeId: prediction.place_id,
                }));
                setDestinationSuggestions(googleSuggestions);
              }
            }
          );
        } catch (error) {
          console.error('Google Places API error:', error);
        }
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  // Message queue effect during loading
  useEffect(() => {
    if (loading && autoGenerateItinerary && showCreateForm) {
      // Add new message every 2 seconds
      const messageInterval = setInterval(() => {
        const newMessage = {
          id: Date.now(),
          text: getRandomMessage(),
        };
        
        setMessageQueue(prev => [...prev, newMessage]);
        
        // Remove message after 8 seconds (show 3-4 messages at a time)
        setTimeout(() => {
          setMessageQueue(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 8000);
      }, 2000);

      return () => {
        clearInterval(messageInterval);
        setMessageQueue([]);
      };
    }
  }, [loading, autoGenerateItinerary, showCreateForm]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {showCreateForm ? 'Create New Trip' : 'My Trips'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#555',
            },
          },
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!showCreateForm ? (
          <>
            {trips.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  You don't have any trips yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first trip to start planning!
                </Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0 }}>
                {trips.map((trip, _index) => (
                  <React.Fragment key={trip.id}>
                    <ListItemButton
                      selected={currentTrip?.id === trip.id}
                      onClick={() => handleTripSelect(trip)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {trip.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  currentTrip?.id === trip.id
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'text.secondary',
                              }}
                            >
                              📍 {trip.destination}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  currentTrip?.id === trip.id
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'text.secondary',
                              }}
                            >
                              📅 {new Date(trip.start_date).toLocaleDateString()} -{' '}
                              {new Date(trip.end_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleDeleteClick(trip, e)}
                        sx={{
                          color: currentTrip?.id === trip.id ? 'rgba(255,255,255,0.8)' : 'error.main',
                          '&:hover': {
                            color: 'error.dark',
                            backgroundColor: currentTrip?.id === trip.id 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'error.light',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
            )}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              onClick={() => setShowCreateForm(true)}
              sx={{ mt: 2 }}
            >
              Create New Trip
            </Button>
          </>
        ) : (
          <Box component="form" onSubmit={handleCreateTrip}>
            <TextField
              fullWidth
              label="Trip Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              placeholder="e.g., Summer Vacation 2024"
              variant="outlined"
            />
            <Autocomplete
              freeSolo
              options={destinationSuggestions}
              value={destination}
              onInputChange={(event, newValue) => handleDestinationChange(newValue)}
              onChange={(event, selectedOption) => {
                if (typeof selectedOption === 'string') {
                  setDestination(selectedOption);
                } else if (selectedOption) {
                  setDestination(selectedOption.value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  margin="normal"
                  required
                  placeholder="e.g., Paris, France"
                  variant="outlined"
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
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              placeholder="Brief description of your trip..."
              variant="outlined"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoGenerateItinerary}
                  onChange={(e) => setAutoGenerateItinerary(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Ask AI to automatically generate an itinerary
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Our AI will create a personalized itinerary based on your trip details
                  </Typography>
                </Box>
              }
              sx={{ mt: 2, mb: 1, alignItems: 'flex-start' }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                onClick={() => setShowCreateForm(false)}
                fullWidth
                variant="outlined"
                size="large"
              >
                Cancel
              </Button>
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}>
                {loading 
                  ? (autoGenerateItinerary ? 'Creating & Generating...' : 'Creating...') 
                  : 'Create Trip'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Loading Backdrop with Animation */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.modal + 1,
          position: 'absolute',
          borderRadius: 2,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        open={loading && autoGenerateItinerary && showCreateForm}
      >
        {/* Main content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            p: 4,
            maxWidth: '500px',
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: '#007AFF' }} />
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Creating Your Trip
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              AI is generating a personalized itinerary for {destination}...
            </Typography>
            
            {/* Stacked messages that fade out - newest at bottom */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: 0.5,
                minHeight: '120px',
                mb: 2,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {messageQueue.map((msg, index) => (
                <Typography
                  key={msg.id}
                  variant="body2"
                  sx={{
                    color: '#FFD700',
                    fontSize: '0.875rem',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    animation: 'slide-up-fade 8s ease-out forwards',
                    '@keyframes slide-up-fade': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(10px)',
                      },
                      '5%': {
                        opacity: 0.9,
                        transform: 'translateY(0)',
                      },
                      '85%': {
                        opacity: 0.8,
                        transform: 'translateY(0)',
                      },
                      '100%': {
                        opacity: 0,
                        transform: 'translateY(-5px)',
                      },
                    },
                  }}
                >
                  {msg.text}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LinearProgress
                sx={{
                  width: 250,
                  borderRadius: 1,
                  height: 6,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#007AFF',
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
              This may take up to 90 seconds
            </Typography>
          </Box>
        </Box>
      </Backdrop>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Trip?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{tripToDelete?.title}"? This will permanently delete
            the trip and all its itinerary items. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            autoFocus
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
