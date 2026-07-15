export async function POST(request: Request) {
  const { orderId, items, paymentMethod } = await request.json();

  const checkoutResponse = await fetch(
    `${process.env.PAYMENT_API_URL}/api/process-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, items, paymentMethod }),
    }
  );

  const result = await checkoutResponse.json();

  return Response.json({ success: true, order: result });
}
