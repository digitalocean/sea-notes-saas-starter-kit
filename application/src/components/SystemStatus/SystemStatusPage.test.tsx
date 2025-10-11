/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SystemStatusPage from './SystemStatusPage';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock the ConfigurableServiceCard component
jest.mock('./ConfigurableServiceCard', () => {
  return function MockConfigurableServiceCard({ service }: { service: any }) {
    return <div data-testid={`service-card-${service.name}`}>{service.name}</div>;
  };
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSystemInfo = {
  environment: 'test',
  timestamp: '2025-06-06T10:00:00Z',
  lastHealthCheck: '2025-06-06T10:00:00Z',
};

const mockServices = [
  {
    name: 'Database',
    configured: true,
    connected: true,
    required: true,
  },
  {
    name: 'Email Service',
    configured: false,
    connected: false,
    required: false,
    error: 'Missing API key',
  },
];

describe('SystemStatusPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock console.log and console.error to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the system status title', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: [], systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Service Configuration and Connectivity Status')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays services after successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: mockServices, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('service-card-Database')).toBeInTheDocument();
      expect(screen.getByTestId('service-card-Email Service')).toBeInTheDocument();
    });
  });

  it('displays last health check timestamp when available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: [], systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  it('shows success status when all services are operational', async () => {
    const allGoodServices = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Cache', configured: true, connected: true, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: allGoodServices, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Services Operational')).toBeInTheDocument();
      expect(screen.getByText('All systems are functioning normally.')).toBeInTheDocument();
    });
  });

  it('shows critical error status when required services have issues', async () => {
    const servicesWithRequiredIssues = [
      { name: 'Database', configured: false, connected: false, required: true, error: 'DB error' },
      { name: 'Cache', configured: true, connected: true, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithRequiredIssues, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Critical Service Issues')).toBeInTheDocument();
      expect(
        screen.getByText('One or more required services have issues that need attention.')
      ).toBeInTheDocument();
    });
  });

  it('shows warning status when only optional services have issues', async () => {
    const servicesWithOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false, error: 'Email error' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithOptionalIssues, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Optional Service Issues')).toBeInTheDocument();
      expect(screen.getByText('Some optional features may be unavailable.')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles non-ok response status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch status: Internal Server Error')).toBeInTheDocument();
    });
  });

  it('calls refresh when refresh button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: mockServices, systemInfo: mockSystemInfo }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: mockServices, systemInfo: mockSystemInfo }),
      });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh Status')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Status');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/system-status?refresh=true');
    });
  });

  it('shows return home button when no required issues exist', async () => {
    const servicesWithoutRequiredIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithoutRequiredIssues, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Return Home')).toBeInTheDocument();
    });
  });

  it('hides return home button when required issues exist', async () => {
    const servicesWithRequiredIssues = [
      { name: 'Database', configured: false, connected: false, required: true },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithRequiredIssues, systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Return Home')).not.toBeInTheDocument();
    });
  });

  it('handles empty services array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: [], systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Services Operational')).toBeInTheDocument();
    });
  });

  it('handles missing services in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ systemInfo: mockSystemInfo }),
    });

    render(
      <TestWrapper>
        <SystemStatusPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Services Operational')).toBeInTheDocument();
    });
  });
});
