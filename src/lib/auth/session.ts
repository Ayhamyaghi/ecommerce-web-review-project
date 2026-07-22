import { cookies } from 'next/headers';
import { loadDb, saveDb, generateId, type DbUser, type DbSession } from '../db/store';
import { AuthenticationError, AuthorizationError } from '../errors';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export function createSession(user: DbUser): DbSession {
  const db = loadDb();
  const session: DbSession = { token: generateId() + '-' + generateId(), userId: user.id, expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString() };
  db.sessions.push(session);
  const now = new Date().toISOString();
  db.sessions = db.sessions.filter(s => s.expiresAt > now || s.token === session.token);
  saveDb(db);
  return session;
}

export function deleteSession(token: string): void {
  const db = loadDb();
  db.sessions = db.sessions.filter(s => s.token !== token);
  saveDb(db);
}

export function getSessionUser(token: string | null): SessionUser | null {
  if (!token) return null;
  const db = loadDb();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) { db.sessions = db.sessions.filter(s => s.token !== token); saveDb(db); return null; }
  const user = db.users.find(u => u.id === session.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value ?? null;
  return getSessionUser(token);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionFromCookies();
  if (!user) throw new AuthenticationError();
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') throw new AuthorizationError('Admin access required');
  return user;
}
