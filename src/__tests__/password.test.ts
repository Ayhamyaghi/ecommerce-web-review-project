import { describe, it, expect } from 'vitest';
import { verifyPassword, createPasswordHash } from '@/lib/db/seed';

describe('createPasswordHash', () => {
  it('produces a deterministic hash', () => {
    const hash1 = createPasswordHash('password123');
    const hash2 = createPasswordHash('password123');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different passwords', () => {
    const hash1 = createPasswordHash('password1');
    const hash2 = createPasswordHash('password2');
    expect(hash1).not.toBe(hash2);
  });

  it('returns a string starting with local_hash_', () => {
    const hash = createPasswordHash('test');
    expect(hash).toMatch(/^local_hash_/);
  });
});

describe('verifyPassword', () => {
  it('returns true for correct password', () => {
    const hash = createPasswordHash('correct-password');
    expect(verifyPassword('correct-password', hash)).toBe(true);
  });

  it('returns false for wrong password', () => {
    const hash = createPasswordHash('correct-password');
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('returns false for empty password against a valid hash', () => {
    const hash = createPasswordHash('notempty');
    expect(verifyPassword('', hash)).toBe(false);
  });

  it('returns false for arbitrary hash string', () => {
    expect(verifyPassword('password', 'arbitrary_string')).toBe(false);
  });
});
