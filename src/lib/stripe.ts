export const stripeEnabled = process.env.STRIPE_ENABLED === "true";

export function assertStripeEnabled() {
  if (!stripeEnabled) {
    throw new Error("Stripe não habilitado");
  }
}

export async function createStripePlaceholderSession() {
  assertStripeEnabled();
  return { url: "https://stripe.com" };
}
