# CLAUDE.md — Cambria Shop (QA Sentinel demo target app)

Build guideline for Claude Code. Read this whole file before writing any code.

This repo is **not** the agent. This repo is a small, deliberately-buggy e-commerce app that
exists purely so another project — an autonomous QA testing agent called QA Sentinel, built
for the RAISE Summit Hackathon 2026 (Google DeepMind / Vultr track) — has something real to
test, diagnose, and fix live in front of judges. Nothing in this repo talks to Gemini,
Antigravity, or any agent tooling. This is a plain Next.js app that happens to have four
carefully-chosen bugs left in on purpose.

This replaces an earlier SaaS-signup version of this same app. The signup/verify/profile
flow was functionally fine, but too visually flat for a live demo — a product grid, cart,
and checkout gives Computer Use more interesting screens to navigate and gives judges a
more immediately legible "real product" to watch get tested.

## 1. What this app is, in one paragraph

Cambria Shop is a minimal e-commerce flow: browse products → view product detail → add to
cart → view cart → checkout → order confirmation. Five pages, four backend API routes, a
real (if tiny) dependency chain — you cannot reach checkout with an empty or invalid cart,
and checkout cannot succeed without a valid cart total. Four bugs are injected into this
flow, each picked so the symptom looks like a dead end to a naive UI-only tester, but the
actual cause is a diagnosable console error, network failure, or payload mismatch. The point
of this app is to be *interesting to debug*, not to be a good product.

## 2. Non-goals — do not build these, even if they'd make the app feel more complete

- No real payment processor integration (Stripe, etc.) — checkout accepts fake test values
  and never contacts anything external.
- No real product images requiring external hosting — use solid-color placeholder blocks or
  simple inline SVG icons per product; do not spend time sourcing or hotlinking real images.
- No real database — in-memory/module-scope state on the server is correct and intentional
  (see §4 for why).
- No user accounts, login, or auth of any kind — this is a guest-checkout-only flow; adding
  a login system is explicitly out of scope and would only dilute the bug design below.
- No search, filtering, sorting, pagination, reviews, or recommendations — a fixed list of
  6-8 products is enough. Do not build catalog features nobody asked for.
- No design polish beyond "looks like a real small storefront" — Tailwind defaults and a
  clean grid layout are enough; don't spend time on animations or brand identity.

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
  for the current migration steps rather than hand-patching `tailwind.config.js`, since v4
  removes that file entirely in favor of `@theme` in `globals.css`.
- **No ORM, no external database driver.** Plain TypeScript objects held in module scope.
- Package manager: whichever `create-next-app` defaults to is fine (npm is the safe default
  for a repo other people/tools may need to run without extra setup).

## 4. Why in-memory state, explicitly

This is a deliberate architectural choice, not a shortcut. In-memory, module-scope state has
*genuine, explainable failure modes* — race conditions on concurrent writes, state loss on
hot-reload/restart — that make Bug 1 (§6) realistic without needing a fake database layer to
misbehave convincingly. A real Postgres/SQLite backing store would need its own artificial
flakiness injected to reproduce the same bug; module-scope state gives you that flakiness
for free, honestly.

```typescript
// lib/store.ts — the entire "database" for this app
type Product = {
  id:    string;
  name:  string;
  price: number;   // in cents, to avoid floating-point bugs THIS app doesn't intend to have
  stock: number;
};

type CartItem = { productId: string; quantity: number };

type Cart = {
  items:            CartItem[];
  discountPercent?: number;   // set by /api/cart/discount, read (wrongly) by checkout — see Bug 2
};

export const products: Map<string, Product> = new Map([
  ["p1", { id: "p1", name: "Ceramic Mug",       price: 1400, stock: 12 }],
  ["p2", { id: "p2", name: "Canvas Tote Bag",   price: 2200, stock: 8  }],
  ["p3", { id: "p3", name: "Wool Beanie",       price: 1800, stock: 5  }],
  ["p4", { id: "p4", name: "Leather Notebook",  price: 3200, stock: 3  }],
  ["p5", { id: "p5", name: "Enamel Pin Set",    price:  900, stock: 20 }],
  ["p6", { id: "p6", name: "Steel Water Bottle",price: 2600, stock: 0  }],  // permanently out of stock — Bug 4
]);

// keyed by a throwaway session id (cookie), NOT a real user — no auth in this app
export const carts: Map<string, Cart> = new Map();
```

Accept that this state resets on every server restart / hot reload. That's fine — this app
is re-run fresh for every QA Sentinel test session anyway.

## 5. Page + route map

