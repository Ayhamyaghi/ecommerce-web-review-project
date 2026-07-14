import { Product } from './types';

export const products: Product[] = [
  {
    id: 'elec-001',
    name: 'Wireless Bluetooth Headphones',
    description:
      'Over-ear noise-cancelling headphones with 30-hour battery life and premium sound quality.',
    price: 7999,
    category: 'Electronics',
    image: '/images/headphones.jpg',
    stock: 15,
  },
  {
    id: 'elec-002',
    name: 'USB-C Fast Charger',
    description:
      'Compact 65W GaN charger compatible with laptops, tablets, and phones.',
    price: 3499,
    category: 'Electronics',
    image: '/images/charger.jpg',
    stock: 42,
  },
  {
    id: 'elec-003',
    name: 'Mechanical Keyboard',
    description:
      'Compact 75% layout with hot-swappable switches and RGB backlighting.',
    price: 12999,
    category: 'Electronics',
    image: '/images/keyboard.jpg',
    stock: 8,
  },
  {
    id: 'elec-004',
    name: 'Portable Bluetooth Speaker',
    description:
      'Waterproof speaker with 360-degree sound and 12-hour playtime.',
    price: 4999,
    category: 'Electronics',
    image: '/images/speaker.jpg',
    stock: 0,
  },
  {
    id: 'cloth-001',
    name: 'Classic Cotton T-Shirt',
    description:
      'Soft ring-spun cotton crew neck available in multiple colors. Unisex fit.',
    price: 1999,
    category: 'Clothing',
    image: '/images/tshirt.jpg',
    stock: 120,
  },
  {
    id: 'cloth-002',
    name: 'Denim Jacket',
    description:
      'Vintage-wash denim jacket with button closure and chest pockets.',
    price: 6999,
    category: 'Clothing',
    image: '/images/denim-jacket.jpg',
    stock: 18,
  },
  {
    id: 'cloth-003',
    name: 'Running Shoes',
    description:
      'Lightweight mesh upper with responsive cushioning for daily training.',
    price: 8999,
    category: 'Clothing',
    image: '/images/running-shoes.jpg',
    stock: 25,
  },
  {
    id: 'home-001',
    name: 'Stainless Steel Water Bottle',
    description:
      'Double-wall vacuum insulated bottle that keeps drinks cold for 24 hours.',
    price: 2499,
    category: 'Home & Kitchen',
    image: '/images/water-bottle.jpg',
    stock: 60,
  },
  {
    id: 'home-002',
    name: 'Non-Stick Frying Pan',
    description:
      'Ceramic-coated 10-inch frying pan with ergonomic cool-touch handle.',
    price: 3299,
    category: 'Home & Kitchen',
    image: '/images/frying-pan.jpg',
    stock: 33,
  },
  {
    id: 'home-003',
    name: 'LED Desk Lamp',
    description:
      'Adjustable brightness and color temperature with USB charging port.',
    price: 4499,
    category: 'Home & Kitchen',
    image: '/images/desk-lamp.jpg',
    stock: 0,
  },
  {
    id: 'book-001',
    name: 'The Pragmatic Programmer',
    description:
      'Classic software development book covering best practices and career advice.',
    price: 4295,
    category: 'Books',
    image: '/images/pragmatic-programmer.jpg',
    stock: 50,
  },
  {
    id: 'book-002',
    name: 'Design Patterns in TypeScript',
    description:
      'Hands-on guide to implementing Gang of Four patterns in modern TypeScript.',
    price: 3799,
    category: 'Books',
    image: '/images/design-patterns-ts.jpg',
    stock: 14,
  },
  {
    id: 'book-003',
    name: 'Cooking for Engineers',
    description:
      'A systematic approach to cooking with precise measurements and techniques.',
    price: 2899,
    category: 'Books',
    image: '/images/cooking-engineers.jpg',
    stock: 7,
  },
];

export const categories = [...new Set(products.map((p) => p.category))];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
