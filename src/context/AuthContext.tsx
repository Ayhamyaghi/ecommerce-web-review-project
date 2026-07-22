'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
export interface User { id: string; email: string; name: string; role: 'USER' | 'ADMIN'; }
interface AuthContextValue { user: User | null; isLoading: boolean; isAuthenticated: boolean; isAdmin: boolean; login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>; register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>; logout: () => Promise<void>; refresh: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => { try { const res = await fetch('/api/auth/me'); const json = await res.json(); setUser(json.success && json.data ? json.data : null); } catch { setUser(null); } finally { setIsLoading(false); } }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh(); }, [refresh]);
  const login = useCallback(async (email: string, password: string) => { try { const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const json = await res.json(); if (json.success) { setUser(json.data); return { success: true }; } return { success: false, error: json.error?.message || 'Login failed' }; } catch { return { success: false, error: 'Network error' }; } }, []);
  const register = useCallback(async (name: string, email: string, password: string) => { try { const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) }); const json = await res.json(); if (json.success) { setUser(json.data); return { success: true }; } return { success: false, error: json.error?.message || 'Registration failed' }; } catch { return { success: false, error: 'Network error' }; } }, []);
  const logout = useCallback(async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); } finally { setUser(null); } }, []);
  return <AuthContext value={{ user, isLoading, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN', login, register, logout, refresh }}>{children}</AuthContext>;
}
export function useAuth(): AuthContextValue { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
