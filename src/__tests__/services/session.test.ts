import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { createSession, deleteSession, getSessionUser } from '@/lib/auth/session';
import type { DbUser } from '@/lib/db/store';

const mockUser: DbUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hash',
  role: 'USER',
  createdAt: new Date().toISOString(),
};

const adminUser: DbUser = {
  id: 'user-admin',
  email: 'admin@example.com',
  name: 'Admin',
  passwordHash: 'hash',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  resetDb();
  const db = loadDb();
  db.users.push(mockUser, adminUser);
  saveDb(db);
});

describe('createSession', () => {
  it('creates a session with a token', () => {
    const session = createSession(mockUser);
    expect(session.token).toBeTruthy();
    expect(session.userId).toBe('user-1');
    expect(session.expiresAt).toBeTruthy();
  });

  it('stores session in the database', () => {
    const session = createSession(mockUser);
    const db = loadDb();
    expect(db.sessions.find(s => s.token === session.token)).toBeTruthy();
  });

  it('sets expiration in the future', () => {
    const session = createSession(mockUser);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('cleans up expired sessions during creation', () => {
    const db = loadDb();
    db.sessions.push({ token: 'old-token', userId: 'user-1', expiresAt: '2020-01-01T00:00:00Z' });
    saveDb(db);
    createSession(mockUser);
    const updatedDb = loadDb();
    expect(updatedDb.sessions.find(s => s.token === 'old-token')).toBeUndefined();
  });
});

describe('deleteSession', () => {
  it('removes the session from the database', () => {
    const session = createSession(mockUser);
    deleteSession(session.token);
    const db = loadDb();
    expect(db.sessions.find(s => s.token === session.token)).toBeUndefined();
  });

  it('does not throw for missing token', () => {
    expect(() => deleteSession('non-existent')).not.toThrow();
  });
});

describe('getSessionUser', () => {
  it('returns user for valid session', () => {
    const session = createSession(mockUser);
    const user = getSessionUser(session.token);
    expect(user).not.toBeNull();
    expect(user!.id).toBe('user-1');
    expect(user!.email).toBe('test@example.com');
    expect(user!.name).toBe('Test User');
    expect(user!.role).toBe('USER');
  });

  it('returns null for null token', () => {
    expect(getSessionUser(null)).toBeNull();
  });

  it('returns null for invalid token', () => {
    expect(getSessionUser('fake-token')).toBeNull();
  });

  it('returns null for expired session', () => {
    const db = loadDb();
    db.sessions.push({ token: 'expired-token', userId: 'user-1', expiresAt: '2020-01-01T00:00:00Z' });
    saveDb(db);
    expect(getSessionUser('expired-token')).toBeNull();
  });

  it('cleans up expired session on access', () => {
    const db = loadDb();
    db.sessions.push({ token: 'expired-token', userId: 'user-1', expiresAt: '2020-01-01T00:00:00Z' });
    saveDb(db);
    getSessionUser('expired-token');
    const updatedDb = loadDb();
    expect(updatedDb.sessions.find(s => s.token === 'expired-token')).toBeUndefined();
  });

  it('returns null if user was deleted but session exists', () => {
    const session = createSession(mockUser);
    const db = loadDb();
    db.users = db.users.filter(u => u.id !== 'user-1');
    saveDb(db);
    expect(getSessionUser(session.token)).toBeNull();
  });

  it('returns admin role for admin user', () => {
    const session = createSession(adminUser);
    const user = getSessionUser(session.token);
    expect(user!.role).toBe('ADMIN');
  });
});
