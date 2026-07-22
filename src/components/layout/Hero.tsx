'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-3">Quality products, fast delivery</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">Discover products you&apos;ll love</h1>
          <p className="mt-4 text-lg text-blue-100 max-w-lg">Shop from our curated collection across Electronics, Clothing, Home & Kitchen, and more. Free shipping on orders over $50.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="#products" className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-colors">Shop Now</Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-blue-200"><span>Free shipping over $50</span><span>Easy returns</span><span>Secure checkout</span></div>
        </motion.div>
      </div>
    </section>
  );
}
