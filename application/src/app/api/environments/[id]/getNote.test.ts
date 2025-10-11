import { getNote } from './getNote';
import { NextRequest } from 'next/server';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';

const mockFindById = jest.fn();
jest.mock('../../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => ({
    note: {
      findById: mockFindById,
    },
  }),
}));

describe('getNote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeParams(id: string) {
    return Promise.resolve({ id });
  }
  function makeRequest() {
    return {} as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: USER_ROLES.USER };

  it('returns note for user and status 200', async () => {
    const note = { id: 'n1', userId: 'user-1', title: 't', content: 'c', createdAt: 'now' };
    mockFindById.mockResolvedValue(note);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(mockFindById).toHaveBeenCalledWith('n1');
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual(note);
  });

  it('returns 404 if note not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'Note not found' });
  });

  it('returns 403 if user does not own note', async () => {
    const note = { id: 'n1', userId: 'other', title: 't', content: 'c', createdAt: 'now' };
    mockFindById.mockResolvedValue(note);
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 500 on db error', async () => {
    mockFindById.mockRejectedValue(new Error('fail'));
    const req = makeRequest();
    const res = await getNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to fetch note' });
  });
});
