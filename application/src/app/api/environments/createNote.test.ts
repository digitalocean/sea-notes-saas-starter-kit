import { createNote } from './createNote';
import { NextRequest } from 'next/server';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';

const mockCreate = jest.fn();
jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve({ note: { create: mockCreate } }),
}));

describe('createNote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(body: Record<string, unknown>) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  const user = { id: 'user-1', role: USER_ROLES.USER };

  it('creates a note and returns 201', async () => {
    const note = { id: 'n1', userId: 'user-1', title: 't', content: 'c', createdAt: 'now' };
    mockCreate.mockResolvedValue(note);
    const req = makeRequest({ title: 't', content: 'c' });
    const res = await createNote(req, user);
    expect(mockCreate).toHaveBeenCalledWith({ userId: 'user-1', title: 't', content: 'c' });
    expect(res.status).toBe(HTTP_STATUS.CREATED);
    expect(await res.json()).toEqual(note);
  });

  it('returns 400 if title or content missing', async () => {
    const req = makeRequest({ title: '', content: '' });
    const res = await createNote(req, user);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'Title and content are required' });
  });

  it('returns 500 on db error', async () => {
    mockCreate.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ title: 't', content: 'c' });
    const res = await createNote(req, user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Failed to create note' });
  });
});
