'use client';

import React, { useState, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { NotesApiClient, NoteQuestionResponse } from 'lib/api/notes';

interface NotesAssistantProps {
  apiClient: NotesApiClient;
  onSourceSelect?: (noteId: string) => void;
}

const exampleQuestions = [
  'What did I write about project X last week?',
  'List all follow-up tasks from my last meeting notes.',
  'Summarize my notes about customer feedback.',
];

const NotesAssistant: React.FC<NotesAssistantProps> = ({ apiClient, onSourceSelect }) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<NoteQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = useCallback(async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiClient.askQuestion(trimmedQuestion);
      setResponse(result);
    } catch (err) {
      setResponse(null);
      setError(err instanceof Error ? err.message : 'Unable to process your question right now.');
    } finally {
      setIsSubmitting(false);
    }
  }, [apiClient, question]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      void handleAsk();
    },
    [handleAsk]
  );

  const handleSourceClick = useCallback(
    (noteId: string) => {
      if (onSourceSelect) {
        onSourceSelect(noteId);
      }
    },
    [onSourceSelect]
  );

  const hasQuestion = question.trim().length > 0;

  return (
    <Paper variant="outlined" sx={{ mb: 4, p: { xs: 2, md: 3 } }} data-testid="notes-assistant">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <QuizIcon color="primary" />
          <Typography variant="h6">Ask your notes</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Ask in natural language and the assistant will answer using only your saved notes.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} component="form" onSubmit={handleSubmit}>
          <TextField
            value={question}
            onChange={event => setQuestion(event.target.value)}
            placeholder="e.g. What action items did I capture yesterday?"
            minRows={2}
            multiline
            fullWidth
            disabled={isSubmitting}
            inputProps={{ 'data-testid': 'notes-assistant-input' }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!hasQuestion || isSubmitting}
            sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, minWidth: 140 }}
            data-testid="notes-assistant-submit"
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Ask'}
          </Button>
        </Stack>

        {!hasQuestion && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {exampleQuestions.map(example => (
              <Chip
                key={example}
                label={example}
                icon={<HelpOutlineIcon />}
                onClick={() => setQuestion(example)}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        )}

        {error && (
          <Alert severity="error" data-testid="notes-assistant-error">
            {error}
          </Alert>
        )}

        {response && (
          <Stack spacing={2} data-testid="notes-assistant-response">
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Answer
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {response.answer}
                </Typography>
              </Paper>
            </Box>

            {response.sources.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sources
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {response.sources.map(source => (
                    <Chip
                      key={source.chunkId}
                      label={source.title || 'Untitled note'}
                      onClick={() => handleSourceClick(source.noteId)}
                      sx={{ mb: 1 }}
                      data-testid={`notes-assistant-source-${source.chunkId}`}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {response.usedFallback && (
              <Alert severity="info" data-testid="notes-assistant-fallback">
                Showing results using keyword search because no embeddings were available yet.
              </Alert>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default NotesAssistant;
