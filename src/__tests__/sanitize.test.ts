import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  sanitizeName,
  sanitizeEmail,
  sanitizeText,
  sanitizePromoCode,
  sanitizePhone,
  sanitizePostalCode,
} from '@/lib/sanitize';

describe('stripHtml', () => {
  it('removes basic HTML tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('removes nested tags', () => {
    expect(stripHtml('<div><strong>Bold</strong> text</div>')).toBe('Bold text');
  });

  it('removes script tags', () => {
    expect(stripHtml('<script>alert("xss")</script>')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('Hello world')).toBe('Hello world');
  });

  it('trims whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello');
  });
});

describe('sanitizeName', () => {
  it('allows letters, digits, spaces, hyphens, apostrophes and dots', () => {
    expect(sanitizeName("O'Brien-Smith Jr.")).toBe("O'Brien-Smith Jr.");
  });

  it('strips HTML from name', () => {
    expect(sanitizeName('<script>alert(1)</script>Alice')).toBe('Alice');
  });

  it('removes special characters that are not allowed', () => {
    expect(sanitizeName('Alice<>@#$%')).toBe('Alice');
  });

  it('truncates to 200 characters', () => {
    const long = 'A'.repeat(300);
    expect(sanitizeName(long)).toHaveLength(200);
  });
});

describe('sanitizeEmail', () => {
  it('lowercases and trims', () => {
    expect(sanitizeEmail('  TEST@Example.COM  ')).toBe('test@example.com');
  });

  it('truncates to 254 characters', () => {
    const long = 'a'.repeat(260) + '@b.com';
    expect(sanitizeEmail(long).length).toBeLessThanOrEqual(254);
  });
});

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<b>bold</b> text')).toBe('bold text');
  });

  it('respects custom maxLength', () => {
    expect(sanitizeText('Hello world', 5)).toBe('Hello');
  });

  it('defaults to 2000 character limit', () => {
    const long = 'A'.repeat(3000);
    expect(sanitizeText(long)).toHaveLength(2000);
  });
});

describe('sanitizePromoCode', () => {
  it('uppercases and removes non-alphanumeric characters', () => {
    expect(sanitizePromoCode('save-10!')).toBe('SAVE10');
  });

  it('trims whitespace', () => {
    expect(sanitizePromoCode('  SAVE10  ')).toBe('SAVE10');
  });

  it('truncates to 20 characters', () => {
    expect(sanitizePromoCode('A'.repeat(30))).toHaveLength(20);
  });
});

describe('sanitizePhone', () => {
  it('allows digits, spaces, +, -, (, )', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
  });

  it('removes disallowed characters', () => {
    expect(sanitizePhone('555abc123')).toBe('555123');
  });

  it('truncates to 20 characters', () => {
    expect(sanitizePhone('1'.repeat(30))).toHaveLength(20);
  });
});

describe('sanitizePostalCode', () => {
  it('uppercases and allows alphanumeric, hyphen, space', () => {
    expect(sanitizePostalCode('sw1a 1aa')).toBe('SW1A 1AA');
  });

  it('removes disallowed characters', () => {
    expect(sanitizePostalCode('90210!@#')).toBe('90210');
  });

  it('truncates to 10 characters', () => {
    expect(sanitizePostalCode('A'.repeat(15))).toHaveLength(10);
  });
});
