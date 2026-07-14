'use client';

import { categories } from '@/lib/products';

interface FilterSidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onPriceApply: () => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  onPriceApply,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <aside className="space-y-6" aria-label="Product filters">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Category</h3>
        <ul className="mt-2 space-y-1" role="listbox" aria-label="Filter by category">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              role="option"
              aria-selected={selectedCategory === null}
              className={`w-full rounded px-3 py-1.5 text-left text-sm ${
                selectedCategory === null
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => onCategoryChange(cat)}
                role="option"
                aria-selected={selectedCategory === cat}
                className={`w-full rounded px-3 py-1.5 text-left text-sm ${
                  selectedCategory === cat
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={onPriceApply}
          className="mt-2 w-full rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Apply Price
        </button>
      </div>

      <button
        onClick={onClearFilters}
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
