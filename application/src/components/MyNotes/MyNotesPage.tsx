'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Note, NotesApiClient } from 'lib/api/notes';
import NoteForm from './NotesForm/NoteForm';
import NotesGridView from './NotesGridView/NotesGridView';
import NotesListView from './NotesListView/NotesListView';
import NotesHeader from './NotesHeader/NotesHeader';
import PageContainer from '../Common/PageContainer/PageContainer';
import ConfirmationDialog from './ConfirmationDialog/ConfirmationDialog';
import Toast from '../Common/Toast/Toast';
import Pagination from '../Common/Pagination/Pagination';
import { useNotesSSE } from '../../hooks/useNotesSSE';

// Create an instance of the ApiClient
const apiClient = new NotesApiClient();

/**
 * MyNotes component
 * This component displays a list of notes with options to view, edit, and create new notes.
 */
const MyNotes: React.FC = () => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success'
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [recentlyUpdatedTitles, setRecentlyUpdatedTitles] = useState<Set<string>>(new Set());
  
  // Ref to track timeout IDs for cleanup
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { notes, total } = await apiClient.getNotes({
        page,
        pageSize,
        search: searchQuery,
        sortBy,
      });
      setNotes(notes);
      setTotalNotes(total);
      setError(null);
    } catch {
      setError('Failed to load notes. Please try again later.');
      setToastMessage('Failed to load notes');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleRetryFetch = () => {
    fetchNotes();
  };

  // Handle real-time title updates via SSE
  const handleTitleUpdate = useCallback((noteId: string, newTitle: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, title: newTitle }
          : note
      )
    );
    
    // Add to recently updated tracking for visual indicator
    setRecentlyUpdatedTitles(prev => new Set(prev).add(noteId));

    // Clear any existing timeout for this noteId
    if (timeoutRef.current[noteId]) {
      clearTimeout(timeoutRef.current[noteId]);
    }

    // Remove from tracking after animation completes
    timeoutRef.current[noteId] = setTimeout(() => {
      setRecentlyUpdatedTitles(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
      delete timeoutRef.current[noteId];
    }, 3000); // 3 second animation duration
  }, []);

  // Initialize SSE connection for real-time updates
  useNotesSSE(handleTitleUpdate);

  // Cleanup animation tracking on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
      setRecentlyUpdatedTitles(new Set());
    };
  }, []);

  const handleSortChange = (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    child: React.ReactNode
  ) => {
    setSortBy(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCreateNote = async (noteData: { title?: string; content: string }) => {
    // Optimistically insert a temporary note at the top
    const tempId = `temp-${Date.now()}`;
    const tempNote: Note = {
      id: tempId,
      userId: '',
      title: noteData.title || '',
      content: noteData.content,
      createdAt: new Date().toISOString(),
    };

    // If not on first page, navigate to page 1 so the new note is visible
    if (page !== 1) {
      setPage(1);
    }

    // Insert optimistically if we are already on page 1
    if (page === 1) {
      setNotes((prev) => [tempNote, ...prev]);
      setTotalNotes((prev) => prev + 1);
    }

    try {
      const created = await apiClient.createNote(noteData);
      setIsCreateModalOpen(false);

      if (page === 1) {
        // Replace temporary note with the real one
        setNotes((prev) => prev.map((n) => (n.id === tempId ? created : n)));
      } else {
        // We navigated to page 1; fetch to reflect server state
        await fetchNotes();
      }

      setToastMessage('Note created successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error creating note:', err);
      // Revert optimistic insert if applied
      if (page === 1) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setTotalNotes((prev) => Math.max(0, prev - 1));
      }
      setError('Failed to create note. Please try again.');
      setToastMessage('Failed to create note');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleUpdateNote = async (noteData: { title?: string; content: string }) => {
    if (!selectedNoteId) return;

    try {
      await apiClient.updateNote(selectedNoteId, noteData);
      setIsEditModalOpen(false);
      setSelectedNoteId(null);

      // Refetch current page to ensure data consistency
      // (note might no longer match current search/sort criteria)
      await fetchNotes();

      // Show success toast
      setToastMessage('Note updated successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
      // Show error toast
      setToastMessage('Failed to update note');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleDeleteConfirmation = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteConfirmationOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      try {
        // Optimistically remove from UI
        const previousNotes = notes;
        setNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
        setTotalNotes((prev) => Math.max(0, prev - 1));

        await apiClient.deleteNote(noteToDelete);

        // Adjust pagination if needed
        const newTotalPages = Math.ceil((totalNotes - 1) / pageSize);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }

        setToastMessage('Note deleted successfully');
        setToastSeverity('success');
        setToastOpen(true);
      } catch (err) {
        console.error('Error deleting note:', err);
        // Revert optimistic removal
        setNotes((prev) => prev);
        setError('Failed to delete note. Please try again.');
        setToastMessage('Failed to delete note');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setDeleteConfirmationOpen(false);
        setNoteToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setNoteToDelete(null);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Legacy handler - now redirects to confirmation flow
  const handleDeleteNote = (noteId: string) => {
    handleDeleteConfirmation(noteId);
  };
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Don't fetch notes here - only refresh when actual updates are made
  };

  const handleViewNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsViewModalOpen(true);
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsEditModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedNoteId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedNoteId(null);
    // Don't fetch notes here - only refresh when actual updates are made
  };

  return (
    <PageContainer title="My Notes">
      {/* Header and Controls */}
      <NotesHeader
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onCreateNote={() => setIsCreateModalOpen(true)}
      />

      {/* Notes Display */}
      {viewMode === 'list' ? (
        <NotesListView
          notes={notes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          recentlyUpdatedTitles={recentlyUpdatedTitles}
          onCreateNote={() => setIsCreateModalOpen(true)}
          onRetry={handleRetryFetch}
        />
      ) : (
        <NotesGridView
          notes={notes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          recentlyUpdatedTitles={recentlyUpdatedTitles}
          onCreateNote={() => setIsCreateModalOpen(true)}
          onRetry={handleRetryFetch}
        />
      )}

      {/* Only show pagination controls when there are notes and not loading */}
      {!isLoading && totalNotes > 0 && (
        <Pagination
          totalItems={totalNotes}
          pageSize={pageSize}
          setPageSize={setPageSize}
          page={page}
          setPage={setPage}
        />
      )}

      {/* Create Note Modal */}
      <Dialog open={isCreateModalOpen} onClose={handleCloseCreateModal} maxWidth="md" fullWidth>
        <DialogContent>
          <NoteForm mode="create" onSave={handleCreateNote} onCancel={handleCloseCreateModal} />
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedNoteId && (
            <NoteForm mode="view" noteId={selectedNoteId} onCancel={handleCloseViewModal} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedNoteId && (
            <NoteForm
              mode="edit"
              noteId={selectedNoteId}
              onSave={handleUpdateNote}
              onCancel={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonColor="error"
      />

      {/* Toast notifications */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={handleCloseToast}
      />
    </PageContainer>
  );
};

export default MyNotes;
