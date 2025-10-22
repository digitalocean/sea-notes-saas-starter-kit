'use client';

// React and MUI imports
import React, { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession, signOut } from 'next-auth/react';
import ServiceWarningIndicator from 'components/Common/ServiceWarningIndicator/ServiceWarningIndicator';
import { usePathname } from 'next/navigation';
import { AnimatedThemeToggle } from 'components/Theme/AnimatedThemeToggle';

/**
 * Main navigation bar of the application
 * Dynamically changes links according to the session state (log in / log out)
 * 
 * This navbar shows different links depending on whether the user is logged in
 * It also shows a service warning indicator when there are system issues
 * On mobile, it uses a drawer for navigation links
 */
export default function NavBar() {
  // Get session information
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the system status page
  const isSystemStatusPage = pathname === '/system-status';

  /**
   * Toggle the mobile drawer open/closed
   */
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  // Define navigation links based on session state
  const navLinks = session
    ? [
        { href: '/pricing', label: 'Pricing' },
        { href: '#', label: 'Sign out', onClick: handleLogout },
      ]
    : [
        { href: '/pricing', label: 'Pricing' },
        { href: '/login', label: 'Log in' },
        { href: '/signup', label: 'Sign up' },
      ];
      
  // Define the mobile drawer content
  const drawer = (
    <Box
      sx={{
        width: 240,
        py: 2,
        px: 1,
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <List disablePadding>
        {/* Show service warning indicator except on system status page */}
        {!isSystemStatusPage ? <ServiceWarningIndicator /> : null}

        {/* Render navigation links */}
        {navLinks.map(({ href, label, onClick }) => (
          <ListItem
            key={label}
            disablePadding
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <ListItemButton component={Link} href={href} onClick={onClick}>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  // Render the navbar
  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* App logo/name */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography
              variant="h5"
              color="primary.main"
              fontWeight={700}
              sx={{ cursor: 'pointer' }}
            >
              🐳 SeaNotes
            </Typography>
          </Link>

          {/* Mobile view - show hamburger menu */}
          {isMobile ? (
            <IconButton edge="end" color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop view - show navigation links
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Show service warning indicator except on system status page */}
              {!isSystemStatusPage ? <ServiceWarningIndicator /> : null}
              
              {/* Render navigation links */}
              {navLinks.map(({ href, label, onClick }) => (
                <Button
                  key={label}
                  component={Link}
                  href={href}
                  prefetch={true}
                  onClick={onClick}
                  variant="text"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: 14,
                    ml: 2,
                  }}
                >
                  {label}
                </Button>
              ))}
              
              {/* Animated theme toggle positioned in the navbar */}
              <AnimatedThemeToggle 
                position="relative"
                top="auto"
                right="auto"
                marginTop={0}
                marginRight={0}
              />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer for navigation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}