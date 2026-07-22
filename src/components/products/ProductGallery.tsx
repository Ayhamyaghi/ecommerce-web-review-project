'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductImage from './ProductImage';
export default function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center"><ProductImage src="" alt={productName} className="h-full w-full rounded-lg" /></div>;
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"><AnimatePresence mode="wait"><motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0"><ProductImage src={images[idx]} alt={`${productName} - Image ${idx + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} className="rounded-lg" /></motion.div></AnimatePresence></div>
      {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{images.map((img, i) => <button key={i} onClick={() => setIdx(i)} aria-label={`View image ${i+1}`} className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${i === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}><ProductImage src={img} alt={`${productName} thumb ${i+1}`} fill sizes="64px" className="rounded-md" /></button>)}</div>}
    </div>
  );
}
