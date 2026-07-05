# CLAUDE.md — Cambria Shop (QA Sentinel demo target app)

Build guideline for Claude Code. Read this whole file before writing any code.

This repo is **not** the agent. This repo is a small, deliberately-buggy e-commerce app that
exists purely so another project — an autonomous QA testing agent called QA Sentinel, built
for the RAISE Summit Hackathon 2026 (Google DeepMind / Vultr track) — has something real to
test, diagnose, and fix live in front of judges. Nothing in this repo talks to Gemini,
Antigravity, or any agent tooling. This is a plain Next.js app that happens to have several
carefully-chosen bugs left in on purpose.

This is the second major revision. The first version was a flat single-page checkout with
four bugs. This version splits checkout into three real steps (Shipping → Payment → Review)
and adds a quantity stepper, two promo codes with different validity rules, and a
same-as-billing shortcut — specifically to give Computer Use genuinely harder, multi-turn
state-tracking problems to solve, not just more forms to fill.

## 1. What this app is, in one paragraph

Cambria Shop is a small e-commerce flow: browse products → view product detail → add to
cart with adjustable quantity → apply a promo code → a three-step checkout (shipping,
payment, review) → order confirmation. The dependency chain is real — you cannot reach
Payment without valid Shipping data, cannot reach Review without valid Payment data, and
checkout cannot succeed without a valid cart. Several bugs are injected into this flow, each
picked so the symptom looks like a dead end or a silent inconsistency to a naive UI-only
tester, but the actual cause is a diagnosable console error, network failure, or payload
mismatch. The point of this app is to be *interesting to debug*, not to be a good product.

## 2. Non-goals — do not build these, even if they'd make the app feel more complete

- No real payment processor integration (Stripe, etc.) — payment accepts fake test values
  and never contacts anything external.
- No real product images requiring external hosting — use solid-color placeholder blocks or
  simple inline SVG icons per product; do not spend time sourcing or hotlinking real images.
- No real database — in-memory/module-scope state on the server is correct and intentional
  (see §4 for why).
- No user accounts, login, or auth of any kind — this is a guest-checkout-only flow.
- No search, filtering, sorting, pagination, reviews, or recommendations — a fixed list of
  6-8 products is enough. Do not build catalog features nobody asked for.
- No design polish beyond "looks like a real small storefront" — Tailwind defaults and a
  clean grid layout are enough; don't spend time on animations or brand identity.
- No real address validation/geocoding, no real card-number Luhn checks — validation in this
  app is intentionally simple (required-field presence, basic format checks) since the point
  is exposing payload/state bugs, not building a realistic validation engine.

If a build decision would take this from "clean minimal demo prop" toward "actually
production-grade," stop — that effort belongs in the QA Sentinel repo, not here.

## 3. Stack

- **Next.js 15+, App Router, TypeScript.**
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`. Scaffold with:
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  ```
  Confirm `package.json` shows `tailwindcss` at v4.x and `postcss.config.mjs` references
  `@tailwindcss/postcss`. If Tailwind v3 gets scaffolded instead (older `create-next-app`
  cache), upgrade before writing any components — check Tailwind's own Next.js install docs
  for the current migration steps, since v4 removes `tailwind.config.js` entirely in favor
  of `@theme` in `globals.css`.
- **No ORM, no external database driver.** Plain TypeScript objects held in module scope.
- Package manager: whichever `create-next-app` defaults to is fine.

## 4. Why in-memory state, explicitly

This is a deliberate architectural choice, not a shortcut. In-memory, module-scope state has
*genuine, explainable failure modes* — race conditions on concurrent writes, state loss on
hot-reload/restart — that make several bugs below realistic without needing a fake database
layer to misbehave convincingly.

