import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs debug messages', () => {
    logger.debug('test debug');
    expect(consoleSpy.debug).toHaveBeenCalledOnce();
    const arg = consoleSpy.debug.mock.calls[0][0] as string;
    expect(arg).toContain('DEBUG');
    expect(arg).toContain('test debug');
  });

  it('logs info messages', () => {
    logger.info('test info');
    expect(consoleSpy.info).toHaveBeenCalledOnce();
    const arg = consoleSpy.info.mock.calls[0][0] as string;
    expect(arg).toContain('INFO');
    expect(arg).toContain('test info');
  });

  it('logs warn messages', () => {
    logger.warn('test warn');
    expect(consoleSpy.warn).toHaveBeenCalledOnce();
    const arg = consoleSpy.warn.mock.calls[0][0] as string;
    expect(arg).toContain('WARN');
    expect(arg).toContain('test warn');
  });

  it('logs error messages', () => {
    logger.error('test error');
    expect(consoleSpy.error).toHaveBeenCalledOnce();
    const arg = consoleSpy.error.mock.calls[0][0] as string;
    expect(arg).toContain('ERROR');
    expect(arg).toContain('test error');
  });

  it('includes ISO timestamp in output', () => {
    logger.info('timestamp test');
    const arg = consoleSpy.info.mock.calls[0][0] as string;
    expect(arg).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('serialises context as JSON', () => {
    logger.info('with context', { userId: 42, action: 'login' });
    const arg = consoleSpy.info.mock.calls[0][0] as string;
    expect(arg).toContain('"userId":42');
    expect(arg).toContain('"action":"login"');
  });

  it('omits context when not provided', () => {
    logger.info('no context');
    const arg = consoleSpy.info.mock.calls[0][0] as string;
    expect(arg).not.toContain('{');
  });
});
