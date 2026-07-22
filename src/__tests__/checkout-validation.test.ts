import { describe, it, expect } from 'vitest';
import { validateCheckoutForm, checkoutErrorMap } from '@/lib/checkout-validation';
import type { CheckoutFormData } from '@/lib/types';

const VALID_CARD_FORM: CheckoutFormData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '+1 555 123 4567',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  postalCode: '62701',
  country: 'US',
  paymentMethod: 'credit_card',
  cardNumber: '4111111111111111',
  cardExpiry: '12/26',
  cardCvc: '123',
};

const VALID_PAYPAL_FORM: CheckoutFormData = {
  ...VALID_CARD_FORM,
  paymentMethod: 'paypal',
  cardNumber: undefined,
  cardExpiry: undefined,
  cardCvc: undefined,
};

describe('validateCheckoutForm — valid inputs', () => {
  it('returns no errors for a valid credit card form', () => {
    expect(validateCheckoutForm(VALID_CARD_FORM)).toHaveLength(0);
  });

  it('returns no errors for a valid debit card form', () => {
    expect(validateCheckoutForm({ ...VALID_CARD_FORM, paymentMethod: 'debit_card' })).toHaveLength(0);
  });

  it('returns no errors for a valid paypal form', () => {
    expect(validateCheckoutForm(VALID_PAYPAL_FORM)).toHaveLength(0);
  });
});

describe('validateCheckoutForm — required fields', () => {
  it('reports missing firstName', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, firstName: '' });
    expect(errors.some((e) => e.field === 'firstName')).toBe(true);
  });

  it('reports missing lastName', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, lastName: '' });
    expect(errors.some((e) => e.field === 'lastName')).toBe(true);
  });

  it('reports missing city', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, city: '' });
    expect(errors.some((e) => e.field === 'city')).toBe(true);
  });

  it('reports missing state', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, state: '' });
    expect(errors.some((e) => e.field === 'state')).toBe(true);
  });

  it('reports missing country', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, country: '' });
    expect(errors.some((e) => e.field === 'country')).toBe(true);
  });

  it('reports address shorter than 5 characters', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, address: '12' });
    expect(errors.some((e) => e.field === 'address')).toBe(true);
  });
});

describe('validateCheckoutForm — email', () => {
  it('reports invalid email format', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, email: 'not-an-email' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('reports empty email', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, email: '' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('accepts a valid email', () => {
    const errors = validateCheckoutForm(VALID_CARD_FORM);
    expect(errors.some((e) => e.field === 'email')).toBe(false);
  });
});

describe('validateCheckoutForm — phone', () => {
  it('reports an invalid phone number', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, phone: '12' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('accepts international format', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, phone: '+44 20 7946 0958' });
    expect(errors.some((e) => e.field === 'phone')).toBe(false);
  });
});

describe('validateCheckoutForm — card fields', () => {
  it('reports an invalid card number', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, cardNumber: '1234' });
    expect(errors.some((e) => e.field === 'cardNumber')).toBe(true);
  });

  it('reports an invalid expiry format', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, cardExpiry: '1226' });
    expect(errors.some((e) => e.field === 'cardExpiry')).toBe(true);
  });

  it('reports an invalid CVC', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, cardCvc: '12' });
    expect(errors.some((e) => e.field === 'cardCvc')).toBe(true);
  });

  it('does NOT require card fields for PayPal', () => {
    const errors = validateCheckoutForm(VALID_PAYPAL_FORM);
    const cardFields = errors.filter((e) =>
      ['cardNumber', 'cardExpiry', 'cardCvc'].includes(e.field),
    );
    expect(cardFields).toHaveLength(0);
  });

  it('accepts 4-digit CVC', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, cardCvc: '1234' });
    expect(errors.some((e) => e.field === 'cardCvc')).toBe(false);
  });
});

describe('checkoutErrorMap', () => {
  it('builds a field → first message map', () => {
    const errors = validateCheckoutForm({ ...VALID_CARD_FORM, firstName: '', email: 'bad' });
    const map = checkoutErrorMap(errors);
    expect(typeof map.firstName).toBe('string');
    expect(typeof map.email).toBe('string');
  });

  it('returns an empty object for valid form', () => {
    const errors = validateCheckoutForm(VALID_CARD_FORM);
    expect(checkoutErrorMap(errors)).toEqual({});
  });
});
