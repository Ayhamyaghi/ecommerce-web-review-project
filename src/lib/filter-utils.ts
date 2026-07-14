import { FilterState, Product, SortOption } from './types';

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower),
  );
}

export function filterByCategory(
  products: Product[],
  category: string | null,
): Product[] {
  if (!category) return products;
  return products.filter((p) => p.category === category);
}

export function filterByPriceRange(
  products: Product[],
  min: number,
  max: number,
): Product[] {
  return products.filter((p) => p.price >= min && p.price <= max);
}

export function sortProducts(
  products: Product[],
  sort: SortOption,
): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'relevance':
    default:
      return sorted;
  }
}

export function applyFilters(
  products: Product[],
  filters: FilterState,
): Product[] {
  let result = searchProducts(products, filters.search);
  result = filterByCategory(result, filters.category);
  if (filters.priceRange) {
    result = filterByPriceRange(
      result,
      filters.priceRange.min,
      filters.priceRange.max,
    );
  }
  result = sortProducts(result, filters.sort);
  return result;
}
