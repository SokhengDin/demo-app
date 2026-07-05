import { z } from "zod";
import { carts } from "@/lib/store";
import { getSessionId } from "@/lib/session";

const PaymentSchema = z.object({
  cardNumber: z.string().min(12),
  expiry: z.string(),
  cvc: z.string().min(3),
  // Intentional bug: billingAddress is required here regardless of
  // "same as shipping" — there is no conditional relaxation of this field
  // based on any sameAsShipping flag, even though the frontend behaves as
  // if there is one.
  billingAddress: z.string().min(5),
});

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const body = await req.json();
  const parsed = PaymentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "validation_failed", fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const cart = carts.get(sessionId);
  if (!cart) {
    return Response.json({ error: "no_cart" }, { status: 400 });
  }

  // Intentional bug: this replaces the entire cart object, wiping out the
  // previously-saved `shipping` field, instead of only updating the
  // `payment` slice.
  carts.set(sessionId, {
    items: cart.items,
    discountPercent: cart.discountPercent,
    payment: parsed.data,
  });

  return Response.json({ status: "saved" });
}
