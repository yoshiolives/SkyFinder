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

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const theme = useTheme();

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
            <Box
              component="img"
              src="/logo-transparent.png"
              alt="SkyFinder Logo"
              sx={{
                width: 40,
                height: 40,
                objectFit: 'contain',
              }}
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
            {/* SkyFinder Banner Section - positioned where logo was */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: { xs: 350, md: 500 },
                  height: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src="/banner.png"
                  alt="SkyFinder Banner - Discover places near transit stations"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            </Box>

            {/* Text content */}
            <Box sx={{ textAlign: 'center', mb: { xs: 0, md: 2 } }}>
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
                Discover Places Near Transit
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
                Find restaurants and places within 800m of any rapid transit station. Discover hidden gems you never knew existed.
              </Typography>
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
              Find restaurants and places within 800m of any rapid transit station. Discover hidden gems you never knew existed.
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
                Explore Places
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
                  Near Transit Stations
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Discover restaurants and places within walking distance of any rapid transit station. No more wandering around aimlessly.
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
                  Save Your Favorites
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Create custom lists to organize your favorite places. Never forget that amazing restaurant you discovered.
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
                  Discover Hidden Gems
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Find local favorites and hidden spots you never knew existed near your transit stops.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h3" align="center" sx={{ fontWeight: 700, mb: 2 }}>
              Everything You Need to Discover Places
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: { xs: 4, md: 8 }, fontWeight: 300 }}
            >
              Simple tools that help you find amazing places near transit stations
            </Typography>

            <Grid container spacing={{ xs: 3, md: 6 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <AutoAwesomeIcon
                    sx={{ fontSize: 40, color: theme.palette.primary.main, flexShrink: 0 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Transit Station Integration
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Select any rapid transit station and instantly see all restaurants and places within an 800-meter radius. No more guessing what's nearby.
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
                      Interactive Maps
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      See all nearby places on an interactive map. Know exactly how far each restaurant is from the station and plan your route accordingly.
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
                      Radius-Based Search
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Find places within a specific distance from any transit station. Perfect for quick meals during your commute or exploring new neighborhoods.
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
                      Save & Organize
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Create custom lists to save your favorite places. Organize by cuisine, occasion, or station for easy reference later.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>


        {/* CTA Section */}
        <Box sx={{ bgcolor: 'white', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              Start Discovering Today
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 300, lineHeight: 1.7 }}
            >
              Stop wandering around transit stations looking for places. Discover amazing restaurants and spots near every stop.
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
              Start Discovering for Free
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No credit card required. Start discovering places in under 60 seconds.
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
              © 2025 SkyFinder. Discover smarter, not harder.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
