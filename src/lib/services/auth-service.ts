import { loadDb, saveDb, generateId } from '../db/store';
import { createSession, deleteSession, type SessionUser } from '../auth/session';
import { verifyPassword, createPasswordHash } from '../db/seed';
import { AuthenticationError, ConflictError } from '../errors';
import type { RegisterInput, LoginInput } from '../schemas/auth';

export interface AuthResult { user: SessionUser; token: string; }

export function registerUser(input: RegisterInput): AuthResult {
  const db = loadDb();
  if (db.users.find(u => u.email.toLowerCase() === input.email.toLowerCase())) throw new ConflictError('An account with this email already exists');
  const user = { id: generateId(), email: input.email.toLowerCase().trim(), name: input.name.trim(), passwordHash: createPasswordHash(input.password), role: 'USER' as const, createdAt: new Date().toISOString() };
  db.users.push(user);
  saveDb(db);
  const session = createSession(user);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: session.token };
}

export function loginUser(input: LoginInput): AuthResult {
  const db = loadDb();
  const user = db.users.find(u => u.email.toLowerCase() === input.email.toLowerCase());
  if (!user || !verifyPassword(input.password, user.passwordHash)) throw new AuthenticationError('Invalid email or password');
  const session = createSession(user);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: session.token };
}

export function logoutUser(token: string): void {
  deleteSession(token);
}
