export async function processPayment(
  orderId: number,
  amount: number
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));

  const success = Math.random() > 0.3;
  return success;
}