```typescript
// lib/store.ts — the entire "database" for this app

type Product = {
  id:    string;
  name:  string;
  price: number;   // in cents, to avoid floating-point bugs THIS app doesn't intend to have
  stock: number;
};

type CartItem = { productId: string; quantity: number };

type ShippingInfo = {
  name: string; address: string; city: string; postalCode: string; country: string;
};

type PaymentInfo = {
  cardNumber: string; expiry: string; cvc: string;
  billingAddress?: string;   // present only when NOT using "same as shipping"
};

type Cart = {
  items:            CartItem[];
  discountPercent?: number;
  shipping?:        ShippingInfo;
  payment?:         PaymentInfo;
};

export const products: Map<string, Product> = new Map([
  ["p1", { id: "p1", name: "Ceramic Mug",        price: 1400, stock: 12 }],
  ["p2", { id: "p2", name: "Canvas Tote Bag",    price: 2200, stock: 8  }],
  ["p3", { id: "p3", name: "Wool Beanie",        price: 1800, stock: 5  }],
  ["p4", { id: "p4", name: "Leather Notebook",   price: 3200, stock: 3  }],
  ["p5", { id: "p5", name: "Enamel Pin Set",     price:  900, stock: 20 }],
  ["p6", { id: "p6", name: "Steel Water Bottle", price: 2600, stock: 0  }],  // always out of stock
]);

// keyed by a throwaway session id (cookie) — no auth in this app
export const carts: Map<string, Cart> = new Map();
```

Accept that this state resets on every server restart / hot reload — this app is re-run
fresh for every QA Sentinel test session anyway.

## 5. Page + route map

```
src/app/
├── page.tsx                      # product grid — the landing page
├── products/
│   └── [productId]/
│       └── page.tsx              # product detail, quantity stepper, "Add to cart"
├── cart/
│   └── page.tsx                  # cart contents, quantity steppers, promo code, subtotal
├── checkout/
│   ├── shipping/
│   │   └── page.tsx              # step 1: shipping address form
│   ├── payment/
│   │   └── page.tsx              # step 2: payment + "same as shipping" billing shortcut
│   └── review/
│       └── page.tsx              # step 3: full order summary, final "Place order"
├── confirmation/
│   └── page.tsx                  # final "order placed" screen
└── api/
    ├── cart/route.ts             # POST add item / update quantity, GET current cart
    ├── cart/discount/route.ts    # POST apply a promo code to the cart
    ├── checkout/shipping/route.ts# POST save shipping info
    ├── checkout/payment/route.ts # POST save payment info
    └── checkout/route.ts         # POST — finalizes the order
```

Every transition that changes state must go through a real `fetch()` to a real route
handler — never fake success client-side with a `setTimeout`. The whole point of this app is
giving `chrome-devtools-mcp` genuine network requests to inspect.

## 6. New features beyond the original spec, and why each earns its place

- **Quantity stepper on product detail and cart** (`+`/`-` buttons, not just "Add to cart")
  — gives the agent a stateful control to reason about across two different pages, and is
  the vehicle for Bug 2 below.
- **Two promo codes with different validity rules** — `"SAVE10"` (always valid, 10% off) and
  `"SAVE20"` (only valid when subtotal ≥ $50) — forces the agent to verify an *outcome*
  (did the total actually change) rather than trust a success message, and is the vehicle
  for Bug 4 below.
- **Three-step checkout (Shipping → Payment → Review) instead of one form** — real
  multi-turn state that must survive navigation both forward and backward. This is the
  single most valuable addition for showcasing Computer Use's long-horizon session handling,
  and is the vehicle for Bugs 3 and 5 below.
- **"Same as shipping" billing checkbox on Payment** — a common, realistic UI shortcut, and
  the vehicle for Bug 3 (the requested 422 bug) below.

## 7. The bugs — build the correct version first, then inject each deliberately

**Process: get the entire happy path working correctly end-to-end first.** Confirm you can
browse → view a product → add to cart with a chosen quantity → apply "SAVE10" → complete all
three checkout steps → reach confirmation, with zero bugs, before injecting anything below.
Re-test that the happy path still works after each injection.

### Bug 1 — `/api/cart`: not idempotent, races on duplicate "Add to cart" click

