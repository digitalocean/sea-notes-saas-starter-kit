import { editNote } from './editNote';
import { NextRequest } from 'next/server';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';

const mockFindById = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => ({
    note: {
      findById: mockFindById,
      update: mockUpdate,
    },
  }),
}));

describe('editNote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeParams(id: string) {
    return Promise.resolve({ id });
  }
  function makeRequest(body: Record<string, unknown>) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: USER_ROLES.USER };
  const note = { id: 'n1', userId: 'user-1', title: 't', content: 'c', createdAt: 'now' };

  it('updates note and returns 200', async () => {
    mockFindById.mockResolvedValue(note);
    mockUpdate.mockResolvedValue({ ...note, title: 'new' });
    const req = makeRequest({ title: 'new' });
    const res = await editNote(req, user, makeParams('n1'));
    expect(mockFindById).toHaveBeenCalledWith('n1');
    expect(mockUpdate).toHaveBeenCalledWith('n1', { title: 'new' });
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ ...note, title: 'new' });
  });

  it('returns 400 if no fields provided', async () => {
    const req = makeRequest({});
    const res = await editNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({
      error: 'At least one field (title or content) is required',
    });
  });

  it('returns 404 if note not found', async () => {
    mockFindById.mockResolvedValue(null);
    const req = makeRequest({ title: 'new' });
    const res = await editNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'Note not found' });
  });

  it('returns 403 if user does not own note', async () => {
    mockFindById.mockResolvedValue({ ...note, userId: 'other' });
    const req = makeRequest({ title: 'new' });
    const res = await editNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 500 on db error', async () => {
    mockFindById.mockResolvedValue(note);
    mockUpdate.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ title: 'new' });
    const res = await editNote(req, user, makeParams('n1'));
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to update note' });
  });
});
