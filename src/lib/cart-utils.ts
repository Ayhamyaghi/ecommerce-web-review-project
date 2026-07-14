import { CartItem, Product } from './types';

export function addItem(
  items: CartItem[],
  productId: string,
  quantity: number,
  stock: number,
): CartItem[] {
  if (stock <= 0 || quantity <= 0) return items;

  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    const newQuantity = Math.min(existing.quantity + quantity, stock);
    return items.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item,
    );
  }

  return [...items, { productId, quantity: Math.min(quantity, stock) }];
}

export function updateQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
  stock: number,
): CartItem[] {
  if (quantity <= 0) {
    return removeItem(items, productId);
  }

  const capped = Math.min(quantity, stock);
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: capped } : item,
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function getItemSubtotal(quantity: number, priceInCents: number): number {
  return quantity * priceInCents;
}

export function getCartTotal(
  items: CartItem[],
  products: Product[],
): number {
  return items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return total;
    return total + getItemSubtotal(item.quantity, product.price);
  }, 0);
}

export function reconcileCart(
  items: CartItem[],
  products: Product[],
): CartItem[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock <= 0) return null;
      return {
        ...item,
        quantity: Math.min(item.quantity, product.stock),
      };
    })
    .filter((item): item is CartItem => item !== null);
}

export function validateCartData(data: unknown): CartItem[] | null {
  if (!Array.isArray(data)) return null;

  const valid: CartItem[] = [];
  for (const item of data) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.productId !== 'string' ||
      typeof item.quantity !== 'number' ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 0
    ) {
      return null;
    }
    valid.push({ productId: item.productId, quantity: item.quantity });
  }

  return valid;
}
