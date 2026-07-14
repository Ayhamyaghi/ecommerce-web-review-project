/** Format a price in cents to a display string like "$19.99" */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
