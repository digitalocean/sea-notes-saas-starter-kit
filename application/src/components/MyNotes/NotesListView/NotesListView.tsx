import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Stack,
  Paper,
  Button,
  Skeleton,
} from '@mui/material';
import { Edit, Visibility, Delete } from '@mui/icons-material';
import { Note } from 'lib/api/notes';
import { getTitleUpdateFlashAnimation } from '../../Common/animations/titleUpdateFlash';

interface NotesListViewProps {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  onViewNote: (noteId: string) => void;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  recentlyUpdatedTitles: Set<string>;
  onCreateNote?: () => void;
  onRetry?: () => void;
}

/**
 * List view component for displaying notes in a table format.
 * Provides view, edit, and delete actions for each note in a tabular layout.
 */
const NotesListView: React.FC<NotesListViewProps> = ({
  notes,
  isLoading,
  error,
  onViewNote,
  onEditNote,
  onDeleteNote,
  recentlyUpdatedTitles,
}) => {
  if (isLoading) {
    return (
      <TableContainer component={Paper} data-testid="notes-list-loading">
        <Table aria-label="Notes loading">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4} data-testid="notes-list-error">
        <Typography color="error" data-testid="notes-list-error-message">
          {error}
        </Typography>
        <Button variant="outlined" onClick={onRetry} aria-label="Retry loading notes">
          Retry
        </Button>
      </Box>
    );
  }
  if (notes.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4} data-testid="notes-list-empty">
        <Typography>No notes found. Create your first note!</Typography>
        {onCreateNote && (
          <Button variant="contained" onClick={onCreateNote} aria-label="Create note">
            Create Note
          </Button>
        )}
      </Box>
    );
  }
  return (
    <TableContainer component={Paper} data-testid="notes-list-container">
      <Table data-testid="notes-table" aria-label="Notes table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id} hover data-testid={`note-row-${note.id}`}>
              <TableCell 
                data-testid={`note-title-cell-${note.id}`}
                sx={getTitleUpdateFlashAnimation(recentlyUpdatedTitles.has(note.id))}
              >
                <Typography variant="body1" data-testid={`note-title-${note.id}`}>
                  {note.title}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-content-cell-${note.id}`}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: '300px', // Set a maximum width for the content
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block', // Ensures the typography behaves as a block element
                  }}
                  title={note.content} // Show full content on hover
                  data-testid={`note-content-${note.id}`}
                >
                  {note.content}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-date-cell-${note.id}`}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  data-testid={`note-date-${note.id}`}
                >
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell data-testid={`note-actions-cell-${note.id}`}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onViewNote(note.id)}
                    title="View note"
                    aria-label={`View note ${note.title || ''}`.trim()}
                    data-testid={`note-view-button-${note.id}`}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditNote(note.id)}
                    title="Edit note"
                    aria-label={`Edit note ${note.title || ''}`.trim()}
                    data-testid={`note-edit-button-${note.id}`}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteNote(note.id)}
                    title="Delete note"
                    aria-label={`Delete note ${note.title || ''}`.trim()}
                    data-testid={`note-delete-button-${note.id}`}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotesListView;
