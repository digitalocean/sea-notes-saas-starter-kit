import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnvironmentForm from './EnvironmentForm';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock EnvironmentsApiClient
jest.mock('lib/api/environments', () => {
  const mockEnvironment = {
    id: '123',
    userId: 'user1',
    name: 'Test Environment',
    type: 'Test Type',
    createdAt: '2025-06-01T12:00:00Z',
  };
  return {
    EnvironmentsApiClient: jest.fn().mockImplementation(() => ({
      getEnvironment: jest.fn().mockResolvedValue(mockEnvironment),
    })),
  };
});

describe('EnvironmentForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<EnvironmentForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByTestId('environment-form-title')).toHaveTextContent('Create New Environment');
    expect(screen.getByTestId('environment-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('environment-type-input')).toBeInTheDocument();
    expect(screen.getByTestId('environment-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('environment-cancel-button')).toBeInTheDocument();
  });

  it('loads environment data in view mode', async () => {
    render(<EnvironmentForm mode="view" environmentId="123" onCancel={mockOnCancel} />);

    // Should show loading initially
    expect(screen.getByTestId('environment-loading-state')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('environment-form-title')).toHaveTextContent('View Environment');
    });

    // Fields should be populated and readonly
    expect(screen.getByTestId('environment-form-title')).toHaveTextContent('View Environment');

    // Check field values using getByDisplayValue which works with MUI components
    expect(screen.getByDisplayValue('Test Environment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Type')).toBeInTheDocument();

    // Only cancel button should be present in view mode
    expect(screen.getByTestId('environment-cancel-button')).toBeInTheDocument();
    expect(screen.queryByTestId('environment-save-button')).not.toBeInTheDocument();
  });

  it('loads environment data in edit mode', async () => {
    render(<EnvironmentForm mode="edit" environmentId="123" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('environment-form-title')).toHaveTextContent('Edit Environment');
    });

    // Fields should be populated but editable
    expect(screen.getByTestId('environment-form-title')).toHaveTextContent('Edit Environment');

    // Check field values using getByDisplayValue which works with MUI components
    expect(screen.getByDisplayValue('Test Environment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Type')).toBeInTheDocument();

    // Both save and cancel buttons should be present
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('calls onSave when form is submitted', async () => {
    render(<EnvironmentForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Fill in the form by finding the input elements directly
    const nameInput = screen.getByTestId('environment-name-input').querySelector('input');
    const typeInput = screen.getByTestId('environment-type-input').querySelector('textarea');

    if (nameInput && typeInput) {
      fireEvent.change(nameInput, { target: { value: 'New Environment' } });
      fireEvent.change(typeInput, { target: { value: 'New Type' } });
    }

    // Submit the form
    fireEvent.click(screen.getByTestId('environment-save-button'));

    // Check if onSave was called with the right values
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'New Environment',
      type: 'New Type',
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<EnvironmentForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByTestId('environment-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
