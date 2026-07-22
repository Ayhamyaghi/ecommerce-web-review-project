import { Product } from './types';

export const products: Product[] = [
  // ── Electronics ─────────────────────────────────────────────────────────────
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
    id: 'elec-005',
    name: 'Wireless Ergonomic Mouse',
    description:
      'Vertical ergonomic mouse with 6 programmable buttons and 90-day battery life.',
    price: 4299,
    category: 'Electronics',
    image: '/images/mouse.jpg',
    stock: 27,
  },
  {
    id: 'elec-006',
    name: '4K Webcam',
    description:
      'Ultra-HD webcam with built-in ring light, dual microphones, and auto-focus for crystal-clear video calls.',
    price: 8999,
    category: 'Electronics',
    image: '/images/webcam.jpg',
    stock: 12,
  },
  {
    id: 'elec-007',
    name: 'Smart LED Strip Lights',
    description:
      '5-metre Wi-Fi-controlled LED strip with 16 million colours and music sync via app.',
    price: 2299,
    category: 'Electronics',
    image: '/images/led-strip.jpg',
    stock: 55,
  },

  // ── Clothing ─────────────────────────────────────────────────────────────────
  {
    id: 'cloth-001',
    name: 'Classic Cotton T-Shirt',
    description:
      'Soft ring-spun cotton crew neck available in multiple colours. Unisex fit.',
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
    id: 'cloth-004',
    name: 'Merino Wool Hoodie',
    description:
      'Premium merino wool blend hoodie with a kangaroo pocket. Naturally odour-resistant and temperature-regulating.',
    price: 8499,
    category: 'Clothing',
    image: '/images/hoodie.jpg',
    stock: 22,
  },
  {
    id: 'cloth-005',
    name: 'Slim-Fit Chinos',
    description:
      'Stretch-cotton chinos with a modern slim fit. Available in navy, stone, and olive.',
    price: 4999,
    category: 'Clothing',
    image: '/images/chinos.jpg',
    stock: 40,
  },
  {
    id: 'cloth-006',
    name: 'Waterproof Hiking Boots',
    description:
      'Gore-Tex lined hiking boots with ankle support and grippy Vibram outsole.',
    price: 13999,
    category: 'Clothing',
    image: '/images/hiking-boots.jpg',
    stock: 9,
  },

  // ── Home & Kitchen ────────────────────────────────────────────────────────────
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
      'Adjustable brightness and colour temperature with USB charging port.',
    price: 4499,
    category: 'Home & Kitchen',
    image: '/images/desk-lamp.jpg',
    stock: 0,
  },
  {
    id: 'home-004',
    name: 'Bamboo Cutting Board Set',
    description:
      'Set of 3 eco-friendly bamboo cutting boards in small, medium, and large sizes.',
    price: 2999,
    category: 'Home & Kitchen',
    image: '/images/cutting-boards.jpg',
    stock: 45,
  },
  {
    id: 'home-005',
    name: 'French Press Coffee Maker',
    description:
      '34 oz borosilicate glass French press with stainless steel plunger and double-wall insulation.',
    price: 3499,
    category: 'Home & Kitchen',
    image: '/images/french-press.jpg',
    stock: 20,
  },
  {
    id: 'home-006',
    name: 'Stainless Steel Knife Set',
    description:
      '6-piece professional chef knife set with full-tang blades and ergonomic pakkawood handles.',
    price: 7999,
    category: 'Home & Kitchen',
    image: '/images/knife-set.jpg',
    stock: 11,
  },

  // ── Books ─────────────────────────────────────────────────────────────────────
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
  {
    id: 'book-004',
    name: 'Clean Architecture',
    description:
      'Robert C. Martin\'s guide to software structure and design that stands the test of time.',
    price: 4499,
    category: 'Books',
    image: '/images/clean-architecture.jpg',
    stock: 30,
  },
  {
    id: 'book-005',
    name: 'JavaScript: The Good Parts',
    description:
      'Douglas Crockford explores the best features of JavaScript for writing clean, maintainable code.',
    price: 2995,
    category: 'Books',
    image: '/images/js-good-parts.jpg',
    stock: 25,
  },

  // ── Sports & Outdoors ─────────────────────────────────────────────────────────
  {
    id: 'sport-001',
    name: 'Adjustable Dumbbell Set',
    description:
      'Space-saving adjustable dumbbells that replace 15 pairs. Weight range: 5–52.5 lbs per dumbbell.',
    price: 29999,
    category: 'Sports & Outdoors',
    image: '/images/dumbbells.jpg',
    stock: 6,
  },
  {
    id: 'sport-002',
    name: 'Yoga Mat with Alignment Lines',
    description:
      '6mm thick eco-friendly TPE yoga mat with body alignment lines and carry strap.',
    price: 3999,
    category: 'Sports & Outdoors',
    image: '/images/yoga-mat.jpg',
    stock: 38,
  },
  {
    id: 'sport-003',
    name: 'Insulated Hiking Backpack',
    description:
      '35L waterproof daypack with hydration sleeve, hip belt, and multiple organisational pockets.',
    price: 8999,
    category: 'Sports & Outdoors',
    image: '/images/hiking-backpack.jpg',
    stock: 14,
  },
  {
    id: 'sport-004',
    name: 'Foam Roller',
    description:
      'High-density EVA foam roller for muscle recovery and myofascial release. 18-inch length.',
    price: 2499,
    category: 'Sports & Outdoors',
    image: '/images/foam-roller.jpg',
    stock: 50,
  },
  {
    id: 'sport-005',
    name: 'GPS Running Watch',
    description:
      'Multi-sport GPS watch with heart rate monitoring, sleep tracking, and up to 7-day battery.',
    price: 19999,
    category: 'Sports & Outdoors',
    image: '/images/gps-watch.jpg',
    stock: 0,
  },

  // ── Beauty & Personal Care ────────────────────────────────────────────────────
  {
    id: 'beauty-001',
    name: 'Vitamin C Serum',
    description:
      '20% L-ascorbic acid serum with hyaluronic acid and vitamin E. Brightens and firms skin.',
    price: 2999,
    category: 'Beauty & Personal Care',
    image: '/images/vitamin-c-serum.jpg',
    stock: 65,
  },
  {
    id: 'beauty-002',
    name: 'Natural Bamboo Toothbrush Set',
    description:
      'Pack of 4 biodegradable bamboo toothbrushes with BPA-free medium-bristle heads.',
    price: 1199,
    category: 'Beauty & Personal Care',
    image: '/images/bamboo-toothbrush.jpg',
    stock: 90,
  },
  {
    id: 'beauty-003',
    name: 'Professional Hair Dryer',
    description:
      '2200W ionic hair dryer with 3 heat settings, 2 speed settings, and cool-shot button.',
    price: 5999,
    category: 'Beauty & Personal Care',
    image: '/images/hair-dryer.jpg',
    stock: 17,
  },
  {
    id: 'beauty-004',
    name: 'SPF 50 Sunscreen Lotion',
    description:
      'Broad-spectrum UVA/UVB sunscreen with lightweight, non-greasy formula. Water resistant 80 minutes.',
    price: 1599,
    category: 'Beauty & Personal Care',
    image: '/images/sunscreen.jpg',
    stock: 80,
  },
];

export const categories = [...new Set(products.map((p) => p.category))];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}
