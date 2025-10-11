import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyEnvironments from './MyEnvironmentsPage';

// Mock the API client
jest.mock('lib/api/environments', () => {
  const mockGetEnvironments = jest.fn();
  const mockCreateEnvironment = jest.fn();
  const mockUpdateEnvironment = jest.fn();
  const mockDeleteEnvironment = jest.fn();

  return {
    Environment: jest.requireActual('lib/api/environments').Environment,
    EnvironmentsApiClient: jest.fn().mockImplementation(() => ({
      getEnvironments: mockGetEnvironments,
      createEnvironment: mockCreateEnvironment,
      updateEnvironment: mockUpdateEnvironment,
      deleteEnvironment: mockDeleteEnvironment,
    })),
    // Export mocks for test access
    __mockGetEnvironments: mockGetEnvironments,
    __mockCreateEnvironment: mockCreateEnvironment,
    __mockUpdateEnvironment: mockUpdateEnvironment,
    __mockDeleteEnvironment: mockDeleteEnvironment,
  };
});

// Get references to mock functions
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockedModule = require('lib/api/environments');
const mockGetEnvironments = mockedModule.__mockGetEnvironments;
const mockCreateEnvironment = mockedModule.__mockCreateEnvironment;
const mockUpdateEnvironment = mockedModule.__mockUpdateEnvironment;
const mockDeleteEnvironment = mockedModule.__mockDeleteEnvironment;

// Mock child components to simplify testing
jest.mock('./EnvironmentsListView/EnvironmentsListView', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onViewEnvironment, onEditEnvironment, onDeleteEnvironment }) => (
      <div data-testid="environments-list-view">
        <button onClick={() => onViewEnvironment('1')} data-testid="view-btn">
          View
        </button>
        <button onClick={() => onEditEnvironment('1')} data-testid="edit-btn">
          Edit
        </button>
        <button onClick={() => onDeleteEnvironment('1')} data-testid="delete-btn">
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

jest.mock('./EnvironmentsGridView/EnvironmentsGridView', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="environments-grid-view" />),
  };
});

jest.mock('./EnvironmentsHeader/EnvironmentsHeader', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onCreateEnvironment, onViewModeChange }) => (
      <div data-testid="environments-header">
        <button onClick={() => onCreateEnvironment()} data-testid="create-btn">
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

jest.mock('./EnvironmentForm/EnvironmentForm', () => {
  return {
    __esModule: true,
    default: jest.fn(({ mode, onSave, onCancel }) => (
      <div data-testid={`environment-form-${mode}`}>
        <button
          onClick={() => onSave && onSave({ name: 'New Environment', type: 'ROS2_HUMBLE' })}
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
  const mockEnvironments = [
    {
      id: '1',
      userId: 'user1',
      name: 'Test Environment 1',
      type: 'ROS2_HUMBLE',
      status: 'RUNNING',
      connectionURL: 'http://localhost:8080',
      createdAt: '2025-06-01T12:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Test Environment 2',
      type: 'ISAAC_LAB',
      status: 'STOPPED',
      connectionURL: null,
      createdAt: '2025-06-02T12:00:00Z',
    },
  ];

  mockGetEnvironments.mockResolvedValue({ environments: mockEnvironments, total: mockEnvironments.length });
  mockCreateEnvironment.mockImplementation((data: { name: string; type: string }) =>
    Promise.resolve({
      id: '3',
      userId: 'user1',
      ...data,
      status: 'STARTING',
      connectionURL: null,
      createdAt: new Date().toISOString(),
    })
  );
  mockUpdateEnvironment.mockImplementation((id: string, data: { name: string; type: string }) =>
    Promise.resolve({
      id,
      userId: 'user1',
      ...data,
      status: 'RUNNING',
      connectionURL: 'http://localhost:8080',
      createdAt: '2025-06-03T12:00:00Z',
    })
  );
  mockDeleteEnvironment.mockResolvedValue(undefined);
});

describe('MyEnvironments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders environments header and list view by default', async () => {
    render(<MyEnvironments />);

    // Header should always be visible
    expect(screen.getByTestId('environments-header')).toBeInTheDocument();

    // List view should be the default
    await waitFor(() => {
      expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
    });
  });

  it('hides pagination controls when there are no environments', async () => {
    // Mock response with no environments
    mockGetEnvironments.mockResolvedValue({
      environments: [],
      total: 0,
    });

    render(<MyEnvironments />);

    await waitFor(() => {
      expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
    });

    // Pagination controls should not be visible when there are no environments
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();
  });

  it('shows pagination controls when there are environments', async () => {
    // Mock response with multiple pages of environments
    mockGetEnvironments.mockResolvedValue({
      environments: Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        userId: 'user1',
        name: `Environment ${i + 1}`,
        type: 'ROS2_HUMBLE',
        status: 'RUNNING',
        connectionURL: 'http://localhost:8080',
        createdAt: new Date().toISOString(),
      })),
      total: 25, // Multiple pages
    });

    render(<MyEnvironments />);

    await waitFor(() => {
      expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
    });

    // Pagination controls should be visible with multiple pages
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Rows per page')).toBeInTheDocument();
    });
  });
  it('calls getEnvironments with correct pagination parameters', async () => {
    mockGetEnvironments.mockResolvedValue({ environments: [], total: 0 });

    render(<MyEnvironments />);

    await waitFor(() => {
      expect(mockGetEnvironments).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: 'newest',
      });
    });
  });
});

