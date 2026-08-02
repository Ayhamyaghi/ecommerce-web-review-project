import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { createPasswordHash } from '@/lib/db/seed';
import { registerUser, loginUser, logoutUser } from '@/lib/services/auth-service';
import { ConflictError, AuthenticationError } from '@/lib/errors';

beforeEach(() => {
  resetDb();
});

describe('registerUser', () => {
  it('registers a new user and returns auth result', () => {
    const result = registerUser({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    expect(result.user.name).toBe('Alice');
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.role).toBe('USER');
    expect(result.token).toBeTruthy();
  });

  it('stores the user in the database', () => {
    registerUser({ name: 'Bob', email: 'bob@example.com', password: 'password' });
    const db = loadDb();
    expect(db.users.find(u => u.email === 'bob@example.com')).toBeTruthy();
  });

  it('creates a session for the new user', () => {
    const result = registerUser({ name: 'Charlie', email: 'charlie@example.com', password: 'pass123' });
    const db = loadDb();
    expect(db.sessions.find(s => s.token === result.token)).toBeTruthy();
  });

  it('lowercases and trims email', () => {
    const result = registerUser({ name: 'Alice', email: '  ALICE@EXAMPLE.COM  ', password: 'secret123' });
    expect(result.user.email).toBe('alice@example.com');
  });

  it('trims name', () => {
    const result = registerUser({ name: '  Alice  ', email: 'alice@example.com', password: 'secret123' });
    expect(result.user.name).toBe('Alice');
  });

  it('throws ConflictError for duplicate email', () => {
    registerUser({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    expect(() => registerUser({ name: 'Alice2', email: 'alice@example.com', password: 'other' }))
      .toThrow(ConflictError);
  });

  it('throws ConflictError for duplicate email case-insensitively', () => {
    registerUser({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    expect(() => registerUser({ name: 'Alice2', email: 'ALICE@EXAMPLE.COM', password: 'other' }))
      .toThrow(ConflictError);
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    // Seed a user manually
    const db = loadDb();
    db.users.push({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: createPasswordHash('correct-password'),
      role: 'USER',
      createdAt: new Date().toISOString(),
    });
    saveDb(db);
  });

  it('logs in with correct credentials', () => {
    const result = loginUser({ email: 'test@example.com', password: 'correct-password' });
    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBeTruthy();
  });

  it('login is case-insensitive on email', () => {
    const result = loginUser({ email: 'TEST@EXAMPLE.COM', password: 'correct-password' });
    expect(result.user.email).toBe('test@example.com');
  });

  it('throws AuthenticationError for wrong password', () => {
    expect(() => loginUser({ email: 'test@example.com', password: 'wrong' }))
      .toThrow(AuthenticationError);
  });

  it('throws AuthenticationError for non-existent email', () => {
    expect(() => loginUser({ email: 'nobody@example.com', password: 'anything' }))
      .toThrow(AuthenticationError);
  });

  it('AuthenticationError message does not reveal whether email exists', () => {
    try {
      loginUser({ email: 'nobody@example.com', password: 'anything' });
    } catch (e) {
      expect((e as AuthenticationError).message).toBe('Invalid email or password');
    }
    try {
      loginUser({ email: 'test@example.com', password: 'wrong' });
    } catch (e) {
      expect((e as AuthenticationError).message).toBe('Invalid email or password');
    }
  });
});

describe('logoutUser', () => {
  it('removes the session token from the database', () => {
    const result = registerUser({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    logoutUser(result.token);
    const db = loadDb();
    expect(db.sessions.find(s => s.token === result.token)).toBeUndefined();
  });

  it('does not throw for non-existent token', () => {
    expect(() => logoutUser('non-existent-token')).not.toThrow();
  });
});
