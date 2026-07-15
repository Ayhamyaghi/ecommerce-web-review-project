import { ReviewSection } from '../components/ReviewSection';

const DEMO_PRODUCT = {
  id: 'wireless-headphones-1',
  name: 'ProSound Wireless Headphones',
  description:
    'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and hi-fi audio quality. Comfortable memory foam ear cushions for all-day wear.',
  price: 7999,
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Product Info */}
        <div className="mb-10">
          <div className="bg-gray-200 dark:bg-zinc-800 rounded-lg h-48 flex items-center justify-center text-gray-400 mb-6">
            Product Image
          </div>
          <h1 className="text-2xl font-bold mb-2">{DEMO_PRODUCT.name}</h1>
          <p className="text-xl font-semibold text-blue-600 mb-3">
            {formatPrice(DEMO_PRODUCT.price)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">{DEMO_PRODUCT.description}</p>
        </div>

        <hr className="mb-10 border-gray-200 dark:border-zinc-800" />

        {/* Reviews */}
        <ReviewSection productId={DEMO_PRODUCT.id} />
      </main>
    </div>
  );
}
