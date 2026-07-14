'use client';

import { useState, useMemo } from 'react';
import { products } from '@/lib/products';
import { applyFilters } from '@/lib/filter-utils';
import { SortOption } from '@/lib/types';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import FilterSidebar from '@/components/FilterSidebar';
import SortSelect from '@/components/SortSelect';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [appliedPriceRange, setAppliedPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  const filteredProducts = useMemo(
    () =>
      applyFilters(products, {
        search,
        category,
        priceRange: appliedPriceRange,
        sort,
      }),
    [search, category, appliedPriceRange, sort],
  );

  function handlePriceApply() {
    const min = priceMin ? Math.round(parseFloat(priceMin) * 100) : 0;
    const max = priceMax ? Math.round(parseFloat(priceMax) * 100) : Infinity;
    if (min >= 0 && max >= min) {
      setAppliedPriceRange({ min, max });
    }
  }

  function handleClearFilters() {
    setSearch('');
    setCategory(null);
    setSort('relevance');
    setPriceMin('');
    setPriceMax('');
    setAppliedPriceRange(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-56">
          <FilterSidebar
            selectedCategory={category}
            onCategoryChange={setCategory}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
            onPriceApply={handlePriceApply}
            onClearFilters={handleClearFilters}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:max-w-sm">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <SortSelect value={sort} onChange={setSort} />
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
          <div className="mt-4">
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}
