import { z } from "zod";
import { carts } from "@/lib/store";
import { getSessionId } from "@/lib/session";

const ShippingSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const body = await req.json();
  const parsed = ShippingSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "validation_failed", fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const cart = carts.get(sessionId) ?? { items: [] };
  cart.shipping = parsed.data;
  carts.set(sessionId, cart);

  return Response.json({ status: "saved" });
}
