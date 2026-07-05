import { calculateSubtotal, carts } from "@/lib/store";
import { readSessionId } from "@/lib/session";

const PROMO_CODES: Record<string, { percent: number; minSubtotalCents?: number }> = {
  SAVE10: { percent: 10 },
  SAVE20: { percent: 20, minSubtotalCents: 5000 },
};

export async function POST(req: Request) {
  const sessionId = await readSessionId();
  const { code } = await req.json();

  const cart = sessionId ? carts.get(sessionId) : undefined;
  if (!cart) {
    return Response.json({ error: "no_cart" }, { status: 400 });
  }

  const promo = PROMO_CODES[code];
  const subtotal = calculateSubtotal(cart);

  const applicablePercent =
    promo && (!promo.minSubtotalCents || subtotal >= promo.minSubtotalCents)
      ? promo.percent
      : 0; // Intentional bug: silently 0 instead of an error explaining why

  cart.discountPercent = applicablePercent;
  carts.set(sessionId!, cart);

  return Response.json({ status: "applied", discountPercent: applicablePercent });
}
