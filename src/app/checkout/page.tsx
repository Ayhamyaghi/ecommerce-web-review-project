'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/format';
import { validateCheckoutForm, checkoutErrorMap } from '@/lib/checkout-validation';
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizePostalCode } from '@/lib/sanitize';
import type { CheckoutFormData } from '@/lib/types';
import { logger } from '@/lib/logger';

const INITIAL_FORM: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  paymentMethod: 'credit_card',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, pricing, resetCart } = useCart();
  const { addToast } = useToast();

  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = useCallback(
    (field: keyof CheckoutFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg text-gray-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const sanitized: CheckoutFormData = {
      ...form,
      firstName: sanitizeName(form.firstName),
      lastName: sanitizeName(form.lastName),
      email: sanitizeEmail(form.email),
      phone: sanitizePhone(form.phone),
      address: form.address.trim(),
      city: sanitizeName(form.city),
      state: sanitizeName(form.state),
      postalCode: sanitizePostalCode(form.postalCode),
      country: form.country.trim(),
    };

    const validationErrors = validateCheckoutForm(sanitized);
    if (validationErrors.length > 0) {
      setErrors(checkoutErrorMap(validationErrors));
      addToast('Please fix the form errors and try again.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      logger.info('Submitting order', { orderId, itemCount: items.length });

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      resetCart();
      addToast('Order placed successfully!', 'success');
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      logger.error('Checkout failed', { error: String(err) });
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isCardPayment =
    form.paymentMethod === 'credit_card' || form.paymentMethod === 'debit_card';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="mt-1 text-sm text-gray-500">
        <Link href="/cart" className="text-blue-600 hover:underline">
          ← Back to cart
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Shipping */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="First Name"
                id="firstName"
                value={form.firstName}
                error={errors.firstName}
                onChange={(v) => set('firstName', v)}
                autoComplete="given-name"
              />
              <Field
                label="Last Name"
                id="lastName"
                value={form.lastName}
                error={errors.lastName}
                onChange={(v) => set('lastName', v)}
                autoComplete="family-name"
              />
              <Field
                label="Email Address"
                id="email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => set('email', v)}
                autoComplete="email"
                className="sm:col-span-2"
              />
              <Field
                label="Phone Number"
                id="phone"
                type="tel"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => set('phone', v)}
                autoComplete="tel"
                className="sm:col-span-2"
              />
              <Field
                label="Street Address"
                id="address"
                value={form.address}
                error={errors.address}
                onChange={(v) => set('address', v)}
                autoComplete="street-address"
                className="sm:col-span-2"
              />
              <Field
                label="City"
                id="city"
                value={form.city}
                error={errors.city}
                onChange={(v) => set('city', v)}
                autoComplete="address-level2"
              />
              <Field
                label="State / Province"
                id="state"
                value={form.state}
                error={errors.state}
                onChange={(v) => set('state', v)}
                autoComplete="address-level1"
              />
              <Field
                label="Postal Code"
                id="postalCode"
                value={form.postalCode}
                error={errors.postalCode}
                onChange={(v) => set('postalCode', v)}
                autoComplete="postal-code"
              />
              <Field
                label="Country"
                id="country"
                value={form.country}
                error={errors.country}
                onChange={(v) => set('country', v)}
                autoComplete="country"
              />
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'debit_card', label: 'Debit Card' },
                  { value: 'paypal', label: 'PayPal' },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={() => set('paymentMethod', opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {opt.label}
                  </span>
                </label>
              ))}
              {errors.paymentMethod && (
                <p className="text-sm text-red-600" role="alert">{errors.paymentMethod}</p>
              )}
            </div>

            {isCardPayment && (
              <div className="mt-4 grid gap-4">
                <Field
                  label="Card Number"
                  id="cardNumber"
                  value={form.cardNumber ?? ''}
                  error={errors.cardNumber}
                  onChange={(v) => set('cardNumber', v.replace(/\D/g, '').substring(0, 19))}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                  inputMode="numeric"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Expiry (MM/YY)"
                    id="cardExpiry"
                    value={form.cardExpiry ?? ''}
                    error={errors.cardExpiry}
                    onChange={(v) => set('cardExpiry', v)}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    maxLength={5}
                  />
                  <Field
                    label="CVC"
                    id="cardCvc"
                    value={form.cardCvc ?? ''}
                    error={errors.cardCvc}
                    onChange={(v) => set('cardCvc', v.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <aside>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(pricing.subtotal)}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{pricing.shipping === 0 ? 'Free' : formatPrice(pricing.shipping)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(pricing.total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-md bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Processing…' : `Pay ${formatPrice(pricing.total)}`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Your information is processed securely.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  id: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

function Field({
  label,
  id,
  value,
  error,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  className,
  maxLength,
  inputMode,
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
