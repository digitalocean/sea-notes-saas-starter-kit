// MUI imports
import React from 'react';
import { Card, CardContent, Typography, Alert, Chip, Stack, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';

// Define the shape of service status data
interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
  configToReview?: string[];
  description?: string;
}

// Define component props
interface ConfigurableServiceCardProps {
  service: ServiceStatus;
}

/**
 * Generic component for displaying the status of any configurable service
 * This component is service-agnostic and renders based on the service status data
 * 
 * Each card shows the configuration and connection status of a service
 * along with any error messages and required configuration items
 */
export default function ConfigurableServiceCard({ service }: ConfigurableServiceCardProps) {
  /**
   * Get the appropriate icon for the connection status
   */
  const getConnectionIcon = () => {
    if (service.configured === false) {
      // Show help icon for connection when not configured
      return <HelpIcon color="disabled" />;
    }

    // Show success or error icon based on connection status
    return service.connected ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
  };

  /**
   * Get the connection status message
   */
  const getConnectionStatus = () => {
    if (service.configured === false) {
      return 'Not tested';
    }
    return service.connected ? 'Successful' : 'Failed';
  };

  /**
   * Get the error message to display
   * Combines the error message with configuration items to review
   */
  const getErrorMessage = () => {
    // If we don't have error details, just return the error message
    if (!service.error || !service.configToReview) {
      return service.error;
    }

    // If service isn't configured, show which settings are missing
    if (service.configured === false) {
      return `Missing settings: ${service.configToReview.join(', ')}`;
    } else {
      // If service is configured but connection failed, show error and settings to review
      return `${service.error}. Please review the following settings: ${service.configToReview.join(', ')}`;
    }
  };
  
  /**
   * Get the appropriate error severity
   * Required services show as errors, optional services show as warnings
   */
  const getErrorSeverity = () => {
    // For non-required services, show warnings instead of errors
    return service.required ? 'error' : 'warning';
  };
  
  // Render the service card
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Service name and required/optional chip */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{service.name}</Typography>
            <Chip
              label={service.required ? 'Required' : 'Optional'}
              color={service.required ? 'primary' : 'default'}
              size="small"
            />
          </Stack>
          
          {/* Configuration status */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {service.configured ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
            <Typography>Configuration: {service.configured ? 'Valid' : 'Invalid'}</Typography>
          </Stack>

          {/* Connection status */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {getConnectionIcon()}
            <Typography>Connection: {getConnectionStatus()}</Typography>
          </Stack>

          {/* Error message if there is one */}
          {service.error && (
            <Alert severity={getErrorSeverity()}>
              {getErrorMessage()}
              <Divider sx={{ marginY: 1 }} />
              {service.description}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}