describe('MyEnvironments - Pagination Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pagination Controls', () => {
    it('renders pagination component with correct props', async () => {
      // Mock response with pagination data
      mockGetEnvironments.mockResolvedValue({
        environments: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          name: `Environment ${i + 1}`,
          type: 'ROS2_HUMBLE',
          status: 'RUNNING',
          connectionURL: 'http://localhost:8080',
          createdAt: new Date().toISOString(),
        })),
        total: 25, // 3 pages with pageSize 10
      });

      render(<MyEnvironments />);

      await waitFor(() => {
        expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
      });

      // Check if pagination component exists (Material UI Pagination should be rendered)
      await waitFor(() => {
        const paginationContainer = screen.getByRole('navigation');
        expect(paginationContainer).toBeInTheDocument();
      });
    });

    it('updates page when pagination button is clicked', async () => {
      mockGetEnvironments.mockResolvedValue({
        environments: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          name: `Environment ${i + 1}`,
          type: 'ROS2_HUMBLE',
          status: 'RUNNING',
          connectionURL: 'http://localhost:8080',
          createdAt: new Date().toISOString(),
        })),
        total: 25,
      });

      render(<MyEnvironments />);

      await waitFor(() => {
        expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });

      // Find and click page 2 button
      const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(mockGetEnvironments).toHaveBeenCalledWith({
          page: 2,
          pageSize: 10,
          search: '',
          sortBy: 'newest',
        });
      });
    });

    it('updates page size and resets to page 1', async () => {
      mockGetEnvironments.mockResolvedValue({
        environments: Array.from({ length: 10 }, (_, i) => ({
          id: `${i + 1}`,
          userId: 'user1',
          name: `Environment ${i + 1}`,
          type: 'ROS2_HUMBLE',
          status: 'RUNNING',
          connectionURL: 'http://localhost:8080',
          createdAt: new Date().toISOString(),
        })),
        total: 25,
      });

      render(<MyEnvironments />);

      await waitFor(() => {
        expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
        expect(screen.getByLabelText('Rows per page')).toBeInTheDocument();
      });

      // Find and change page size
      const pageSizeSelect = screen.getByLabelText('Rows per page');
      fireEvent.mouseDown(pageSizeSelect);

      const option20 = screen.getByRole('option', { name: '20' });
      fireEvent.click(option20);

      await waitFor(() => {
        expect(mockGetEnvironments).toHaveBeenCalledWith({
          page: 1, // Should reset to page 1
          pageSize: 20,
          search: '',
          sortBy: 'newest',
        });
      });
    });

    it('handles empty results correctly', async () => {
      mockGetEnvironments.mockResolvedValue({ environments: [], total: 0 });

      render(<MyEnvironments />);

      await waitFor(() => {
        expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
      });

      // With empty results, pagination should be hidden (this is the UX improvement)
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument();
    });

    it('handles API errors during pagination', async () => {
      mockGetEnvironments.mockRejectedValue(new Error('API Error'));

      render(<MyEnvironments />);

      await waitFor(() => {
        expect(screen.getByTestId('environments-list-view')).toBeInTheDocument();
      });

      // Should not show pagination when there's an error and no environments
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });
});
