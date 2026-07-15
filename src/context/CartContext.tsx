'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  CartItem,
  Product,
  AppliedPromotion,
  PricingBreakdown,
  PromotionValidationResult,
} from '@/lib/types';
import {
  addItem,
  updateQuantity,
  removeItem,
  reconcileCart,
  getCartTotal,
} from '@/lib/cart-utils';
import { loadCart, saveCart } from '@/lib/storage';
import { products } from '@/lib/products';
import {
  validatePromotion,
  applyPromotion,
  revalidatePromotion,
  calculatePricingBreakdown,
} from '@/lib/promotions';

interface CartState {
  items: CartItem[];
  appliedPromotion: AppliedPromotion | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; productId: string; quantity: number; stock: number }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number; stock: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'LOAD_CART'; items: CartItem[]; appliedPromotion: AppliedPromotion | null }
  | { type: 'RESET_CART' }
  | { type: 'SET_PROMOTION'; appliedPromotion: AppliedPromotion }
  | { type: 'REMOVE_PROMOTION' };

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateItemQuantity: (productId: string, quantity: number, stock: number) => void;
  removeFromCart: (productId: string) => void;
  resetCart: () => void;
  itemCount: number;
  appliedPromotion: AppliedPromotion | null;
  pricing: PricingBreakdown;
  applyPromoCode: (code: string) => PromotionValidationResult;
  removePromotion: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function revalidateAfterCartChange(state: CartState): CartState {
  if (!state.appliedPromotion) return state;
  const revalidated = revalidatePromotion(
    state.appliedPromotion.code,
    state.items,
    products,
  );
  if (!revalidated) {
    return { ...state, appliedPromotion: null };
  }
  return { ...state, appliedPromotion: revalidated };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const items = addItem(state.items, action.productId, action.quantity, action.stock);
      return revalidateAfterCartChange({ ...state, items });
    }
    case 'UPDATE_QUANTITY': {
      const items = updateQuantity(state.items, action.productId, action.quantity, action.stock);
      return revalidateAfterCartChange({ ...state, items });
    }
    case 'REMOVE_ITEM': {
      const items = removeItem(state.items, action.productId);
      return revalidateAfterCartChange({ ...state, items });
    }
    case 'LOAD_CART':
      return { items: action.items, appliedPromotion: action.appliedPromotion };
    case 'RESET_CART':
      return { items: [], appliedPromotion: null };
    case 'SET_PROMOTION':
      return { ...state, appliedPromotion: action.appliedPromotion };
    case 'REMOVE_PROMOTION':
      return { ...state, appliedPromotion: null };
  }
}

const initialState: CartState = { items: [], appliedPromotion: null };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadCart();
    if (stored) {
      const reconciled = reconcileCart(stored.items, products);
      let appliedPromotion: AppliedPromotion | null = null;
      if (stored.promotionCode) {
        appliedPromotion = revalidatePromotion(
          stored.promotionCode,
          reconciled,
          products,
        );
      }
      dispatch({ type: 'LOAD_CART', items: reconciled, appliedPromotion });
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    saveCart(state.items, state.appliedPromotion?.code ?? null);
  }, [state.items, state.appliedPromotion]);

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

  const applyPromoCode = useCallback(
    (code: string): PromotionValidationResult => {
      const subtotal = getCartTotal(state.items, products);
      const result = validatePromotion(
        code,
        subtotal,
        state.appliedPromotion?.code ?? null,
      );
      if (result.valid && result.promotion) {
        const applied = applyPromotion(result.promotion, subtotal);
        dispatch({ type: 'SET_PROMOTION', appliedPromotion: applied });
      }
      return result;
    },
    [state.items, state.appliedPromotion],
  );

  const removePromotion = useCallback(() => {
    dispatch({ type: 'REMOVE_PROMOTION' });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const pricing = calculatePricingBreakdown(
    state.items,
    products,
    state.appliedPromotion,
  );

  return (
    <CartContext
      value={{
        items: state.items,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        resetCart,
        itemCount,
        appliedPromotion: state.appliedPromotion,
        pricing,
        applyPromoCode,
        removePromotion,
      }}
    >
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
