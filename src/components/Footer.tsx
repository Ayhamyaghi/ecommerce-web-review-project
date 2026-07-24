import Link from 'next/link';

const SHOP_LINKS = [
  { label: 'All Products', href: '/' },
  { label: 'Electronics', href: '/?category=Electronics' },
  { label: 'Clothing', href: '/?category=Clothing' },
  { label: 'Home & Kitchen', href: '/?category=Home+%26+Kitchen' },
  { label: 'Books', href: '/?category=Books' },
];

const ACCOUNT_LINKS = [
  { label: 'My Cart', href: '/cart' },
  { label: 'Wishlist', href: '/wishlist' },
];

const PROMO_CODES = [
  { code: 'SAVE10', description: '10% off' },
  { code: 'WELCOME5', description: '$5 off' },
  { code: 'FREESHIP', description: 'free shipping' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">ShopWave</p>
            <p className="mt-2 text-sm text-gray-500">
              Quality products delivered to your door. Fast shipping, easy returns.
            </p>
          </div>

          <nav aria-label="Shop categories">
            <p className="text-sm font-semibold text-gray-900">Shop</p>
            <ul className="mt-2 space-y-1">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <p className="text-sm font-semibold text-gray-900">Account</p>
            <ul className="mt-2 space-y-1">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-blue-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold text-gray-900">Promotions</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              {PROMO_CODES.map(({ code, description }) => (
                <li key={code}>
                  Use <strong>{code}</strong> for {description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <small>© {currentYear} ShopWave. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
