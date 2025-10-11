'use client';

import React, { useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Person,
  Receipt,
  Settings,
  CreditCard,
  Logout,
  Assessment,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { USER_ROLES } from 'lib/auth/roles';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink = ({ href, icon, children, onClick }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        prefetch={true}
        href={href}
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 1,
          py: 1,
          px: 1.5,
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
        <ListItemText primary={children} sx={{ fontSize: 14, fontWeight: 500 }} />
      </ListItemButton>
    </ListItem>
  );
};

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '3.5rem',
  padding: theme.spacing(0, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { data: session } = useSession();

  const getProfileIcon = useCallback(() => {
    const url = session?.user?.image ?? undefined;
    return <Avatar src={url} alt="User Avatar" />;
  }, [session]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    onNavigate?.();
  };

  return (
    <>
      <SidebarHeader justifyContent="space-between">
        <Typography variant="h5" fontWeight={600}>
          RPaaS
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{getProfileIcon()}</Box>
      </SidebarHeader>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          <SidebarLink href="/dashboard" icon={<Person fontSize="small" />} onClick={onNavigate}>
            Dashboard
          </SidebarLink>
          <SidebarLink
            href="/dashboard/my-environments"
            icon={<Receipt fontSize="small" />}
            onClick={onNavigate}
          >
            My Environments
          </SidebarLink>
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {session?.user?.role === USER_ROLES.ADMIN && (
            <SidebarLink
              href="/admin/dashboard"
              icon={<Assessment fontSize="small" />}
              onClick={onNavigate}
            >
              Admin Dashboard
            </SidebarLink>
          )}
          <SidebarLink
            href="/dashboard/account"
            icon={<Settings fontSize="small" />}
            onClick={onNavigate}
          >
            Account Settings
          </SidebarLink>
          <SidebarLink
            href="/dashboard/subscription"
            icon={<CreditCard fontSize="small" />}
            onClick={onNavigate}
          >
            Billing
          </SidebarLink>
          <SidebarLink href="#" icon={<Logout fontSize="small" />} onClick={handleLogout}>
            Logout
          </SidebarLink>
        </List>
      </Box>
    </>
  );
};

/**
 * Sidebar component that renders the navigation drawer for the application.
 */
const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  if (isMobile) {
    return (
      <>
        {!mobileOpen && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1300 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 256,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          <SidebarContent onNavigate={handleDrawerToggle} />
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 256,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 256,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
};

export default Sidebar;
