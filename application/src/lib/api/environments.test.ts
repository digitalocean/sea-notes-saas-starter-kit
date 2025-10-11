import { EnvironmentsApiClient } from './environments';

// Mock fetch globally
global.fetch = jest.fn();

describe('EnvironmentsApiClient - Pagination', () => {
  let apiClient: EnvironmentsApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new EnvironmentsApiClient();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEnvironments pagination parameters', () => {
    it('calls API without query parameters when no pagination options provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments();

      expect(mockFetch).toHaveBeenCalledWith('/api/environments');
    });

    it('includes page parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ page: 2 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?page=2');
    });

    it('includes pageSize parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ pageSize: 20 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?pageSize=20');
    });

    it('includes search parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ search: 'meeting' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?search=meeting');
    });

    it('includes sortBy parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ sortBy: 'oldest' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?sortBy=oldest');
    });

    it('includes all parameters when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({
        page: 3,
        pageSize: 25,
        search: 'project',
        sortBy: 'name',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/environments?page=3&pageSize=25&search=project&sortBy=name'
      );
    });

    it('handles URL encoding for search parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ search: 'meeting environments & project' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?search=meeting+environments+%26+project');
    });
  });

  describe('getEnvironments response handling', () => {
    it('returns paginated environments response', async () => {
      const mockEnvironmentsResponse = {
        environments: [
          {
            id: '1',
            userId: 'user1',
            name: 'Test Environment',
            type: 'ROS2_HUMBLE',
            status: 'RUNNING',
            connectionURL: 'http://localhost:8080',
            createdAt: '2025-06-01T12:00:00Z',
          },
        ],
        total: 15,
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockEnvironmentsResponse),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await apiClient.getEnvironments({ page: 1, pageSize: 10 });

      expect(result).toEqual(mockEnvironmentsResponse);
      expect(result.environments).toHaveLength(1);
      expect(result.total).toBe(15);
    });

    it('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(apiClient.getEnvironments({ page: 1 })).rejects.toThrow('Failed to fetch environments');
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.getEnvironments({ page: 1 })).rejects.toThrow('Network error');
    });
  });

  describe('Edge cases', () => {
    it('handles zero page number', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ page: 0 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?page=0');
    });

    it('handles negative page number', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ page: -1 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?page=-1');
    });

    it('handles very large page size', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ pageSize: 1000 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?pageSize=1000');
    });

    it('handles empty search string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ search: '' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?search=');
    });

    it('handles special characters in search', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      await apiClient.getEnvironments({ search: '!@#$%^&*()' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?search=%21%40%23%24%25%5E%26*%28%29');
    });
  });

  describe('Query parameter combinations', () => {
    it('handles only page parameter', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ page: 5 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?page=5');
    });

    it('handles page and pageSize only', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ page: 2, pageSize: 15 });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?page=2&pageSize=15');
    });

    it('handles search and sortBy only', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({ search: 'test', sortBy: 'name' });

      expect(mockFetch).toHaveBeenCalledWith('/api/environments?search=test&sortBy=name');
    });

    it('preserves parameter order in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ environments: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getEnvironments({
        page: 1,
        pageSize: 10,
        search: 'test',
        sortBy: 'newest',
      });

      // The order should match the order they're added in the implementation
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/environments?page=1&pageSize=10&search=test&sortBy=newest'
      );
    });
  });
});
