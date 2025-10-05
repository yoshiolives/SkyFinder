'use client';

import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  Paper,
  Slide,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getGeminiResponse } from '../services/geminiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  itinerary?: any[];
  onItineraryUpdate?: (itinerary: any) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ itinerary = [], onItineraryUpdate = null }) => {
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
      // Get AI response from Gemini service with itinerary context
      const response = await getGeminiResponse(inputText, itinerary);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);

        // If the response includes itinerary updates, apply them
        if (response.itineraryUpdate && onItineraryUpdate) {
          onItineraryUpdate(response.itineraryUpdate);
        }
      }, 1000);
    } catch (_error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Icon */}
      <Fab
        color="secondary"
        aria-label="open chat"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: isOpen ? 'none' : 'flex',
          zIndex: 1000,
        }}
      >
        <BotIcon />
      </Fab>

      {/* Chat Window */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#1976d2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" component="div">AI Assistant</Typography>
                <Typography variant="caption" component="div" sx={{ opacity: 0.8 }}>
                  Powered by Gemini
                </Typography>
              </Box>
            </Box>
            <IconButton color="inherit" onClick={() => setIsOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.sender === 'user' ? '#1976d2' : '#4caf50',
                      width: 32,
                      height: 32,
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0,
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Box
                    sx={{
                      maxWidth: '80%',
                      backgroundColor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                      color: message.sender === 'user' ? 'white' : 'black',
                      borderRadius: 2,
                      p: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem',
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
                <ListItem sx={{ justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    AI is typing...
                  </Typography>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me about your trip..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                size="small"
                multiline
                maxRows={3}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatBot;
