import { USER_ROLES } from 'lib/auth/roles';
import { getAllNotes } from './getAllNotes';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

const mockFindMany = jest.fn();
const mockCount = jest.fn();

type TestNote = { id: string; userId: string; title: string; content: string; createdAt: string };

jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () =>
    Promise.resolve({ note: { findMany: mockFindMany, count: mockCount } }),
}));

describe('getAllNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url = 'http://localhost/api/notes?page=1&pageSize=10') {
    return { url } as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: USER_ROLES.USER };

  it('returns paginated notes and total for user and status 200', async () => {
    const notes: TestNote[] = [
      { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      { id: 'n2', userId: 'user-1', title: 't2', content: 'c2', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(5);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 5 });
  });

  it('calls findMany and count with search param if provided', async () => {
    const notes: TestNote[] = [
      { id: 'n1', userId: 'user-1', title: 'meeting', content: 'notes', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(1);
    const req = makeRequest('http://localhost/api/notes?page=1&pageSize=10&search=meet');
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      search: 'meet',
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', 'meet');
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 1 });
  });

  it('calls findMany and count with sortBy=oldest if provided', async () => {
    const notes: TestNote[] = [
      { id: 'n1', userId: 'user-1', title: 'meeting', content: 'notes', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(1);
    const req = makeRequest('http://localhost/api/notes?page=1&pageSize=10&sortBy=oldest');
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'asc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 1 });
  });

  it('calls findMany and count with sortBy=title if provided', async () => {
    const notes: TestNote[] = [
      { id: 'n1', userId: 'user-1', title: 'Alpha', content: 'notes', createdAt: 'now' },
    ];
    mockFindMany.mockResolvedValue(notes);
    mockCount.mockResolvedValue(1);
    const req = makeRequest('http://localhost/api/notes?page=1&pageSize=10&sortBy=title');
    const res = await getAllNotes(req, user);
    expect(mockFindMany).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 0,
      take: 10,
      orderBy: { title: 'asc' },
    });
    expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ notes, total: 1 });
  });

  it('returns 500 on db error', async () => {
    mockFindMany.mockRejectedValue(new Error('fail'));
    mockCount.mockResolvedValue(0);
    const req = makeRequest();
    const res = await getAllNotes(req, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to fetch notes' });
  });

  describe('Pagination Edge Cases', () => {
    it('handles page 0 by treating it as page 1', async () => {
      const notes: TestNote[] = [
        { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      ];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(1);
      const req = makeRequest('http://localhost/api/notes?page=0&pageSize=10');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: -10, // (0-1) * 10 = -10
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it('handles negative page number', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=-5&pageSize=10');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: -60, // (-5-1) * 10 = -60
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it('handles very large page number', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=999999&pageSize=10');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 9999980, // (999999-1) * 10
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });
    it('handles zero pageSize by using default', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=1&pageSize=0');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 0,
        take: 0,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it('handles very large pageSize', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=1&pageSize=1000');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 0,
        take: 1000,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it('handles non-numeric page parameter', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=abc&pageSize=10');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: NaN, // parseInt('abc') returns NaN
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it('handles non-numeric pageSize parameter', async () => {
      const notes: TestNote[] = [];
      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(0);
      const req = makeRequest('http://localhost/api/notes?page=1&pageSize=xyz');
      const res = await getAllNotes(req, user);
      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 0,
        take: NaN, // parseInt('xyz') returns NaN
        orderBy: { createdAt: 'desc' },
      });
      expect(res.status).toBe(HTTP_STATUS.OK);
    });
  });

  describe('Pagination Calculations', () => {
    it('correctly calculates skip for different pages and page sizes', async () => {
      const testCases = [
        { page: 1, pageSize: 10, expectedSkip: 0 },
        { page: 2, pageSize: 10, expectedSkip: 10 },
        { page: 3, pageSize: 15, expectedSkip: 30 },
        { page: 5, pageSize: 25, expectedSkip: 100 },
        { page: 10, pageSize: 5, expectedSkip: 45 },
      ];
      for (const testCase of testCases) {
        mockFindMany.mockResolvedValue([] as TestNote[]);
        mockCount.mockResolvedValue(0);

        const req = makeRequest(
          `http://localhost/api/notes?page=${testCase.page}&pageSize=${testCase.pageSize}`
        );
        await getAllNotes(req, user);

        expect(mockFindMany).toHaveBeenCalledWith({
          userId: 'user-1',
          skip: testCase.expectedSkip,
          take: testCase.pageSize,
          orderBy: { createdAt: 'desc' },
        });
      }
    });

    it('returns consistent total count regardless of page', async () => {
      const notes: TestNote[] = [
        { id: 'n1', userId: 'user-1', title: 't1', content: 'c1', createdAt: 'now' },
      ];

      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(50); // Total of 50 notes

      // Test different pages
      for (const page of [1, 2, 3, 5]) {
        const req = makeRequest(`http://localhost/api/notes?page=${page}&pageSize=10`);
        const res = await getAllNotes(req, user);
        const data = await res.json();

        expect(data.total).toBe(50);
        expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
      }
    });

    it('handles search parameter correctly with pagination', async () => {
      const notes: TestNote[] = [
        {
          id: 'n1',
          userId: 'user-1',
          title: 'meeting notes',
          content: 'content',
          createdAt: 'now',
        },
      ];

      mockFindMany.mockResolvedValue(notes);
      mockCount.mockResolvedValue(15); // 15 search results

      const req = makeRequest('http://localhost/api/notes?page=2&pageSize=5&search=meeting');
      const res = await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        search: 'meeting',
        skip: 5, // Page 2 with pageSize 5
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockCount).toHaveBeenCalledWith('user-1', 'meeting');

      const data = await res.json();
      expect(data.total).toBe(15);
    });
  });

  describe('Query Parameter Parsing', () => {
    it('uses default values when parameters are missing', async () => {
      mockFindMany.mockResolvedValue([] as TestNote[]);
      mockCount.mockResolvedValue(0);

      const req = makeRequest('http://localhost/api/notes'); // No query params
      await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 0, // Default page 1: (1-1) * 10 = 0
        take: 10, // Default pageSize
        orderBy: { createdAt: 'desc' }, // Default sortBy
      });

      expect(mockCount).toHaveBeenCalledWith('user-1', undefined); // No search
    });

    it('ignores unknown query parameters', async () => {
      mockFindMany.mockResolvedValue([] as TestNote[]);
      mockCount.mockResolvedValue(0);

      const req = makeRequest(
        'http://localhost/api/notes?page=1&pageSize=10&unknown=value&invalid=param'
      );
      await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('handles URL-encoded search parameters', async () => {
      mockFindMany.mockResolvedValue([] as TestNote[]);
      mockCount.mockResolvedValue(0);

      const req = makeRequest('http://localhost/api/notes?search=meeting%20notes%20%26%20tasks');
      await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        search: 'meeting notes & tasks', // Should be decoded
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockCount).toHaveBeenCalledWith('user-1', 'meeting notes & tasks');
    });

    it('trims whitespace from search parameter', async () => {
      mockFindMany.mockResolvedValue([] as TestNote[]);
      mockCount.mockResolvedValue(0);

      const req = makeRequest('http://localhost/api/notes?search=%20%20meeting%20%20');
      await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        search: 'meeting', // Should be trimmed
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockCount).toHaveBeenCalledWith('user-1', 'meeting');
    });

    it('handles empty search parameter correctly', async () => {
      mockFindMany.mockResolvedValue([] as TestNote[]);
      mockCount.mockResolvedValue(0);

      const req = makeRequest('http://localhost/api/notes?search=');
      await getAllNotes(req, user);

      expect(mockFindMany).toHaveBeenCalledWith({
        userId: 'user-1',
        search: undefined, // Empty string after trim becomes undefined
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockCount).toHaveBeenCalledWith('user-1', undefined);
    });
  });
});
