'use client';

import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import type React from 'react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccessMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      // Set the session in Supabase client
      if (response.data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          setError('Failed to establish session. Please try again.');
          return;
        }
      }

      setSuccessMessage('Login successful!');
      setTimeout(() => {
        onLoginSuccess(response.data.user);
        resetForm();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/signup', {
        email,
        password,
        name,
      });

      const { requiresVerification, message, user, session } = response.data;

      setSuccessMessage(message);

      // Only auto-login if verification is not required
      if (!requiresVerification && user && session) {
        // Set the session in Supabase client
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          setError('Failed to establish session. Please try again.');
          return;
        }

        setTimeout(() => {
          onLoginSuccess(user);
          resetForm();
          onClose();
        }, 1500);
      } else {
        // If verification is required, switch to login tab after a delay
        setTimeout(() => {
          setTabValue(0);
          setPassword('');
          setName('');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccessMessage('');
    setTabValue(0);
  };

  const handleClose = () => {
    resetForm();
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
            Welcome
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </TabPanel>

        {/* Sign Up Tab */}
        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 2 }}>
            You'll need to verify your email address before you can log in.
          </Alert>
          <Box component="form" onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              autoComplete="name"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Password must be at least 6 characters"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
