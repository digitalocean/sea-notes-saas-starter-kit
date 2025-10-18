'use client';

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
 * Main navigation bar of the application.
 * Dynamically changes links according to the session state (log in / log out).
 */
const NavBar = () => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isSystemStatusPage = pathname === '/system-status';

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

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
        {!isSystemStatusPage ? <ServiceWarningIndicator /> : null}

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

          {isMobile ? (
            <IconButton edge="end" color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isSystemStatusPage ? <ServiceWarningIndicator /> : null}
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
};

export default NavBar;