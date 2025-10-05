import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyNotes from './MyNotesPage';

// Mock the API client
jest.mock('lib/api/notes', () => {
  const mockGetNotes = jest.fn();
  const mockCreateNote = jest.fn();
  const mockUpdateNote = jest.fn();
  const mockDeleteNote = jest.fn();
  const mockAskQuestion = jest.fn();

  return {
    Note: jest.requireActual('lib/api/notes').Note,
    NotesApiClient: jest.fn().mockImplementation(() => ({
      getNotes: mockGetNotes,
      createNote: mockCreateNote,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      askQuestion: mockAskQuestion,
    })),
    // Export mocks for test access
    __mockGetNotes: mockGetNotes,
    __mockCreateNote: mockCreateNote,
    __mockUpdateNote: mockUpdateNote,
    __mockDeleteNote: mockDeleteNote,
    __mockAskQuestion: mockAskQuestion,
  };
});

// Get references to mock functions
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockedModule = require('lib/api/notes');
const mockGetNotes = mockedModule.__mockGetNotes;
const mockCreateNote = mockedModule.__mockCreateNote;
const mockUpdateNote = mockedModule.__mockUpdateNote;
const mockDeleteNote = mockedModule.__mockDeleteNote;

// Mock child components to simplify testing
jest.mock('./NotesListView/NotesListView', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onViewNote, onEditNote, onDeleteNote }) => (
      <div data-testid="notes-list-view">
        <button onClick={() => onViewNote('1')} data-testid="view-btn">
          View
        </button>
        <button onClick={() => onEditNote('1')} data-testid="edit-btn">
          Edit
        </button>
        <button onClick={() => onDeleteNote('1')} data-testid="delete-btn">
          Delete
        </button>
      </div>
    )),
  };
});

jest.mock('../Common/Toast/Toast', () => {
  return {
    __esModule: true,
    default: jest.fn(({ open, message, severity, onClose }) =>
      open ? (
        <div data-testid={`toast-${severity}`}>
          {message}
          <button onClick={onClose} data-testid="close-toast">
            Close
          </button>
        </div>
      ) : null
    ),
  };
});

jest.mock('./NotesGridView/NotesGridView', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="notes-grid-view" />),
  };
});

jest.mock('./NotesHeader/NotesHeader', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onCreateNote, onViewModeChange }) => (
      <div data-testid="notes-header">
        <button onClick={() => onCreateNote()} data-testid="create-btn">
          Create
        </button>
        <button onClick={() => onViewModeChange('grid')} data-testid="grid-btn">
          Grid
        </button>
        <button onClick={() => onViewModeChange('list')} data-testid="list-btn">
          List
        </button>
      </div>
    )),
  };
});

jest.mock('./NotesForm/NoteForm', () => {
  return {
    __esModule: true,
    default: jest.fn(({ mode, onSave, onCancel }) => (
      <div data-testid={`note-form-${mode}`}>
        <button
          onClick={() => onSave && onSave({ title: 'New Note', content: 'New Content' })}
          data-testid="save-btn"
        >
          Save
        </button>
        <button onClick={() => onCancel()} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    )),
  };
});

// Set up default mock behavior
beforeAll(() => {
  // Default mock implementation for basic tests
  const mockNotes = [
    {
      id: '1',
      userId: 'user1',
      title: 'Test Note 1',
      content: 'Content for test note 1',
      createdAt: '2025-06-01T12:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Test Note 2',
      content: 'Content for test note 2',
      createdAt: '2025-06-02T12:00:00Z',
    },
  ];

  mockGetNotes.mockResolvedValue({ notes: mockNotes, total: mockNotes.length });
  mockCreateNote.mockImplementation((data: { title: string; content: string }) =>
    Promise.resolve({
      id: '3',
      userId: 'user1',
      ...data,
      createdAt: new Date().toISOString(),
    })
  );
  mockUpdateNote.mockImplementation((id: string, data: { title: string; content: string }) =>
    Promise.resolve({
      id,
      userId: 'user1',
      ...data,
      createdAt: '2025-06-03T12:00:00Z',
    })
  );
  mockDeleteNote.mockResolvedValue(undefined);
});

