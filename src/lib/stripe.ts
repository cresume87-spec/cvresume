import Stripe from "stripe";

let cachedStripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cachedStripe !== undefined) return cachedStripe;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    cachedStripe = null;
    return cachedStripe;
  }

  cachedStripe = new Stripe(secretKey, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  });

  return cachedStripe;
}
