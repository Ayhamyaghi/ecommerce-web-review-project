'use client';
import { useState } from 'react';
import Image from 'next/image';
interface Props { src: string; alt: string; fill?: boolean; width?: number; height?: number; sizes?: string; priority?: boolean; className?: string; }
export default function ProductImage({ src, alt, fill, width, height, sizes, priority = false, className = '' }: Props) {
  const [err, setErr] = useState(false);
  if (!src || err) return <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`} role="img" aria-label={alt}><svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg></div>;
  if (fill) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} onError={() => setErr(true)} />;
  return <Image src={src} alt={alt} width={width || 600} height={height || 600} sizes={sizes} priority={priority} className={className} onError={() => setErr(true)} />;
}
