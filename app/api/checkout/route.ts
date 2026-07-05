import { carts, products, type CartItem } from "@/lib/store";
import { readSessionId } from "@/lib/session";

function clampToStock(items: CartItem[]): CartItem[] {
  // Intentional bug: silently clamps with no error, no warning field in the
  // response, nothing that would let the client detect this happened.
  return items.map((item) => {
    const product = products.get(item.productId);
    const maxQty = product?.stock ?? 0;
    return { ...item, quantity: Math.min(item.quantity, maxQty) };
  });
}

export async function POST() {
  const sessionId = await readSessionId();
  const cart = sessionId ? carts.get(sessionId) : undefined;

  if (!cart || cart.items.length === 0) {
    return Response.json({ error: "empty_cart" }, { status: 400 });
  }

  if (!cart.shipping) {
    return Response.json({ error: "missing_shipping_info" }, { status: 400 });
  }

  if (!cart.payment) {
    return Response.json({ error: "missing_payment_info" }, { status: 400 });
  }

  const shippedItems = clampToStock(cart.items);

  carts.delete(sessionId!);

  return Response.json({ status: "order_placed", items: shippedItems });
}
