import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnvironmentsGridView from './EnvironmentsGridView';

const mockEnvironments = [
  {
    id: '1',
    userId: 'user1',
    name: 'Test Environment 1',
    type: 'Type for test environment 1',
    createdAt: '2025-06-01T12:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Test Environment 2',
    type: 'Type for test environment 2',
    createdAt: '2025-06-02T12:00:00Z',
  },
];

const mockHandlers = {
  onViewEnvironment: jest.fn(),
  onEditEnvironment: jest.fn(),
  onDeleteEnvironment: jest.fn(),
};

describe('EnvironmentsGridView', () => {
  it('renders loading state correctly', () => {
    render(
      <EnvironmentsGridView
        environments={[]}
        isLoading={true}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    expect(screen.getByTestId('environments-grid-loading')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Failed to load environments';
    render(
      <EnvironmentsGridView
        environments={[]}
        isLoading={false}
        error={errorMessage}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    expect(screen.getByTestId('environments-grid-error')).toBeInTheDocument();
    expect(screen.getByTestId('environments-grid-error-message')).toHaveTextContent(errorMessage);
  });

  it('renders empty state message when there are no environments', () => {
    render(
      <EnvironmentsGridView
        environments={[]}
        isLoading={false}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    expect(screen.getByTestId('environments-grid-empty')).toBeInTheDocument();
  });

  it('renders environments in cards', () => {
    render(
      <EnvironmentsGridView
        environments={mockEnvironments}
        isLoading={false}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    expect(screen.getByTestId('environments-grid-container')).toBeInTheDocument();
    expect(screen.getByTestId('environment-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('environment-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('environment-name-1')).toHaveTextContent('Test Environment 1');
    expect(screen.getByTestId('environment-name-2')).toHaveTextContent('Test Environment 2');
    expect(screen.getByTestId('environment-type-1')).toHaveTextContent('Type for test environment 1');
    expect(screen.getByTestId('environment-type-2')).toHaveTextContent('Type for test environment 2');
  });

  it('calls onViewEnvironment when view button is clicked', () => {
    render(
      <EnvironmentsGridView
        environments={mockEnvironments}
        isLoading={false}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    const viewButton = screen.getByTestId('environment-view-button-1');
    fireEvent.click(viewButton);

    expect(mockHandlers.onViewEnvironment).toHaveBeenCalledWith('1');
  });

  it('calls onEditEnvironment when edit button is clicked', () => {
    render(
      <EnvironmentsGridView
        environments={mockEnvironments}
        isLoading={false}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    const editButton = screen.getByTestId('environment-edit-button-1');
    fireEvent.click(editButton);

    expect(mockHandlers.onEditEnvironment).toHaveBeenCalledWith('1');
  });

  it('calls onDeleteEnvironment when delete button is clicked', () => {
    render(
      <EnvironmentsGridView
        environments={mockEnvironments}
        isLoading={false}
        error={null}
        onViewEnvironment={mockHandlers.onViewEnvironment}
        onEditEnvironment={mockHandlers.onEditEnvironment}
        onDeleteEnvironment={mockHandlers.onDeleteEnvironment}
        recentlyUpdatedNames={new Set()}
      />
    );

    const deleteButton = screen.getByTestId('environment-delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDeleteEnvironment).toHaveBeenCalledWith('1');
  });
});
