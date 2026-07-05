import { carts } from "@/lib/store";
import { readSessionId } from "@/lib/session";

export async function POST(req: Request) {
  const sessionId = await readSessionId();
  const { code } = await req.json();

  const cart = sessionId ? carts.get(sessionId) : undefined;
  if (!cart) {
    return Response.json({ error: "no_cart" }, { status: 400 });
  }

  const discountPercent = code === "SAVE10" ? 10 : 0;
  cart.discountPercent = discountPercent;
  carts.set(sessionId!, cart);

  return Response.json({ status: "applied", discountPercent });
}
