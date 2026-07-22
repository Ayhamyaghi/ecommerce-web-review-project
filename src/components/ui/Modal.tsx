'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; }
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!isOpen) return; const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; }; }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div ref={overlayRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            {title && <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">{title}</h2><button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
