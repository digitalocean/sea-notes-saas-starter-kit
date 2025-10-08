/**
 * NoteForm Component with AI Content Generation
 * 
 * Unified component for creating, editing, and viewing notes with optional AI features.
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
import { NotesApiClient } from 'lib/api/notes';
import { hasDigitalOceanGradientAIEnabled } from '../../../settings';

const apiClient = new NotesApiClient();

interface NoteFormProps {
  mode: 'create' | 'edit' | 'view';
  noteId?: string;
  onSave?: (note: { id?: string; title?: string; content: string }) => void;
  onCancel?: () => void;
}

/**
 * NoteForm component for creating, editing, and viewing notes
 */
const NoteForm: React.FC<NoteFormProps> = ({ mode, noteId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(mode !== 'create');
  const [error, setError] = useState<string | null>(null);
  
  // AI content generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Summary generation states
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);


  // Ref for content field to enable auto-focus
  const contentFieldRef = useRef<HTMLInputElement>(null);

  // Fetch note data for edit/view modes
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && noteId) {
      const fetchNote = async () => {
        try {
          setLoading(true);
          const noteData = await apiClient.getNote(noteId);
          setTitle(noteData.title);
          setContent(noteData.content);
          setCreatedAt(noteData.createdAt);
          setSummary(noteData.summary || '');
          setError(null);
        } catch (err) {
          console.error('Error fetching note:', err);
          setError('Failed to load note. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    }
  }, [mode, noteId]);

  // Auto-focus content field when in create mode
  useEffect(() => {
    if (mode === 'create' && contentFieldRef.current) {
      contentFieldRef.current.focus();
    }
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSave) {
      let noteData;
      
      if (mode === 'edit' && noteId) {
        // Edit mode: always include title and content
        noteData = { id: noteId, title, content };
      } else {
        // Create mode: include title (if provided) and content
        noteData = title ? { title, content } : { content };
      }
      
      onSave(noteData);
    }
  };

  // AI content generation functions
  const showToastMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  };

  const handleGenerateContent = async () => {
    // If content already exists, show confirmation dialog
    if (content && content.trim().length > 0) {
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

  const handleGenerateSummary = async () => {
    if (!noteId) return;
    
    setIsGeneratingSummary(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Summary generation failed');
      }

      const { summary: generatedSummary } = await response.json();
      setSummary(generatedSummary);
      showToastMessage('Summary generated successfully!');
    } catch (error) {
      console.error('Summary generation failed:', error);
      showToastMessage('Failed to generate summary. Please try again.', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleClearSummary = async () => {
    if (!noteId) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}/generate-summary`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear summary');
      }

      setSummary('');
      showToastMessage('Summary cleared successfully!');
    } catch (error) {
      console.error('Clear summary failed:', error);
      showToastMessage('Failed to clear summary. Please try again.', 'error');
    }
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
      setContent(generatedContent);
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
        data-testid="note-loading-state"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error message
  if (error) {
    return (
      <Box textAlign="center" p={3} data-testid="note-error-state">
        <Typography variant="h4" gutterBottom data-testid="note-error-message">
          {error}
        </Typography>
        <Button onClick={onCancel} variant="contained" data-testid="note-error-back-button">
          Back to Notes
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
          <Typography variant="h6" gutterBottom data-testid="note-form-title">
            {mode === 'create' ? 'Create New Note' : mode === 'edit' ? 'Edit Note' : 'View Note'}
          </Typography>
          <form
            onSubmit={mode !== 'view' ? handleSubmit : (e) => e.preventDefault()}
            data-testid="note-form"
          >
            {' '}
            <TextField
              id="title"
              label="Title (optional)"
              fullWidth
              margin="normal"
              placeholder="Enter note title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputProps={{ readOnly: isReadOnly }}
              data-testid="note-title-input"
            />
            
            <TextField
              id="content"
              label="Content"
              fullWidth
              margin="normal"
              multiline
              rows={6}
              placeholder="Enter note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              InputProps={{ readOnly: isReadOnly }}
              inputRef={contentFieldRef}
              data-testid="note-content-input"
            />{' '}

            /* AI Summary Generation - show in edit/view modes when content exists */
            {(mode === 'edit' || mode === 'view') && content && hasDigitalOceanGradientAIEnabled && (
              <Box mt={2}>
                <Button
                  variant="outlined"
                  startIcon={isGeneratingSummary ? <CircularProgress size={16} /> : '📝'}
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  size="small"
                  data-testid="generate-summary-button"
                >
                  {isGeneratingSummary ? 'Generating Summary...' : 'Generate Summary'}
                </Button>
                
                {summary && (
                  <Card sx={{ mt: 2, bgcolor: 'action.hover' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" color="primary">
                          TL;DR Summary
                        </Typography>
                        <Button
                          size="small"
                          startIcon="✕"
                          onClick={handleClearSummary}
                          data-testid="clear-summary-button"
                        >
                          Clear
                        </Button>
                      </Box>
                      <Typography variant="body2">
                        {summary}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

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
                  {isGenerating ? 'Generating...' : 'Generate Note with GradientAI'}
                </Button>
              ) : (
                <Box /> // Empty box to maintain spacing
              )}
              
              <Box display="flex" gap={1}>
                <Button onClick={onCancel} data-testid="note-cancel-button">
                  {mode === 'view' ? 'Close' : 'Cancel'}
                </Button>
                {mode !== 'view' && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    data-testid="note-save-button"
                  >
                    {mode === 'edit' ? 'Save Changes' : 'Save Note'}
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

export default NoteForm;
