import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EnvironmentsHeader from './EnvironmentsHeader';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const mockProps = {
  searchQuery: '',
  sortBy: 'newest',
  viewMode: 'list',
  onSearchChange: jest.fn(),
  onSortChange: jest.fn(),
  onViewModeChange: jest.fn(),
  onCreateEnvironment: jest.fn(),
};

describe('EnvironmentsHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create environment button correctly', () => {
    render(
      <TestWrapper>
        <EnvironmentsHeader {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('environments-create-button')).toBeInTheDocument();
  });

  it('renders the create environment button', () => {
    render(
      <TestWrapper>
        <EnvironmentsHeader {...mockProps} />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('environments-create-button');
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateEnvironment when create button is clicked', () => {
    render(
      <TestWrapper>
        <EnvironmentsHeader {...mockProps} />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('environments-create-button');
    fireEvent.click(createButton);

    expect(mockProps.onCreateEnvironment).toHaveBeenCalledTimes(1);
  });

  it('renders search input with correct placeholder', () => {
    render(
      <TestWrapper>
        <EnvironmentsHeader {...mockProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('environments-search-input');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(
      <TestWrapper>
        <EnvironmentsHeader {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('environments-list-view-button')).toBeInTheDocument();
    expect(screen.getByTestId('environments-grid-view-button')).toBeInTheDocument();
  });
});
