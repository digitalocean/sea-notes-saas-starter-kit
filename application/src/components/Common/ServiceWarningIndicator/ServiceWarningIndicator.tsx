'use client';

// React and MUI imports
import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useRouter } from 'next/navigation';

// Define the shape of service status data
interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
}

/**
 * Component that shows a warning indicator in the header when optional services have issues
 * Only displays when there are optional service failures but no required service failures
 * 
 * This indicator helps users quickly identify when there are configuration issues
 * with optional services that might affect certain features
 */
export default function ServiceWarningIndicator() {
  const [hasErrors, setHasErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const router = useRouter();

  /**
   * Check service status periodically
   * This runs when the component mounts and then every 5 minutes
   */
  useEffect(() => {
    /**
     * Fetch service status from the API and update state
     */
    const checkServiceStatus = async () => {
      try {
        // Fetch system status from the API
        const response = await fetch('/api/system-status');
        if (response.ok) {
          const data = await response.json();
          const services: ServiceStatus[] = data.services || [];
          
          // Filter for services with issues (not configured or not connected)
          const issues = services.filter((service) => !service.configured || !service.connected);
          
          // Update state with the results
          setHasErrors(issues.length > 0);
          setErrorCount(issues.length);
        }
      } catch (error) {
        // Handle fetch errors gracefully
        console.error('Failed to check service status:', error);
        setHasErrors(false);
      }
    };
    
    // Check status immediately when component mounts
    checkServiceStatus();
    
    // Set up interval to check status every 5 minutes
    const interval = setInterval(checkServiceStatus, 5 * 60 * 1000);
    
    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  /**
   * Handle click on the warning indicator
   * Navigate to the system status page for details
   */
  const handleClick = () => {
    router.push('/system-status');
  };

  // Don't render if there are no errors
  if (!hasErrors) {
    return null;
  }

  // Render the warning indicator with badge and tooltip
  return (
    <Tooltip
      title={`${errorCount} optional service${errorCount !== 1 ? 's' : ''} have configuration issues. Click to view details.`}
      data-testid="ServiceWarningIndicator"
    >
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'warning.main',
          '&:hover': {
            backgroundColor: 'warning.light',
            color: 'warning.dark',
          },
        }}
      >
        <Badge badgeContent={errorCount} color="warning">
          <WarningIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}