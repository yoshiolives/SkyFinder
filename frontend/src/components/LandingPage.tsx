'use client';

import {
  AutoAwesome as AutoAwesomeIcon,
  Explore as ExploreIcon,
  Group as GroupIcon,
  SentimentSatisfiedAlt as HappyIcon,
  Login as LoginIcon,
  Map as MapIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const theme = useTheme();
  const [tripsPerYear, setTripsPerYear] = useState(3);

  // Assumptions: Average 8 hours planning per trip
  const hoursPerTrip = 8;
  const timeYears = 5; // Calculate over 5 years for bigger impact

  // Calculations
  const totalTrips = tripsPerYear * timeYears;
  const totalHoursWithoutAI = totalTrips * hoursPerTrip;
  const hoursSaved = Math.round(totalHoursWithoutAI * 0.75); // Save 75% of time
  const moneySaved = Math.round(hoursSaved * 35); // $35/hour value
  const vacationDays = Math.floor(hoursSaved / 8); // 8-hour workdays
  const stressReduction = 85; // Fixed high percentage for impact

  return (
    <Box>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'rgba(25, 118, 210, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 0,
          '&.MuiAppBar-root': {
            borderRadius: 0,
          },
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Image
              src="/logo.png"
              alt="SkyFinder Logo"
              width={40}
              height={40}
              style={{ borderRadius: '8px' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SkyFinder
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={onGetStarted}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Sign In
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 12 }, pb: { xs: 4, md: 8 } }}>
          <Box
            sx={{
              textAlign: 'center',
              color: 'white',
              mb: { xs: 4, md: 8 },
            }}
          >
            {/* Mobile: Banner above text */}
            <Box
              sx={{
                mb: { xs: 4, md: 0 },
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                src="/banner.png"
                alt="SkyFinder Hero Banner"
                width={800}
                height={400}
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  maxWidth: '100%',
                  height: 'auto',
                }}
                priority
              />
            </Box>

            {/* Desktop: Side-by-side layout */}
            <Box
              sx={{
                display: { xs: 'block', md: 'flex' },
                alignItems: 'center',
                gap: { md: 6 },
                justifyContent: 'center',
                mb: { xs: 0, md: 2 },
              }}
            >
              {/* Desktop: Banner on the left */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Image
                  src="/banner.png"
                  alt="SkyFinder Hero Banner"
                  width={500}
                  height={300}
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  priority
                />
              </Box>

              {/* Text content */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  Discover Your Next Great Meal
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    fontWeight: 300,
                    opacity: 0.95,
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.5rem' },
                    display: { xs: 'none', md: 'block' }, // Hide on mobile, show on desktop
                  }}
                >
                  Find the perfect restaurant for any occasion. Search by cuisine, price, and more.
                </Typography>
              </Box>
            </Box>

            {/* Mobile subheading - positioned below banner on mobile only */}
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 300,
                opacity: 0.95,
                maxWidth: '100%',
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                textAlign: 'center',
                display: { xs: 'block', md: 'none' },
              }}
            >
              Find the perfect restaurant for any occasion. Search by cuisine, price, and more.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={onGetStarted}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Find Restaurants
              </Button>
            </Box>
          </Box>

          {/* Value Proposition Cards */}
          <Grid container spacing={3} sx={{ mb: { xs: 4, md: 8 } }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <ScheduleIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Find Restaurants Fast
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Search thousands of restaurants in seconds. Filter by cuisine, price, rating, and more.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <HappyIcon sx={{ fontSize: 60, color: theme.palette.secondary.main, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Perfect Match Every Time
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Get personalized recommendations based on your preferences. No more decision paralysis.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <GroupIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Real Reviews & Ratings
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  See ratings and reviews from real customers. Make informed decisions about where to dine.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
              Everything You Need, Nothing You Don't
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: { xs: 4, md: 8 }, fontWeight: 300 }}
            >
              Simple tools that actually make travel planning enjoyable
            </Typography>

            <Grid container spacing={{ xs: 3, md: 6 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <AutoAwesomeIcon
                    sx={{ fontSize: 40, color: theme.palette.primary.main, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      AI Travel Assistant
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Just tell us what you want. "Plan a romantic weekend in Paris" or "Family trip
                      to Tokyo with kids." Our AI understands and creates the perfect itinerary.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <MapIcon
                    sx={{ fontSize: 40, color: theme.palette.secondary.main, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Visual Journey Mapping
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      See your entire trip on an interactive map. Know exactly where you're going,
                      how far things are, and what's nearby. No surprises.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <ExploreIcon
                    sx={{ fontSize: 40, color: theme.palette.success.main, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Smart Recommendations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Get personalized suggestions based on your interests, budget, and travel
                      style. Discover hidden gems you'd never find on your own.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <GroupIcon
                    sx={{ fontSize: 40, color: theme.palette.warning.main, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Collaborate & Share
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Plan together with your travel buddies. Share your itinerary, get input, and
                      make sure everyone's excited about the trip.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Social Proof / Testimonial Section */}
        <Box
          sx={{
            py: { xs: 6, md: 10 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={6}
              sx={{
                p: 6,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                See What You Could Save in 5 Years
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center', fontSize: '1.1rem' }}
              >
                How many trips do you plan per year?
              </Typography>

              {/* Trip Counter */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setTripsPerYear(Math.max(1, tripsPerYear - 1))}
                    sx={{
                      minWidth: '50px',
                      height: '50px',
                      fontSize: '1.5rem',
                      borderRadius: '50%',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                      },
                    }}
                  >
                    −
                  </Button>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                      minWidth: '100px',
                      textAlign: 'center',
                    }}
                  >
                    {tripsPerYear}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setTripsPerYear(Math.min(10, tripsPerYear + 1))}
                    sx={{
                      minWidth: '50px',
                      height: '50px',
                      fontSize: '1.5rem',
                      borderRadius: '50%',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                      },
                    }}
                  >
                    +
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  trips per year
                </Typography>
              </Box>

              {/* Big Impact Numbers */}
              <Box
                sx={{
                  bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  p: 4,
                  borderRadius: 3,
                  color: 'white',
                  mb: 4,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '3rem', md: '4rem' } }}
                >
                  {hoursSaved.toLocaleString()}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 300, mb: 3 }}>
                  Hours Back in Your Life
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9 }}>
                  That's {vacationDays} full vacation days to actually travel!
                </Typography>
              </Box>

              {/* Additional Metrics with Progress Bars */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Money Saved
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: theme.palette.success.main }}
                      >
                        ${moneySaved.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 12,
                        bgcolor: 'rgba(76, 175, 80, 0.2)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          bgcolor: theme.palette.success.main,
                          width: '100%',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Based on $35/hour value of your time
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Stress Reduction
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
                      >
                        {stressReduction}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 12,
                        bgcolor: 'rgba(156, 39, 176, 0.2)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          bgcolor: theme.palette.secondary.main,
                          width: `${stressReduction}%`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      No more planning anxiety or overwhelm
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 3, textAlign: 'center', fontStyle: 'italic' }}
              >
                * Based on {totalTrips} trips over {timeYears} years, averaging {hoursPerTrip} hours
                planning per trip. Assumes 75% time savings with AI-powered planning. Value
                calculated at $35/hour. Individual results may vary.
              </Typography>
            </Paper>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Your Next Adventure Awaits
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 300, lineHeight: 1.7 }}
            >
              Stop spending hours planning and start making memories. It's free to get started.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onGetStarted}
              sx={{
                bgcolor: theme.palette.primary.main,
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Planning for Free
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No credit card required. Start planning in under 60 seconds.
            </Typography>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: 'rgba(0,0,0,0.9)',
            color: 'white',
            py: 4,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
              © 2025 SkyFinder. Travel smarter, not harder.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
