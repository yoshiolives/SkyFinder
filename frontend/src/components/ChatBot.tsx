'use client';

import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  Paper,
  Slide,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  itinerary?: any[];
  onItineraryUpdate?: (itinerary: any) => void;
  currentTrip?: any;
}

const ChatBot: React.FC<ChatBotProps> = ({
  itinerary = [],
  onItineraryUpdate = null,
  currentTrip = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your AI travel assistant. I can help you plan your itinerary, suggest activities, or answer questions about your trip!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll on every message change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response from server-side API endpoint
      const apiResponse = await api.post('/api/chat', {
        message: inputText,
        itinerary: itinerary,
        questionnaireData: {},
        messages: messages,
      });

      const response = apiResponse.data;

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
      };

      setTimeout(async () => {
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);

        // Handle database actions
        if (response.action && response.actionData && currentTrip) {
          try {
            switch (response.action) {
              case 'create_item': {
                // Create new itinerary item via API
                const createResponse = await api.post('/api/itinerary', {
                  trip_id: currentTrip.id,
                  location: response.actionData.location,
                  address: response.actionData.address,
                  activity: response.actionData.activity,
                  type: response.actionData.type,
                  date: response.actionData.date,
                  time: response.actionData.time,
                  duration: response.actionData.duration,
                  rating: response.actionData.rating,
                  coordinates: response.actionData.coordinates,
                });

                // Format the response to match frontend format
                const formattedItem = {
                  id: createResponse.data.item.id,
                  date: createResponse.data.item.date,
                  time: createResponse.data.item.time,
                  location: createResponse.data.item.location,
                  address: createResponse.data.item.address,
                  activity: createResponse.data.item.activity,
                  duration: createResponse.data.item.duration,
                  type: createResponse.data.item.type,
                  rating: createResponse.data.item.rating,
                  coordinates: [
                    createResponse.data.item.latitude,
                    createResponse.data.item.longitude,
                  ],
                };

                // Update local state
                if (onItineraryUpdate) {
                  onItineraryUpdate([...itinerary, formattedItem]);
                }

                setSnackbarMessage('Successfully added to your itinerary!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                break;
              }

              case 'update_item': {
                // Update existing itinerary item via API
                await api.put(`/api/itinerary/${response.actionData.id}`, {
                  location: response.actionData.location,
                  address: response.actionData.address,
                  activity: response.actionData.activity,
                  type: response.actionData.type,
                  date: response.actionData.date,
                  time: response.actionData.time,
                  duration: response.actionData.duration,
                  rating: response.actionData.rating,
                  coordinates: response.actionData.coordinates,
                });

                // Update local state
                if (onItineraryUpdate) {
                  const updatedItinerary = itinerary.map((item) =>
                    item.id === response.actionData.id ? response.actionData : item
                  );
                  onItineraryUpdate(updatedItinerary);
                }

                setSnackbarMessage('Successfully updated your itinerary!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                break;
              }

              case 'delete_item': {
                // Delete itinerary item via API
                await api.delete(`/api/itinerary/${response.actionData.id}`);

                // Update local state
                if (onItineraryUpdate) {
                  const updatedItinerary = itinerary.filter(
                    (item) => item.id !== response.actionData.id
                  );
                  onItineraryUpdate(updatedItinerary);
                }

                setSnackbarMessage('Successfully removed from your itinerary!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                break;
              }
            }
          } catch (apiError: any) {
            console.error('Failed to perform API action:', apiError);
            setSnackbarMessage(
              `Failed to ${response.action.replace('_', ' ')}: ${apiError.message}`
            );
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          }
        }

        // If the response includes bulk itinerary updates, apply them
        if (response.itineraryUpdate && onItineraryUpdate) {
          onItineraryUpdate(response.itineraryUpdate);
        }
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);

      // Handle API errors
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred. Please contact an administrator.';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);

      // Also show error in chat
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please see the notification for details.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {/* Square Chat Toggle Button */}
      <Fab
        color="primary"
        aria-label="open chat"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: isOpen ? 'none' : 'flex',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
          boxShadow: '0 8px 20px rgba(0, 122, 255, 0.3)',
          borderRadius: 12,
          width: 56,
          height: 56,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 128px)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0051D5 0%, #003D99 100%)',
            boxShadow: '0 12px 24px rgba(0, 122, 255, 0.4)',
            transform: 'translateY(-2px) scale(1.05)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.95)',
          },
        }}
      >
        <BotIcon sx={{ fontSize: 24 }} />
      </Fab>

      {/* Sharp Chat Window */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 'auto' },
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            height: { xs: 'calc(100vh - 128px)', sm: 'min(650px, calc(100vh - 128px))' },
            maxHeight: 'calc(100vh - 128px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: 2,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 'calc(100vw - 48px)' },
          }}
        >
          {/* Sharp Chat Header */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '2px 2px 0 0',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 40,
                  height: 40,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <BotIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    letterSpacing: '0',
                  }}
                >
                  AI Assistant
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}
                >
                  Powered by Gemini
                </Typography>
              </Box>
            </Box>
            <IconButton
              color="inherit"
              onClick={() => setIsOpen(false)}
              size="small"
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: { xs: 1.5, sm: 2 },
              minHeight: 0, // Ensures proper scrolling on mobile
            }}
          >
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 2,
                    px: 0,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.sender === 'user' ? '#007AFF' : '#F2F2F7',
                      color: message.sender === 'user' ? 'white' : '#8E8E93',
                      width: 32,
                      height: 32,
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0,
                      fontSize: '0.875rem',
                    }}
                  >
                    {message.sender === 'user' ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <BotIcon fontSize="small" />
                    )}
                  </Avatar>
                  <Box
                    sx={{
                      maxWidth: '80%',
                      backgroundColor:
                        message.sender === 'user'
                          ? 'rgba(0, 122, 255, 0.1)'
                          : 'rgba(242, 242, 247, 0.9)',
                      backdropFilter: message.sender === 'user' ? 'none' : 'blur(10px)',
                      color: message.sender === 'user' ? '#1D1D1F' : '#1D1D1F',
                      borderRadius:
                        message.sender === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                      p: 2,
                      wordBreak: 'break-word',
                      boxShadow:
                        message.sender === 'user'
                          ? '0 2px 8px rgba(0, 122, 255, 0.3)'
                          : '0 2px 8px rgba(0,0,0,0.08)',
                      border:
                        message.sender === 'user'
                          ? '1px solid rgba(0, 122, 255, 0.2)'
                          : '1px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '0.875rem' }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.75rem',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                  <Avatar
                    sx={{ bgcolor: '#F2F2F7', color: '#8E8E93', width: 32, height: 32, mr: 1 }}
                  >
                    <BotIcon fontSize="small" />
                  </Avatar>
                  <Box
                    sx={{
                      backgroundColor: '#F2F2F7',
                      borderRadius: '16px 16px 16px 4px',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: '#8E8E93' }} />
                    <Typography variant="body2" sx={{ color: '#8E8E93', fontSize: '0.875rem' }}>
                      AI is typing...
                    </Typography>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />

          {/* Sharp Input Area */}
          <Box
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: '0 0 2px 2px',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                placeholder="Ask me about your trip..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                multiline
                maxRows={3}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.2s ease',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 0 0 2px rgba(0, 122, 255, 0.2)',
                    },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                sx={{
                  backgroundColor:
                    inputText.trim() && !isLoading
                      ? 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)'
                      : '#C7C7CC',
                  color: 'white',
                  borderRadius: 2,
                  width: 40,
                  height: 40,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow:
                    inputText.trim() && !isLoading ? '0 2px 8px rgba(0, 122, 255, 0.3)' : 'none',
                  '&:hover': {
                    backgroundColor:
                      inputText.trim() && !isLoading
                        ? 'linear-gradient(135deg, #0051D5 0%, #003D99 100%)'
                        : '#C7C7CC',
                    transform: 'scale(1.05)',
                    boxShadow:
                      inputText.trim() && !isLoading ? '0 4px 12px rgba(0, 122, 255, 0.4)' : 'none',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  '&:disabled': {
                    backgroundColor: '#C7C7CC',
                    color: 'white',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChatBot;
