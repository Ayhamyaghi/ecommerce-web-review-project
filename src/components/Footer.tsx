import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">ShopWave</h3>
            <p className="mt-2 text-sm text-gray-500">
              Quality products delivered to your door. Fast shipping, easy returns.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-2 space-y-1">
              {[
                { label: 'All Products', href: '/' },
                { label: 'Electronics', href: '/?category=Electronics' },
                { label: 'Clothing', href: '/?category=Clothing' },
                { label: 'Home & Kitchen', href: '/?category=Home+%26+Kitchen' },
                { label: 'Books', href: '/?category=Books' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-2 space-y-1">
              {[
                { label: 'My Cart', href: '/cart' },
                { label: 'Wishlist', href: '/wishlist' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Promotions</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              <li>Use <strong>SAVE10</strong> for 10% off</li>
              <li>Use <strong>WELCOME5</strong> for $5 off</li>
              <li>Use <strong>FREESHIP</strong> for free shipping</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {currentYear} ShopWave. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
