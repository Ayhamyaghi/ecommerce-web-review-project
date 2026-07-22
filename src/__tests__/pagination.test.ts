import { describe, it, expect } from 'vitest';

// Pure pagination logic - extracted for testing without React
function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function totalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

describe('pagination logic', () => {
  const items = Array.from({ length: 35 }, (_, i) => i + 1);

  it('returns first page correctly', () => {
    expect(paginate(items, 1, 12)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('returns second page correctly', () => {
    expect(paginate(items, 2, 12)).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  });

  it('returns partial last page', () => {
    expect(paginate(items, 3, 12)).toHaveLength(11);
  });

  it('returns empty for page beyond total', () => {
    expect(paginate(items, 10, 12)).toHaveLength(0);
  });

  it('calculates total pages correctly', () => {
    expect(totalPages(35, 12)).toBe(3);
    expect(totalPages(36, 12)).toBe(3);
    expect(totalPages(37, 12)).toBe(4);
    expect(totalPages(0, 12)).toBe(0);
  });
});
