import { carts } from "@/lib/store";
import { getSessionId, readSessionId } from "@/lib/session";

export async function POST(req: Request) {
  const sessionId = await getSessionId();
  const { productId } = await req.json();

  // Intentional bug: no check for an existing line item for this productId
  // before pushing a new one. The absence of that check IS the bug — do not
  // add it.
  const cart = carts.get(sessionId) ?? { items: [] };
  cart.items.push({ productId, quantity: 1 });
  carts.set(sessionId, cart);

  return Response.json({ status: "added", itemCount: cart.items.length });
}

export async function GET() {
  const sessionId = await readSessionId();
  const cart = sessionId ? carts.get(sessionId) : undefined;

  return Response.json({ cart: cart ?? { items: [] } });
}
