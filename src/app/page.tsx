'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero from '@/components/layout/Hero';
import ProductImage from '@/components/products/ProductImage';
import Badge from '@/components/ui/Badge';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  lowStockThreshold: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function HomePage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort !== 'relevance') params.set('sort', sort);
      params.set('page', String(page));
      params.set('pageSize', '12');

      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setCategories(json.data.categories);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  function handleCategoryChange(cat: string | null) {
    setCategory(cat);
    setPage(1);
  }

  async function handleAddToCart(productId: string, productName: string) {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const json = await res.json();
      if (json.success) {
        addToast(`${productName} added to cart`, 'success');
      } else {
        addToast(json.error?.message || 'Failed to add to cart', 'error');
      }
    } catch {
      addToast('Failed to add to cart', 'error');
    }
  }

  return (
    <div>
      <Hero />

      <div id="products" className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0 space-y-6" aria-label="Filters">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Category</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full rounded px-3 py-1.5 text-left text-sm ${!category ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full rounded px-3 py-1.5 text-left text-sm ${category === cat ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:max-w-sm">
                <div className="relative">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                aria-label="Sort products"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              {total} product{total !== 1 ? 's' : ''} found
            </p>

            {loading ? (
              <div className="mt-4"><ProductGridSkeleton count={8} /></div>
            ) : products.length === 0 ? (
              <div className="mt-12 text-center">
                <p className="text-gray-500">No products found.</p>
                <button onClick={() => { setSearch(''); setCategory(null); setSort('relevance'); setPage(1); }} className="mt-2 text-sm text-blue-600 hover:underline">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
                    >
                      <Link href={`/products/${product.slug}`} className="block relative">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <ProductImage
                            src={product.images[0] || ''}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                        {product.stock === 0 && <Badge variant="danger" className="absolute left-2 top-2">Out of Stock</Badge>}
                        {product.stock > 0 && product.stock <= product.lowStockThreshold && <Badge variant="warning" className="absolute left-2 top-2">Only {product.stock} left</Badge>}
                        {product.compareAtPrice && product.compareAtPrice > product.price && <Badge variant="success" className="absolute right-2 top-2">Sale</Badge>}
                      </Link>
                      <div className="flex flex-1 flex-col p-4">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{product.category}</span>
                        <Link href={`/products/${product.slug}`} className="mt-1 block">
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product.id, product.name)}
                          disabled={product.stock === 0}
                          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-8 flex justify-center gap-1" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let p: number;
                      if (totalPages <= 7) p = i + 1;
                      else if (page <= 4) p = i + 1;
                      else if (page >= totalPages - 3) p = totalPages - 6 + i;
                      else p = page - 3 + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          aria-current={p === page ? 'page' : undefined}
                          className={`min-w-[2rem] rounded px-2 py-1.5 text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