The handler must **not** check for an existing line item before appending. A second rapid
"Add to cart" click for the same product should push a duplicate line item instead of
incrementing the existing one's quantity — or, under harder timing, throw inside the route
handler and surface as a bare `500`.

```typescript
// src/app/api/cart/route.ts
import { carts } from "@/lib/store";

export async function POST(req: Request) {
  const { sessionId, productId, quantity } = await req.json();

  // Intentional bug: no check for an existing line item for this productId
  // before pushing a new one. The absence of that check IS the bug.
  const cart = carts.get(sessionId) ?? { items: [] };
  cart.items.push({ productId, quantity: quantity ?? 1 });
  carts.set(sessionId, cart);

  return Response.json({ status: "added", itemCount: cart.items.length });
}
```

The "Add to cart" button gives **no loading state and no success toast** on the first
click — this page must fail (or misbehave) silently.

### Bug 2 — quantity stepper: client-side max not enforced, silent server-side clamp

The `+` button on the product/cart quantity stepper must **not** check against `stock`
client-side — it lets the displayed quantity go arbitrarily high. The checkout API,
however, silently clamps the actual charged/shipped quantity down to available stock without
returning any error or warning — so a customer who "orders 5" of a product with `stock: 3`
gets a `200 OK` order confirmation, but the confirmation screen shows only 3 shipped, with
no explanation anywhere of the discrepancy.

```typescript
// src/app/api/checkout/route.ts (excerpt — full handler in Bug 5 below)
function clampToStock(items: CartItem[]): CartItem[] {
  // Intentional bug: silently clamps with no error, no warning field in the
  // response, nothing that would let the client detect this happened.
  return items.map((item) => {
    const product = products.get(item.productId);
    const maxQty  = product?.stock ?? 0;
    return { ...item, quantity: Math.min(item.quantity, maxQty) };
  });
}
```

Zero console errors, zero non-2xx responses — this is a **silent business-logic bug**, not a
crash. The confirmation page must display the *actual* (clamped) shipped quantity, so the
discrepancy is only detectable by comparing the cart-page quantity against the
confirmation-page quantity across two different screens.

### Bug 3 — Payment "same as shipping": the requested 422, non-validating field payload mismatch

This is the bug you specifically asked for. The Payment page has a "Same as shipping
address" checkbox. When checked, the UI **visually disables and greys out** the billing
address fields — implying they're not required — but the checkout API's validation schema
still requires a non-empty `billingAddress` string regardless of the checkbox state. The
frontend never sends a `billingAddress` value when the checkbox is checked (it sends
`undefined`/omits the field entirely), so the request is well-formed JSON but fails
**backend validation** with a `422 Unprocessable Entity` and a field-level error the UI never
surfaces.

```typescript
// src/app/api/checkout/payment/route.ts
import { z } from "zod";

const PaymentSchema = z.object({
  sessionId:      z.string(),
  cardNumber:     z.string().min(12),
  expiry:         z.string(),
  cvc:            z.string().min(3),
  // BUG: billingAddress is required here regardless of "same as shipping" —
  // there is no conditional relaxation of this field based on any
  // sameAsShipping flag, even though the frontend behaves as if there is one.
  billingAddress: z.string().min(5),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = PaymentSchema.safeParse(body);

  if (!parsed.success) {
    // Intentional: return the raw Zod field errors, unfiltered — a real,
    // diagnosable 422 body, not a generic "invalid request" message.
    return Response.json(
      { error: "validation_failed", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const cart = carts.get(parsed.data.sessionId);
  if (!cart) return Response.json({ error: "no_cart" }, { status: 400 });

  cart.payment = {
    cardNumber: parsed.data.cardNumber,
    expiry:     parsed.data.expiry,
    cvc:        parsed.data.cvc,
    billingAddress: parsed.data.billingAddress,
  };
  carts.set(parsed.data.sessionId, cart);

  return Response.json({ status: "saved" });
}
```

