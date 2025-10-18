'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { TERMINAL, DIMENSIONS } from 'constants/landing';

/**
 * TerminalMockup component
 */
const TerminalMockup = () => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TERMINAL.commands);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API or when permissions are denied
      const textArea = document.createElement('textarea');
      textArea.value = TERMINAL.commands;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // Determine text color based on background for better contrast
  const getTerminalTextColor = () => {
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[300]  // Light grey text on dark background
      : theme.palette.grey[800];  // Dark grey text on light background
  };

  // Determine terminal background based on theme
  const getTerminalBackground = () => {
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[900]   // Dark background
      : theme.palette.common.white; // Light background
  };

  // Determine header background based on theme
  const getHeaderBackground = () => {
    return theme.palette.mode === 'dark' 
      ? theme.palette.grey[800]   // Darker header
      : '#f5f5f5';                // Light header
  };

  return (
    <Box sx={{
      order: { xs: 1, lg: 2 },
      width: { xs: '100%', lg: DIMENSIONS.layout.terminalWidth },
      maxWidth: '100%',
      flexShrink: 0
    }}>
      <Box sx={{
        bgcolor: getTerminalBackground(),
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Terminal header */}
        <Box sx={{
          bgcolor: getHeaderBackground(),
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ff5f56' }} />
            <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
            <Box sx={{ width: DIMENSIONS.terminalDot.width, height: DIMENSIONS.terminalDot.height, borderRadius: '50%', bgcolor: '#27ca3f' }} />
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.75rem',
              color: theme.palette.mode === 'dark' 
                ? theme.palette.grey[400] 
                : 'text.secondary'
            }}
          >
            Terminal
          </Typography>
        </Box>
        {/* Terminal content */}
        <Box sx={{ p: DIMENSIONS.spacing.stack }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'monospace', 
              color: getTerminalTextColor(),
              mb: DIMENSIONS.spacing.small, 
              fontSize: '0.95rem',
              whiteSpace: 'pre-line'
            }}
          >
            {TERMINAL.commands}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[600] 
                : 'grey.400',
              color: getTerminalTextColor(),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.dark 
                  : theme.palette.primary.main,
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : 'white'
              }
            }}
          >
            {copied ? 'Copied!' : 'Copy all'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TerminalMockup;