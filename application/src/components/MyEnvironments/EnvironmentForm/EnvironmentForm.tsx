/**
 * EnvironmentForm Component with AI Content Generation
 * 
 * Unified component for creating, editing, and viewing environments with optional AI features.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { EnvironmentsApiClient } from 'lib/api/environments';
import { hasDigitalOceanGradientAIEnabled } from '../../../settings';

const apiClient = new EnvironmentsApiClient();

interface EnvironmentFormProps {
  mode: 'create' | 'edit' | 'view';
  environmentId?: string;
  onSave?: (environment: { id?: string; name?: string; type: string; content?: string }) => void;
  onCancel?: () => void;
}

/**
 * EnvironmentForm component for creating, editing, and viewing environments
 */
const EnvironmentForm: React.FC<EnvironmentFormProps> = ({ mode, environmentId, onSave, onCancel }) => {
  const [name, setName] = useState(''); // Changed from title
  const [type, setType] = useState(''); // Changed from content
  const [createdAt, setCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState<string | null>(null);
  
  // AI content generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Ref for type field to enable auto-focus
  const typeFieldRef = useRef<HTMLInputElement>(null); // Changed from contentFieldRef

  // Fetch environment data for edit/view modes
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && environmentId) {
      const fetchEnvironment = async () => {
        try {
          setLoading(true);
          const environmentData = await apiClient.getEnvironment(environmentId);
          setName(environmentData.name); // Changed from title
          setType(environmentData.type); // Changed from content
          setCreatedAt(environmentData.createdAt);
          setError(null);
        } catch (err) {
          console.error('Error fetching environment:', err);
          setError('Failed to load environment. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchEnvironment();
    }
  }, [mode, environmentId]);

  // Auto-focus type field when in create mode
  useEffect(() => {
    if (mode === 'create' && typeFieldRef.current) { // Changed from contentFieldRef
      typeFieldRef.current.focus();
    }
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSave) {
      let environmentData;
      
      if (mode === 'edit' && environmentId) {
        // Edit mode: always include name and type
        environmentData = { id: environmentId, name, type }; // Changed from title, content
      } else {
        // Create mode: include name (if provided) and type
        environmentData = name ? { name, type } : { type }; // Changed from title, content
      }
      
      onSave(environmentData);
    }
  };

  // AI content generation functions
  const showToastMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  const handleGenerateContent = async () => {
    // If type already exists, show confirmation dialog
    if (type && type.trim().length > 0) { // Changed from content
      setShowConfirmDialog(true);
      return;
    }

    // Generate content immediately if textarea is empty
    await generateAIContent();
  };

  const confirmReplaceContent = async () => {
    setShowConfirmDialog(false);
    await generateAIContent();
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Content generation failed. Please try again.');
      }

      const { content: generatedContent } = await response.json();
      setType(generatedContent); // Changed from setContent
      showToastMessage('Content generated successfully!');
    } catch (error) {
      console.error('Content generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Content generation temporarily unavailable.';
      showToastMessage(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };
  // Show loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        data-testid="environment-loading-state" // Changed from note-loading-state
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Box textAlign="center" p={3} data-testid="environment-error-state"> // Changed from note-error-state
        <Typography variant="h4" gutterBottom data-testid="environment-error-message"> // Changed from note-error-message
          {error}
        </Typography>
        <Button onClick={onCancel} variant="contained" data-testid="environment-error-back-button"> // Changed from note-error-back-button
          Back to Environments
        </Button>
      </Box>
    );
  }

  const isReadOnly = mode === 'view';

  return (
    <Box>
      {createdAt && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Created: {new Date(createdAt).toLocaleDateString()}
        </Typography>
      )}{' '}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom data-testid="environment-form-title">
            {mode === 'create' ? 'Create New Environment' : mode === 'edit' ? 'Edit Environment' : 'View Environment'}
          </Typography>
          <form
            onSubmit={mode !== 'view' ? handleSubmit : (e) => e.preventDefault()}
            data-testid="environment-form" // Changed from note-form
          >
            {' '}
            <TextField
              id="name" // Changed from title
              label="Name (optional)" // Changed from Title
              fullWidth
              margin="normal"
              placeholder="Enter environment name (optional)" // Changed from note title
              value={name} // Changed from title
              onChange={(e) => setName(e.target.value)} // Changed from setTitle
              InputProps={{ readOnly: isReadOnly }}
              data-testid="environment-name-input" // Changed from note-title-input
            />
            
            <TextField
              id="type" // Changed from content
              label="Type" // Changed from Content
              fullWidth
              margin="normal"
              multiline
              rows={6}
              placeholder="Enter environment type" // Changed from note content
              value={type} // Changed from content
              onChange={(e) => setType(e.target.value)} // Changed from setContent
              required
              InputProps={{ readOnly: isReadOnly }}
              inputRef={typeFieldRef} // Changed from contentFieldRef
              data-testid="environment-type-input" // Changed from note-content-input
            />{' '}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              {/* AI Content Generation Button - only show in create mode when AI configured */}
              {mode === 'create' && hasDigitalOceanGradientAIEnabled ? (
                <Button
                  variant="outlined"
                  startIcon={isGenerating ? <CircularProgress size={16} /> : '✨'}
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  size="small"
                  data-testid="generate-content-button"
                >
                  {isGenerating ? 'Generating...' : 'Generate Environment with GradientAI'} // Changed from Note
                </Button>
              ) : (
                <Box /> // Empty box to maintain spacing
              )}
              
              <Box display="flex" gap={1}>
                <Button onClick={onCancel} data-testid="environment-cancel-button">
                  {mode === 'view' ? 'Close' : 'Cancel'}
                </Button>
                {mode !== 'view' && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    data-testid="environment-save-button">
                    {mode === 'edit' ? 'Save Changes' : 'Save Environment'}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Content Replacement */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        data-testid="content-replace-dialog"
      >
        <DialogTitle>Replace Existing Content?</DialogTitle>
        <DialogContent>
          <Typography>
            This will replace your current content with AI-generated content. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} data-testid="dialog-cancel-button">
            Cancel
          </Button>
          <Button onClick={confirmReplaceContent} variant="contained" data-testid="dialog-replace-button">
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        data-testid="generation-toast"
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity={toastSeverity}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnvironmentForm;