```typescript
// src/app/checkout/payment/page.tsx — the bug: sameAsShipping never populates billingAddress
const [sameAsShipping, setSameAsShipping] = useState(true);

async function handleSubmit() {
  const payload = {
    sessionId,
    cardNumber,
    expiry,
    cvc,
    // BUG: when sameAsShipping is true, billingAddress is never set to the
    // shipping address (or anything else) — it's simply omitted, because the
    // UI assumes the checkbox means the backend won't need it. It does.
    ...(sameAsShipping ? {} : { billingAddress }),
  };

  const res = await fetch("/api/checkout/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // BUG: the page shows a generic "Something went wrong, please try again"
    // message regardless of status code — it never reads or displays the
    // 422 response's `fields` object, so the specific missing-field reason
    // is completely invisible in the UI, only visible via network inspection.
    setError("Something went wrong, please try again.");
    return;
  }
  router.push("/checkout/review");
}
```

**Do not fix this by making the frontend send the shipping address as billing when the
checkbox is checked** — the mismatch between "UI implies optional" and "backend requires it"
is the entire bug. A correct real-world fix would be either relaxing the backend schema when
a `sameAsShipping: true` flag is explicitly sent, or having the frontend actually populate
`billingAddress` from the shipping address — but do not make that fix in this repo; this is
the bug QA Sentinel is meant to find and explain, not something to pre-empt.

This bug produces exactly the artifact class your evidence bundle is built around: a `422`
network response with a genuinely informative body (`fields: { billingAddress: [...] }`),
paired with a UI that shows the user nothing useful at all — a clean case of "the backend
knew exactly what was wrong; the frontend threw that information away."

### Bug 4 — promo code: "SAVE20" silently ignored below its minimum, no error shown

`"SAVE20"` (20% off) is only valid when cart subtotal is ≥ $50. Applying it below that
threshold must return a **200 OK success response** with `discountPercent: 0` (not an error)
— the API doesn't reject the code, it just silently applies a zero discount. The frontend
displays "Promo applied!" regardless of the returned `discountPercent` value, so a customer
sees a success message but the total never changes, with no indication why.

```typescript
// src/app/api/cart/discount/route.ts
const PROMO_CODES: Record<string, { percent: number; minSubtotalCents?: number }> = {
  SAVE10: { percent: 10 },
  SAVE20: { percent: 20, minSubtotalCents: 5000 },
};

export async function POST(req: Request) {
  const { sessionId, code } = await req.json();
  const cart = carts.get(sessionId);
  if (!cart) return Response.json({ error: "no_cart" }, { status: 400 });

  const promo = PROMO_CODES[code];
  const subtotal = calculateSubtotal(cart);

  const applicablePercent =
    promo && (!promo.minSubtotalCents || subtotal >= promo.minSubtotalCents)
      ? promo.percent
      : 0;   // BUG: silently 0 instead of returning an error explaining why

  cart.discountPercent = applicablePercent;
  carts.set(sessionId, cart);

  // Always 200 OK, even when the code didn't actually apply — this is the bug.
  return Response.json({ status: "applied", discountPercent: applicablePercent });
}
```

```typescript
// src/app/cart/page.tsx — the bug: success message shown unconditionally
const res = await fetch("/api/cart/discount", { /* ... */ });
const data = await res.json();
if (res.ok) {
  setMessage("Promo applied!");   // BUG: shown even when discountPercent came back as 0
}
```

Zero console errors, zero non-2xx responses — another **silent, business-logic-only bug**,
deliberately distinct in flavor from Bug 3's loud, informative 422.

### Bug 5 — checkout Review step: navigating back to Payment silently drops shipping data

The three-step checkout (`shipping` → `payment` → `review`) stores each step's data via its
own POST, keyed to `sessionId` in the shared `Cart` object (§4) — this part is correct. The
bug: if the user navigates **back** from Review to Payment (e.g., to fix a typo) and
resubmits Payment, the Payment route handler must **overwrite the entire cart's `shipping`
field with `undefined`**, rather than only touching `payment`. This is a classic "route
handler doesn't scope its update to only its own slice of state" bug.

