'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { CartItem, Product } from '@/lib/types';
import {
  addItem,
  updateQuantity,
  removeItem,
  reconcileCart,
} from '@/lib/cart-utils';
import { loadCart, saveCart } from '@/lib/storage';
import { products } from '@/lib/products';

type CartAction =
  | { type: 'ADD_ITEM'; productId: string; quantity: number; stock: number }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number; stock: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'LOAD_CART'; items: CartItem[] }
  | { type: 'RESET_CART' };

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number, stock: number) => void;
  removeFromCart: (productId: string) => void;
  resetCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return addItem(state, action.productId, action.quantity, action.stock);
    case 'UPDATE_QUANTITY':
      return updateQuantity(state, action.productId, action.quantity, action.stock);
    case 'REMOVE_ITEM':
      return removeItem(state, action.productId);
    case 'LOAD_CART':
      return action.items;
    case 'RESET_CART':
      return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadCart();
    if (stored) {
      const reconciled = reconcileCart(stored, products);
      dispatch({ type: 'LOAD_CART', items: reconciled });
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      productId: product.id,
      quantity,
      stock: product.stock,
    });
  }, []);

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number, stock: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity, stock });
    },
    [],
  );

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const resetCart = useCallback(() => {
    dispatch({ type: 'RESET_CART' });
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext value={{ items, addToCart, updateItemQuantity, removeFromCart, resetCart, itemCount }}>
      {children}
    </CartContext>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
