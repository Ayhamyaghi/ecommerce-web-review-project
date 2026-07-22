'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { WishlistItem } from '@/lib/types';

const STORAGE_KEY = 'ecommerce-wishlist';

interface WishlistState {
  items: WishlistItem[];
  isHydrated: boolean;
}

type WishlistAction =
  | { type: 'LOAD'; items: WishlistItem[] }
  | { type: 'ADD'; productId: string }
  | { type: 'REMOVE'; productId: string };

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'LOAD':
      return { items: action.items, isHydrated: true };
    case 'ADD':
      if (state.items.some((i) => i.productId === action.productId)) return state;
      return {
        ...state,
        items: [...state.items, { productId: action.productId, addedAt: new Date().toISOString() }],
      };
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
  }
}

interface WishlistContextValue {
  items: WishlistItem[];
  isHydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isHydrated: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const items = parsed.filter(
            (i): i is WishlistItem =>
              typeof i === 'object' &&
              i !== null &&
              typeof (i as WishlistItem).productId === 'string' &&
              typeof (i as WishlistItem).addedAt === 'string',
          );
          dispatch({ type: 'LOAD', items });
          return;
        }
      }
    } catch {
      // ignore
    }
    dispatch({ type: 'LOAD', items: [] });
  }, []);

  useEffect(() => {
    if (!state.isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items, state.isHydrated]);

  const isInWishlist = useCallback(
    (productId: string) => state.items.some((i) => i.productId === productId),
    [state.items],
  );

  const addToWishlist = useCallback((productId: string) => {
    dispatch({ type: 'ADD', productId });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      if (isInWishlist(productId)) {
        dispatch({ type: 'REMOVE', productId });
      } else {
        dispatch({ type: 'ADD', productId });
      }
    },
    [isInWishlist],
  );

  return (
    <WishlistContext
      value={{
        items: state.items,
        isHydrated: state.isHydrated,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
