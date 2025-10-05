'use client';

import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { api } from '@/lib/api';

interface TripSelectorProps {
  open: boolean;
  onClose: () => void;
  trips: any[];
  currentTrip: any;
  onTripSelect: (trip: any) => void;
  onTripCreated: () => void;
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

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/trips', {
        title,
        description,
        destination,
        start_date: startDate,
        end_date: endDate,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setShowCreateForm(false);

      // Notify parent to refresh trips
      onTripCreated();
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
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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

      <DialogContent>
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
            <TextField
              fullWidth
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              margin="normal"
              required
              placeholder="e.g., Paris, France"
              variant="outlined"
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
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