```
src/app/
├── page.tsx                    # product grid — the landing page
├── products/
│   └── [productId]/
│       └── page.tsx            # product detail, "Add to cart" button
├── cart/
│   └── page.tsx                # cart contents, quantity, subtotal, "Checkout" button
├── checkout/
│   └── page.tsx                # shipping + fake payment form, order summary
├── confirmation/
│   └── page.tsx                # final "order placed" screen
└── api/
    ├── cart/route.ts           # POST add item, GET current cart
    ├── cart/discount/route.ts  # POST apply a discount code to the cart
    └── checkout/route.ts       # POST — "completes" the fake purchase
```

Every transition that changes state must go through a real `fetch()` to a real route
handler — never fake success client-side with a `setTimeout`. The whole point of this app is
giving `chrome-devtools-mcp` genuine network requests to inspect; a client-only mock defeats
that. Reading the product grid itself can be a plain server component (no client fetch
needed) since it's static data with no state mutation involved.

## 6. The four bugs — build the correct version first, then inject each deliberately

**Process: get the entire happy path working correctly end-to-end first.** Confirm you can
browse → view a product → add to cart → view cart with correct subtotal → check out → see
the confirmation screen, with zero bugs, before injecting anything. Only once that full
chain works should you introduce the four bugs below, one at a time, re-testing that the
happy path is still reachable after each injection (with the specific bugged action instead
of the correct one).

### Bug 1 — `/api/cart`: not idempotent, races on duplicate "Add to cart" click

The handler must **not** check for an existing line item before appending. If "Add to cart"
is called twice in quick succession for the same product (exactly what happens if a test
agent clicks, sees no immediate visual confirmation, and reasonably clicks again), the
second call should push a **duplicate line item** instead of incrementing quantity on the
existing one — and if it races hard enough against the same `Cart` object, an unhandled
error inside the route handler should surface as a bare `500` with no descriptive body.

```typescript
// src/app/api/cart/route.ts
import { carts } from "@/lib/store";

export async function POST(req: Request) {
  const { sessionId, productId } = await req.json();

  // Intentional bug: no check for an existing line item for this productId
  // before pushing a new one. The absence of that check IS the bug — do not
  // add it.
  const cart = carts.get(sessionId) ?? { items: [] };
  cart.items.push({ productId, quantity: 1 });
  carts.set(sessionId, cart);

  return Response.json({ status: "added", itemCount: cart.items.length });
}
```

The "Add to cart" button itself should give **no loading state and no success toast on the
first click** — a spinner or a visible "Added!" confirmation would let a UI-only tester
notice the double-add without ever needing console/network evidence, which defeats the
bug's purpose. This page must fail (or misbehave) silently.

### Bug 2 — cart discount: field-name mismatch, silent, zero console/network errors

The discount-code form posts `{ code: "SAVE10" }` to `/api/cart/discount`, which calculates
and stores a `discountPercent` — but the checkout page reads a differently-named field
(`discount` instead of `discountPercent`) when computing the final total. This produces a
**silently wrong total, with a clean 200 OK on both requests** — no error, no red text in
devtools, just an incorrect number displayed. This is the important one to get exactly
right: it must produce **zero console errors and zero failed network requests.**

```typescript
// src/app/api/cart/discount/route.ts — this side is CORRECT
export async function POST(req: Request) {
  const { sessionId, code } = await req.json();
  const cart = carts.get(sessionId);
  if (!cart) return Response.json({ error: "no_cart" }, { status: 400 });

  const discountPercent = code === "SAVE10" ? 10 : 0;
  cart.discountPercent = discountPercent;
  carts.set(sessionId, cart);

  return Response.json({ status: "applied", discountPercent });   // 200 OK, correct
}
```

```typescript
// src/app/checkout/page.tsx — the bug: reads the wrong field name
const subtotal = calculateSubtotal(cart);
const discount = cart.discount ?? 0;   // BUG: should read cart.discountPercent
const total    = subtotal * (1 - discount / 100);
// Since cart.discount is always undefined, `discount` is always 0 here —
// the discount code silently has no effect on the displayed total, even
// though /api/cart/discount reported success.
```

Do not add a fallback that makes this "just work" (e.g. checking both field names) — the
mismatch is the entire bug. If you accidentally make this throw or log anything, you've
turned a silent data bug into a loud one and lost the point of including it.

### Bug 3 — checkout: header-gated 403, config-style failure

`/api/checkout/route.ts` must reject any request missing a specific custom header, returning
a `403` with a descriptive JSON error body. The checkout page's `fetch()` call must simply
never send that header — a stand-in for the realistic case of a security/config hardening
step breaking a legitimate client. This is your clean, reliable, high-confidence bug: a real
console-visible failure with an unambiguous cause.

