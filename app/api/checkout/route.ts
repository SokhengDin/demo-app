import { carts } from "@/lib/store";
import { readSessionId } from "@/lib/session";

export async function POST(req: Request) {
  if (!req.headers.get("x-client-version")) {
    return Response.json({ error: "missing_client_header" }, { status: 403 });
  }

  const sessionId = await readSessionId();
  const cart = sessionId ? carts.get(sessionId) : undefined;

  if (!cart || cart.items.length === 0) {
    return Response.json({ error: "empty_cart" }, { status: 400 });
  }

  carts.delete(sessionId!);

  return Response.json({ status: "order_placed" });
}