```typescript
// src/app/api/checkout/payment/route.ts — the SAME file as Bug 3, additional bug here
export async function POST(req: Request) {
  // ...validation and cart lookup as in Bug 3...

  // BUG: this replaces the ENTIRE cart object, wiping out the previously-saved
  // `shipping` field, instead of only updating the `payment` slice.
  carts.set(parsed.data.sessionId, {
    items: cart.items,
    discountPercent: cart.discountPercent,
    payment: { /* ...new payment data... */ },
    // shipping is NOT carried forward here — this is the bug.
  });

  return Response.json({ status: "saved" });
}
```

```typescript
// src/app/checkout/review/route.ts (or wherever final checkout reads cart state)
export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const cart = carts.get(sessionId);

  if (!cart?.shipping) {
    // This will now fire on the SECOND payment submission of a
    // shipping->payment->review->back-to-payment->resubmit->review flow,
    // even though the user never touched the shipping page again.
    return Response.json({ error: "missing_shipping_info" }, { status: 400 });
  }
  // ...finalize order...
}
```

This bug only reproduces via a **specific navigation pattern** (forward through all three
steps, then back to Payment, then forward again) — it will not appear on a straight-through
happy path. This is deliberately your hardest, most multi-turn bug: it requires the agent to
actually exercise backward navigation as part of a test step, not just move forward through
a form once.

## 8. What each bug must NOT do — a checklist to verify after building all five

- [ ] Bug 1 (cart race): a single "Add to cart" click works correctly; the bug only
      reproduces on a rapid second click for the same product.
- [ ] Bug 2 (quantity clamp): ordering more than available stock returns `200 OK` with no
      error anywhere; the discrepancy is only visible by comparing the ordered quantity
      (cart page) against the shipped quantity (confirmation page).
- [ ] Bug 3 (422 same-as-shipping): checking "same as shipping" and submitting Payment
      produces a `422` with a real `fields.billingAddress` error in the response body, while
      the UI shows only a generic, unhelpful message. Confirm via devtools that the network
      tab shows the full validation error body even though the page hides it.
- [ ] Bug 4 (SAVE20 silent no-op): applying "SAVE20" on a cart under $50 returns `200 OK`
      with `discountPercent: 0`, and the UI still says "Promo applied!" — zero errors
      anywhere, the total simply doesn't change.
- [ ] Bug 5 (back-navigation state loss): only reproduces via shipping → payment → review →
      back to payment → resubmit → review. A straight-through single pass must work
      correctly with no errors.
- [ ] The full happy path (single quantities within stock, "SAVE10", straight-through
      checkout with no back-navigation, "same as shipping" left unchecked with a real
      billing address entered) must work end-to-end with all five bugs present.

## 9. Build order

1. Scaffold with `create-next-app`, confirm Tailwind v4 landed correctly (§3).
2. Build `lib/store.ts` (§4) with the six seed products, one at permanent zero stock.
3. Build all pages + all API routes with **fully correct** behavior — no bugs yet. Confirm
   the entire happy path works: browse → product detail with quantity stepper → cart with
   working promo codes (both, with correct threshold logic) → shipping → payment (with a
   real, correctly-wired same-as-shipping behavior) → review → confirmation.
4. Inject Bug 1. Verify: single click works; rapid double-click duplicates or 500s.
5. Inject Bug 2. Verify: over-ordering returns 200 OK; confirmation shows clamped quantity
   with zero errors.
6. Inject Bug 3. Verify: same-as-shipping + submit → 422 with `fields.billingAddress` in the
   body; UI shows only a generic message.
7. Inject Bug 4. Verify: SAVE20 under $50 → 200 OK, `discountPercent: 0`, UI still says
   "applied," total unchanged.
8. Inject Bug 5. Verify: straight-through checkout works; the specific
   forward-back-forward navigation pattern loses shipping data and fails at final checkout.
9. Run the full checklist in §8 top to bottom before considering this repo done.
10. Tag or branch a "bugs-fixed" version (all five fixes applied by hand) as a fallback in
    case the live agent demo has a bad run — keep the "bugs-present" version as `main`.