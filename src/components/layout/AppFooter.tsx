import Link from 'next/link';

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">ShopWave</h3>
            <p className="mt-2 text-sm text-gray-500">Quality products delivered to your door. Free shipping on orders over $50.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Shop</h3>
            <ul className="mt-2 space-y-1">
              {['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors', 'Beauty & Personal Care'].map((cat) => (
                <li key={cat}><Link href={`/?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-500 hover:text-blue-600">{cat}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/auth/login" className="text-sm text-gray-500 hover:text-blue-600">Sign In</Link></li>
              <li><Link href="/auth/register" className="text-sm text-gray-500 hover:text-blue-600">Register</Link></li>
              <li><Link href="/account/orders" className="text-sm text-gray-500 hover:text-blue-600">Order History</Link></li>
              <li><Link href="/wishlist" className="text-sm text-gray-500 hover:text-blue-600">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Promotions</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              <li>Use <strong>SAVE10</strong> for 10% off</li>
              <li>Use <strong>WELCOME5</strong> for $5 off</li>
              <li>Use <strong>FREESHIP</strong> for free shipping</li>
              <li>Use <strong>SUMMER25</strong> for 25% off</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ShopWave. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
