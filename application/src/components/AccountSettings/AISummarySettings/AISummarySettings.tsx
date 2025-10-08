'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Alert,
} from '@mui/material';

/**
 * AI Summary Settings Component
 * Allows users to enable/disable AI summary generation globally
 */
export default function AISummarySettings() {
  const [summariesEnabled, setSummariesEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setSummariesEnabled(newValue);
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summariesEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preference');
      }
    } catch (error) {
      console.error('Failed to save AI summary preference:', error);
      // Revert on error
      setSummariesEnabled(!newValue);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Summary Settings
        </Typography>
        
        <Box mt={2}>
          <FormControlLabel
            control={
              <Switch
                checked={summariesEnabled}
                onChange={handleToggle}
                disabled={isSaving}
                color="primary"
              />
            }
            label="Enable AI-powered summaries"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
            When enabled, you can generate TL;DR summaries for your notes using AI.
          </Typography>
        </Box>

        {!summariesEnabled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            AI summary features are currently disabled. Enable to generate summaries for your notes.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}