export async function submitCheckout(orderId: string) {
  const response = await fetch(`/api/checkout/${orderId}`, {
    method: 'POST',
  });

  return response.json();
}
