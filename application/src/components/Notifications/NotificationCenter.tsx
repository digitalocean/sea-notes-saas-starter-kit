'use client';

import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications,
  Info,
  CheckCircle,
  Warning,
  Error,
  Close,
} from '@mui/icons-material';
import { notificationService, Notification } from '../../services/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        borderLeft: 4,
        borderColor: `${getColor()}.main`,
        mb: 1,
        borderRadius: 1,
      }}
    >
      <ListItemIcon>
        {getIcon()}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
              {notification.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="textSecondary">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </Typography>
              <IconButton size="small" onClick={() => onRemove(notification.id)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {notification.message}
            </Typography>
            {notification.actionUrl && (
              <Button
                size="small"
                variant="text"
                sx={{ mt: 1, p: 0 }}
                onClick={() => window.open(notification.actionUrl, '_blank')}
              >
                View Details
              </Button>
            )}
            {!notification.read && (
              <Button
                size="small"
                variant="text"
                sx={{ mt: 1, ml: 1, p: 0 }}
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as Read
              </Button>
            )}
          </Box>
        }
      />
    </ListItem>
  );
}

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((allNotifications) => {
      const userNotifications = allNotifications.filter(n => n.userId === userId);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    });

    // Load initial notifications
    setNotifications(notificationService.getNotifications(userId));
    setUnreadCount(notificationService.getUnreadCount(userId));

    return unsubscribe;
  }, [userId]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleRemove = (id: string) => {
    notificationService.removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        notificationService.markAsRead(notification.id);
      }
    });
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box p={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="textSecondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 350, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onRemove={handleRemove}
                  />
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
