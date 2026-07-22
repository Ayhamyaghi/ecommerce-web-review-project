import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/Toast';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ShopWave — Quality Products, Fast Delivery',
    template: '%s | ShopWave',
  },
  description: 'Shop quality products across Electronics, Clothing, Home & Kitchen, Books, Sports & Outdoors, and Beauty. Free shipping over $50.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <ErrorBoundary>
                <AppHeader />
                <main id="main-content" className="flex-1">{children}</main>
                <AppFooter />
              </ErrorBoundary>
              <ToastContainer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