```typescript
// src/app/api/checkout/route.ts
export async function POST(req: Request) {
  if (!req.headers.get("x-client-version")) {
    return Response.json({ error: "missing_client_header" }, { status: 403 });
  }
  const { sessionId } = await req.json();
  const cart = carts.get(sessionId);
  if (!cart || cart.items.length === 0) {
    return Response.json({ error: "empty_cart" }, { status: 400 });
  }
  // ... "process" the fake payment, clear the cart
  carts.delete(sessionId);
  return Response.json({ status: "order_placed" });
}
```

```typescript
// src/app/checkout/page.tsx — the bug: fetch never sends the required header
const res = await fetch("/api/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },   // missing x-client-version
  body: JSON.stringify({ sessionId }),
});
```

The checkout page should show no error message on a `403` — just stay on the same screen
with no visible feedback, same silent-failure pattern as Bug 1.

### Bug 4 — permanently out-of-stock product: "Add to cart" button not disabled

`p6` ("Steel Water Bottle") has `stock: 0` in the seed data (§4) and will always have zero
stock — there is no restock mechanism in this app, so this is a stable, always-reproducible
edge case, not a race condition. The product detail page for `p6` must render the "Add to
cart" button as **enabled and clickable** regardless of stock level — the bug is the
*missing* disabled-state check, not any dynamic stock logic.

```typescript
// src/app/products/[productId]/page.tsx
// BUG: no check on product.stock before rendering the button as enabled.
// A correct implementation would disable the button (or hide it) when
// stock === 0; this version does neither.
<button onClick={handleAddToCart} className="...">
  Add to cart
</button>
```

Clicking "Add to cart" on this product should hit `/api/cart` per Bug 1's handler above,
which has **no stock check either** — so it succeeds with a `200 OK` and silently adds an
unpurchasable item to the cart. The bug only becomes visible at checkout, where the "order
placed" response should still succeed (per Bug 3's handler above, which also has no stock
validation) — meaning a customer can complete an order for an item that will never ship,
with zero errors anywhere in the flow. This is your second **silent, zero-error** bug,
deliberately distinct from Bug 2's "wrong number" flavor — this one is "wrong business
outcome, no wrong number at all."

## 7. What each bug must NOT do — a checklist to verify after building all four

- [ ] Bug 1 (cart race): a single "Add to cart" click should actually work correctly. The
      bug only reproduces on a **second**, near-simultaneous click for the same product.
- [ ] Bug 2 (discount): **zero console errors, zero non-2xx network responses.** Apply
      "SAVE10" at checkout, confirm the API returns `discountPercent: 10` successfully, but
      the displayed total does not change. Confirm via browser devtools that both tabs are
      clean before considering this bug done.
- [ ] Bug 3 (checkout header): the 403 response body must contain a clear, specific error
      string (`missing_client_header`) — this is the one deliberately *informative* failure,
      so a diagnosing agent (or a human) has a real, specific clue.
- [ ] Bug 4 (out-of-stock): the "Add to cart" button on `p6` must be visibly identical to
      every in-stock product's button — no disabled state, no "out of stock" label, no
      visual difference at all. The bug is only detectable by completing the flow and
      noticing the order for an unavailable item was accepted.
- [ ] The full happy path (any in-stock product, no discount code, correct checkout flow)
      must work end-to-end with all four bugs present — none of these bugs should block the
      *correct* path, only the specific interaction each one targets.

## 8. Build order

1. Scaffold with `create-next-app`, confirm Tailwind v4 landed correctly (§3).
2. Build `lib/store.ts` (§4) with the six seed products, one already at zero stock.
3. Build all five pages + three API routes with **fully correct** behavior — no bugs yet.
   Manually walk through browse → product detail → add to cart → view cart with correct
   subtotal → checkout → confirmation, and confirm it works cleanly, including a working
   discount code path with the field names matching correctly.
4. Inject Bug 1. Manually verify: single click works, rapid double-click produces a
   duplicate line item (or a 500, depending on timing) with no visible page feedback either
   way.
5. Inject Bug 2. Manually verify: applying "SAVE10" returns a successful API response, but
   the checkout total is unchanged — confirm zero console/network errors via devtools.
6. Inject Bug 3. Manually verify: checkout appears to do nothing, and the network tab shows
   a 403 with the specific `missing_client_header` error body.
7. Inject Bug 4. Manually verify: `p6`'s "Add to cart" button looks and behaves identically
   to any in-stock product's button, and a full checkout for it succeeds with no errors
   anywhere.
8. Run the full checklist in §7 top to bottom before considering this repo done.
9. Tag or branch a "bugs-fixed" version (all four fixes applied by hand) as a fallback in
   case the live agent demo has a bad run — keep the "bugs-present" version as `main`.