import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Places & AI
        </Typography>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ 
              bgcolor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/places')}
            sx={{ 
              bgcolor: isActive('/places') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Places
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/recommendations')}
            sx={{ 
              bgcolor: isActive('/recommendations') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Recommendations
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/about')}
            sx={{ 
              bgcolor: isActive('/about') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            About
          </Button>
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleNavigation('/')}>Home</MenuItem>
            <MenuItem onClick={() => handleNavigation('/places')}>Places</MenuItem>
            <MenuItem onClick={() => handleNavigation('/recommendations')}>Recommendations</MenuItem>
            <MenuItem onClick={() => handleNavigation('/about')}>About</MenuItem>
          </Menu>
        </Box>

        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;





