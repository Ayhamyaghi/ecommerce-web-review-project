import type { CheckoutFormData, CheckoutValidationError } from './types';
import { sanitizeEmail, sanitizePhone } from './sanitize';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
const CARD_NUMBER_RE = /^\d{13,19}$/;
const CARD_EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CARD_CVC_RE = /^\d{3,4}$/;

export function validateCheckoutForm(
  data: CheckoutFormData,
): CheckoutValidationError[] {
  const errors: CheckoutValidationError[] = [];

  function required(
    field: keyof CheckoutFormData,
    label: string,
    value: string,
    minLen = 1,
  ) {
    if (!value.trim() || value.trim().length < minLen) {
      errors.push({ field, message: `${label} is required.` });
    }
  }

  required('firstName', 'First name', data.firstName);
  required('lastName', 'Last name', data.lastName);

  if (!data.email.trim() || !EMAIL_RE.test(sanitizeEmail(data.email))) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
  }

  const phone = sanitizePhone(data.phone);
  if (!phone || !PHONE_RE.test(phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required.' });
  }

  required('address', 'Street address', data.address, 5);
  required('city', 'City', data.city);
  required('state', 'State / Province', data.state);
  required('postalCode', 'Postal code', data.postalCode);
  required('country', 'Country', data.country);

  if (!['credit_card', 'debit_card', 'paypal'].includes(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Please select a payment method.' });
  }

  if (data.paymentMethod === 'credit_card' || data.paymentMethod === 'debit_card') {
    const cardNum = (data.cardNumber ?? '').replace(/\s/g, '');
    if (!CARD_NUMBER_RE.test(cardNum)) {
      errors.push({ field: 'cardNumber', message: 'Enter a valid card number (13–19 digits).' });
    }
    if (!CARD_EXPIRY_RE.test(data.cardExpiry ?? '')) {
      errors.push({ field: 'cardExpiry', message: 'Enter expiry in MM/YY format.' });
    }
    if (!CARD_CVC_RE.test(data.cardCvc ?? '')) {
      errors.push({ field: 'cardCvc', message: 'Enter a valid CVC (3 or 4 digits).' });
    }
  }

  return errors;
}

/** Returns a map of fieldName → first error message for easy form wiring */
export function checkoutErrorMap(
  errors: CheckoutValidationError[],
): Partial<Record<keyof CheckoutFormData, string>> {
  return errors.reduce<Partial<Record<keyof CheckoutFormData, string>>>(
    (acc, e) => {
      if (!acc[e.field]) acc[e.field] = e.message;
      return acc;
    },
    {},
  );
}
