'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Environment, EnvironmentsApiClient } from 'lib/api/environments';
import EnvironmentForm from './EnvironmentForm/EnvironmentForm';
import EnvironmentsGridView from './EnvironmentsGridView/EnvironmentsGridView';
import EnvironmentsListView from './EnvironmentsListView/EnvironmentsListView';
import EnvironmentsHeader from './EnvironmentsHeader/EnvironmentsHeader';
import PageContainer from '../Common/PageContainer/PageContainer';
import ConfirmationDialog from './ConfirmationDialog/ConfirmationDialog';
import Toast from '../Common/Toast/Toast';
import Pagination from '../Common/Pagination/Pagination';
import { useEnvironmentsSSE } from '../../hooks/useEnvironmentsSSE';

// Create an instance of the ApiClient
const apiClient = new EnvironmentsApiClient();

/**
 * MyEnvironments component
 * This component displays a list of environments with options to view, edit, and create new environments.
 */
const MyEnvironments: React.FC = () => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState<string | null>(null);
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success'
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [totalEnvironments, setTotalEnvironments] = useState(0);
  const [recentlyUpdatedNames, setRecentlyUpdatedNames] = useState<Set<string>>(new Set());
  
  // Ref to track timeout IDs for cleanup
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Fetch environments from API
  const fetchEnvironments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { environments, total } = await apiClient.getEnvironments({
        page,
        pageSize,
        search: searchQuery,
        sortBy,
      });
      setEnvironments(environments);
      setTotalEnvironments(total);
      setError(null);
    } catch {
      setError('Failed to load environments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy]);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  // Handle real-time name updates via SSE
  const handleNameUpdate = useCallback((environmentId: string, newName: string) => {
    setEnvironments(prevEnvironments => 
      prevEnvironments.map(environment => 
        environment.id === environmentId 
          ? { ...environment, name: newName }
          : environment
      )
    );
    
    // Add to recently updated tracking for visual indicator
    setRecentlyUpdatedNames(prev => new Set(prev).add(environmentId));

    // Clear any existing timeout for this environmentId
    if (timeoutRef.current[environmentId]) {
      clearTimeout(timeoutRef.current[environmentId]);
    }

    // Remove from tracking after animation completes
    timeoutRef.current[environmentId] = setTimeout(() => {
      setRecentlyUpdatedNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(environmentId);
        return newSet;
      });
      delete timeoutRef.current[environmentId];
    }, 3000); // 3 second animation duration
  }, []);

  // Initialize SSE connection for real-time updates
  useEnvironmentsSSE(handleNameUpdate);

  // Cleanup animation tracking on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
      setRecentlyUpdatedNames(new Set());
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

  const handleCreateEnvironment = async (environmentData: { name?: string; type: string; content?: string }) => {
    try {
      await apiClient.createEnvironment(environmentData);
      setIsCreateModalOpen(false);

      // Navigate to page 1 to see the new environment (newest first)
      if (page !== 1) {
        setPage(1);
        // fetchEnvironments() will be called automatically by useEffect when page changes
      } else {
        // Already on page 1, manually fetch to see the new environment
        await fetchEnvironments();
      }

      // Show success toast
      setToastMessage('Environment created successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error creating environment:', err);
      setError('Failed to create environment. Please try again.');
      // Show error toast
      setToastMessage('Failed to create environment');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleUpdateEnvironment = async (environmentData: { name?: string; type?: string; status?: string; connectionURL?: string; content?: string }) => {
    if (!selectedEnvironmentId) return;

    try {
      await apiClient.updateEnvironment(selectedEnvironmentId, environmentData);
      setIsEditModalOpen(false);
      setSelectedEnvironmentId(null);

      // Refetch current page to ensure data consistency
      // (environment might no longer match current search/sort criteria)
      await fetchEnvironments();

      // Show success toast
      setToastMessage('Environment updated successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error updating environment:', err);
      setError('Failed to update environment. Please try again.');
      // Show error toast
      setToastMessage('Failed to update environment');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleDeleteConfirmation = (environmentId: string) => {
    setEnvironmentToDelete(environmentId);
    setDeleteConfirmationOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (environmentToDelete) {
      try {
        await apiClient.deleteEnvironment(environmentToDelete);

        // Refetch current page to handle cases where:
        // 1. Page becomes empty and should show previous page
        // 2. Environments from next page should fill current page
        await fetchEnvironments();

        // Check if current page is now empty and we're not on page 1
        const newTotalPages = Math.ceil((totalEnvironments - 1) / pageSize);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }

        // Show success toast
        setToastMessage('Environment deleted successfully');
        setToastSeverity('success');
        setToastOpen(true);
      } catch (err) {
        console.error('Error deleting environment:', err);
        setError('Failed to delete environment. Please try again.');
        // Show error toast
        setToastMessage('Failed to delete environment');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setDeleteConfirmationOpen(false);
        setEnvironmentToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setEnvironmentToDelete(null);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Legacy handler - now redirects to confirmation flow
  const handleDeleteEnvironment = (environmentId: string) => {
    handleDeleteConfirmation(environmentId);
  };
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Don't fetch environments here - only refresh when actual updates are made
  };

  const handleViewEnvironment = (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    setIsViewModalOpen(true);
  };

  const handleEditEnvironment = (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    setIsEditModalOpen(true);
  };
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEnvironmentId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEnvironmentId(null);
    // Don't fetch environments here - only refresh when actual updates are made
  };

  return (
    <PageContainer title="My Environments">
      {/* Header and Controls */}
      <EnvironmentsHeader
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onCreateEnvironment={() => setIsCreateModalOpen(true)}
      />

      {/* Environments Display */}
      {viewMode === 'list' ? (
        <EnvironmentsListView
          environments={environments}
          isLoading={isLoading}
          error={error}
          onViewEnvironment={handleViewEnvironment}
          onEditEnvironment={handleEditEnvironment}
          onDeleteEnvironment={handleDeleteEnvironment}
          recentlyUpdatedNames={recentlyUpdatedNames}
        />
      ) : (
        <EnvironmentsGridView
          environments={environments}
          isLoading={isLoading}
          error={error}
          onViewEnvironment={handleViewEnvironment}
          onEditEnvironment={handleEditEnvironment}
          onDeleteEnvironment={handleDeleteEnvironment}
          recentlyUpdatedNames={recentlyUpdatedNames}
        />
      )}

      {/* Only show pagination controls when there are environments and not loading */}
      {!isLoading && totalEnvironments > 0 && (
        <Pagination
          totalItems={totalEnvironments}
          pageSize={pageSize}
          setPageSize={setPageSize}
          page={page}
          setPage={setPage}
        />
      )}

      {/* Create Environment Modal */}
      <Dialog open={isCreateModalOpen} onClose={handleCloseCreateModal} maxWidth="md" fullWidth>
        <DialogContent>
          <EnvironmentForm mode="create" onSave={handleCreateEnvironment} onCancel={handleCloseCreateModal} />
        </DialogContent>
      </Dialog>

      {/* View Environment Modal */}
      <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedEnvironmentId && (
            <EnvironmentForm mode="view" environmentId={selectedEnvironmentId} onCancel={handleCloseViewModal} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Environment Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
        <DialogContent>
          {selectedEnvironmentId && (
            <EnvironmentForm
              mode="edit"
              environmentId={selectedEnvironmentId}
              onSave={handleUpdateEnvironment}
              onCancel={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete Environment"
        message="Are you sure you want to delete this environment? This action cannot be undone."
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

export default MyEnvironments;