describe('MyNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notes header and list view by default', async () => {
    render(<MyNotes />);

    // Header should always be visible
    expect(screen.getByTestId('notes-header')).toBeInTheDocument();

    // List view should be the default
    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });
  });

  it('hides pagination controls when there are no notes', async () => {
    // Mock response with no notes
    mockGetNotes.mockResolvedValue({
      notes: [],
      total: 0,
    });

    render(<MyNotes />);

    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });

    // Pagination controls should not be visible when there are no notes
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();
  });

  it('shows pagination controls when there are notes', async () => {
    // Mock response with multiple pages of notes
    mockGetNotes.mockResolvedValue({
      notes: Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        userId: 'user1',
        title: `Note ${i + 1}`,
        content: `Content ${i + 1}`,
        createdAt: new Date().toISOString(),
      })),
      total: 25, // Multiple pages
    });

    render(<MyNotes />);

    await waitFor(() => {
      expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
    });

    // Pagination controls should be visible with multiple pages
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Rows per page')).toBeInTheDocument();
    });
  });
  it('calls getNotes with correct pagination parameters', async () => {
    mockGetNotes.mockResolvedValue({ notes: [], total: 0 });

    render(<MyNotes />);

    await waitFor(() => {
      expect(mockGetNotes).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'newest',
      });
    });
  });
});

describe('MyNotes - Pagination Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pagination Controls', () => {
    it('renders pagination component with correct props', async () => {
      // Mock response with pagination data
      mockGetNotes.mockResolvedValue({
        notes: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          title: `Note ${i + 1}`,
          content: `Content ${i + 1}`,
          createdAt: new Date().toISOString(),
        })),
        total: 25, // 3 pages with pageSize 10
      });

      render(<MyNotes />);

      await waitFor(() => {
        expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
      });

      // Check if pagination component exists (Material UI Pagination should be rendered)
      await waitFor(() => {
        const paginationContainer = screen.getByRole('navigation');
        expect(paginationContainer).toBeInTheDocument();
      });
    });

    it('updates page when pagination button is clicked', async () => {
      mockGetNotes.mockResolvedValue({
        notes: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          title: `Note ${i + 1}`,
          content: `Content ${i + 1}`,
          createdAt: new Date().toISOString(),
        })),
        total: 25,
      });

      render(<MyNotes />);

      await waitFor(() => {
        expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Find and click page 2 button
      const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(mockGetNotes).toHaveBeenCalledWith({
          page: 2,
          pageSize: 10,
          search: '',
          sortBy: 'newest',
        });
      });
    });

    it('updates page size and resets to page 1', async () => {
      mockGetNotes.mockResolvedValue({
        notes: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          title: `Note ${i + 1}`,
          content: `Content ${i + 1}`,
          createdAt: new Date().toISOString(),
        })),
        total: 25,
      });

      render(<MyNotes />);

      await waitFor(() => {
        expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
        expect(screen.getByLabelText('Rows per page')).toBeInTheDocument();
      });

      // Find and change page size
      const pageSizeSelect = screen.getByLabelText('Rows per page');
      fireEvent.mouseDown(pageSizeSelect);

      const option20 = screen.getByRole('option', { name: '20' });
      fireEvent.click(option20);

      await waitFor(() => {
        expect(mockGetNotes).toHaveBeenCalledWith({
          page: 1, // Should reset to page 1
          pageSize: 20,
          search: '',
          sortBy: 'newest',
        });
      });
    });

    it('handles empty results correctly', async () => {
      mockGetNotes.mockResolvedValue({ notes: [], total: 0 });

      render(<MyNotes />);

      await waitFor(() => {
        expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
      });

      // With empty results, pagination should be hidden (this is the UX improvement)
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();
    });

    it('handles API errors during pagination', async () => {
      mockGetNotes.mockRejectedValue(new Error('API Error'));

      render(<MyNotes />);

      await waitFor(() => {
        expect(screen.getByTestId('notes-list-view')).toBeInTheDocument();
      });

      // Should not show pagination when there's an error and no notes
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });
});
