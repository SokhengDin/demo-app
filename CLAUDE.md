# CLAUDE.md — Cambria (QA Sentinel demo target app)

Build guideline for Claude Code. Read this whole file before writing any code.

This repo is **not** the agent. This repo is a small, deliberately-buggy SaaS signup app that
exists purely so another project — an autonomous QA testing agent called QA Sentinel, built
for the RAISE Summit Hackathon 2026 (Google DeepMind / Vultr track) — has something real to
test, diagnose, and fix live in front of judges. Nothing in this repo talks to Gemini,
Antigravity, or any agent tooling. This is a plain Next.js app that happens to have four
carefully-chosen bugs left in on purpose.

## 1. What this app is, in one paragraph

Cambria is a minimal SaaS signup + onboarding flow: sign up → verify email → set up profile
→ checkout. Four pages, four backend API routes, a real (if tiny) dependency chain — you
genuinely cannot reach checkout without a verified, profiled account. Four bugs are injected
into this flow, each picked so that the symptom looks like a dead end to a naive UI-only
tester, but the actual cause is a diagnosable console error, network failure, or payload
mismatch. The point of this app is to be *interesting to debug*, not to be a good product.

## 2. Non-goals — do not build these, even if they'd make the app feel more complete

- No real payment processor integration (Stripe, etc.) — checkout accepts fake test values
  and never contacts anything external.
- No real email delivery — "email verification" is simulated via a test endpoint that hands
  back a verification link directly in the UI, no SMTP, no email provider.
- No real database — in-memory/module-scope state on the server is correct and intentional
  (see §4 for why).
- No authentication/session security beyond a throwaway cookie — this app is never exposed
  publicly and never handles real user data.
- No design polish beyond "looks like a real SaaS onboarding flow" — Tailwind defaults and a
  clean layout are enough; don't spend time on animations, illustrations, or brand identity.

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
type SignupRecord = { id: string; password: string; verified: boolean };
type ProfileRecord = { name: string; company: string; plan?: string };

export const signups:  Map<string, SignupRecord>  = new Map();  // keyed by email
export const profiles: Map<string, ProfileRecord>  = new Map();  // keyed by email
```

Accept that this state resets on every server restart / hot reload. That's fine — this app
is re-run fresh for every QA Sentinel test session anyway.

## 5. Page + route map

```
src/app/
├── page.tsx                    # landing page, link to /signup
├── signup/
│   └── page.tsx                # signup form
├── check-email/
│   └── page.tsx                # "check your email" holding screen, shows the
│                                #   simulated verification link directly (no real email)
├── verify/
│   └── page.tsx                # reads a token from the URL, calls /api/verify
├── profile/
│   └── page.tsx                # name + company + plan dropdown
├── checkout/
│   └── page.tsx                # payment form (fake values only)
├── welcome/
│   └── page.tsx                # final confirmation screen
└── api/
    ├── signup/route.ts         # POST — creates a pending signup
    ├── verify/route.ts         # POST — marks a signup verified
    ├── profile/route.ts        # POST — stores profile + plan
    └── checkout/route.ts       # POST — "completes" the fake purchase
```

Every transition between pages must go through a real `fetch()` to a real route handler —
never fake success client-side with a `setTimeout`. The whole point of this app is giving
`chrome-devtools-mcp` genuine network requests to inspect; a client-only mock defeats that.

## 6. The four bugs — build the correct version first, then inject each deliberately

**Process: get the entire happy path working correctly end-to-end first.** Confirm you can
sign up → verify → set up profile → check out → see the welcome screen, with zero bugs,
before injecting anything. Only once that full chain works should you introduce the four
bugs below, one at a time, re-testing the happy path is still reachable after each injection
(with the specific bugged action instead of the correct one).

### Bug 1 — `/api/signup`: not idempotent, races on duplicate submit

The handler must **not** guard against an email that's already mid-signup. If called twice
in quick succession for the same email (which is exactly what happens if a test agent clicks
"Sign up," sees no visible feedback, and reasonably clicks again), the second call should
throw an unhandled error inside the route handler, surfacing as a bare `500` with no
descriptive body.

```typescript
// src/app/api/signup/route.ts
import { signups } from "@/lib/store";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Intentional bug: no existence check before writing. A second rapid call
  // for the same email creates a plain race — do not "fix" this by adding
  // a guard; the absence of a guard IS the bug.
  const id = crypto.randomUUID();
  signups.set(email, { id, password, verified: false });

  return Response.json({ status: "pending_verification" });
}
```

The signup page itself should give **no loading state and no error message on failure** —
a spinner or a visible error banner would let a UI-only tester diagnose this without ever
needing console/network evidence, which defeats the bug's purpose (see `task_3.md` §0 in
the QA Sentinel repo for why this matters to the agent side — you don't need that file to
build this repo, but the constraint is: **this page must fail silently**).

### Bug 2 — verification: query param name mismatch

The link shown on `/check-email` must use `?vtoken=<token>`, but `/verify/page.tsx` must
read `searchParams.token` (not `vtoken`). This is a plain, realistic naming mismatch — not
an exotic bug, just the kind of thing that actually ships.

```typescript
// src/app/check-email/page.tsx — generates the (simulated) verification link
const verificationUrl = `/verify?vtoken=${token}`;   // note: vtoken
```

```typescript
// src/app/verify/page.tsx — the bug
export default function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };   // BUG: should read `vtoken`
}) {
  const token = searchParams.token;    // always undefined
  // ... calls /api/verify with { token: undefined }, which the API correctly rejects
}
```

```typescript
// src/app/api/verify/route.ts — this side is CORRECT, do not "fix" it to be lenient
export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) {
    return Response.json({ error: "missing_token" }, { status: 400 });
  }
  // ... look up and mark verified
}
```

The verify page should show a generic, unhelpful "Something went wrong" message on failure
— again, deliberately uninformative, so the real cause only surfaces via network inspection.

### Bug 3 — profile: form field name doesn't match API's expected key

The `<select>` for plan choice must be named `selectedPlan` client-side, while
`/api/profile/route.ts` destructures `plan` from the request body. This produces `undefined`
silently — **no console error, no failed request, a clean 200 OK** — the response is
"successful" and simply carries the wrong data forward.

```typescript
// src/app/profile/page.tsx
<select name="selectedPlan">              {/* BUG: API reads "plan", not "selectedPlan" */}
  <option value="starter">Starter</option>
  <option value="pro">Pro</option>
  <option value="enterprise">Enterprise</option>
</select>
```

```typescript
// src/app/api/profile/route.ts
export async function POST(req: Request) {
  const { name, company, plan } = await req.json();  // "plan" is always undefined
  profiles.set(email, { name, company, plan });        // stores plan: undefined
  return Response.json({ status: "ok" });               // 200 — nothing "fails"
}
```

`/checkout/page.tsx` must then display whatever plan value it received verbatim, including
literally rendering the string `"undefined"` if that's what's stored — do not add a fallback
like `plan ?? "Unknown"` that would mask the bug's visible symptom.

This bug is the important one to get exactly right: it must produce **zero console errors
and zero failed network requests.** If you accidentally make this throw somewhere, you've
turned a "silent data bug" into a "loud crash bug" and lost the point of including it.

### Bug 4 — checkout: header-gated 403, config-style failure

`/api/checkout/route.ts` must reject any request missing a specific custom header, returning
a `403` with a descriptive JSON error body. The checkout page's `fetch()` call must simply
never send that header — a stand-in for the realistic case of a security/config hardening
step breaking a legitimate client.

```typescript
// src/app/api/checkout/route.ts
export async function POST(req: Request) {
  if (!req.headers.get("x-client-version")) {
    return Response.json({ error: "missing_client_header" }, { status: 403 });
  }
  // ... "process" the fake payment, mark profile as purchased
  return Response.json({ status: "purchased" });
}
```

```typescript
// src/app/checkout/page.tsx — the bug: fetch never sends the required header
const res = await fetch("/api/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },   // missing x-client-version
  body: JSON.stringify(paymentDetails),
});
```

The checkout page should show no error message on a `403` — just stay on the same screen
with no visible feedback, same silent-failure pattern as Bugs 1 and 2.

## 7. What each bug must NOT do — a checklist to verify after building all four

- [ ] Bug 1 (signup): first click alone should actually work correctly. The bug only
      reproduces on a **second**, near-simultaneous submit for the same email.
- [ ] Bug 2 (verify): the verify page shows no field-specific error, just a generic failure
      message — the real cause must only be visible in the network request body.
- [ ] Bug 3 (profile): **zero console errors, zero non-2xx network responses.** This is the
      one silent, non-crash bug — confirm this explicitly by opening devtools yourself and
      checking both tabs are clean before considering this bug "done."
- [ ] Bug 4 (checkout): the 403 response body must contain a clear, specific error string
      (`missing_client_header`) — this is the one deliberately *informative* failure, so a
      diagnosing agent (or a human) has a real, specific clue.
- [ ] The full happy path (correct email, correct token, correct field names, correct
      header) must work end-to-end with all four bugs present — none of these bugs should
      block the *correct* path, only the specific broken interaction each one targets.

## 8. Build order

1. Scaffold with `create-next-app`, confirm Tailwind v4 landed correctly (§3).
2. Build `lib/store.ts` (§4).
3. Build all four pages + four API routes with **fully correct** behavior — no bugs yet.
   Manually walk through signup → verify → profile → checkout → welcome and confirm it
   works cleanly.
4. Inject Bug 1. Manually verify: single click works, rapid double-click reproduces a silent
   500 with no visible page feedback.
5. Inject Bug 2. Manually verify: verification fails silently with a generic message, and
   the network tab shows the `token: undefined` request body.
6. Inject Bug 3. Manually verify: profile submission succeeds (200), but checkout shows the
   wrong/undefined plan — and confirm via browser devtools that no console error and no
   failed request occurred. This is the one to double- and triple-check.
7. Inject Bug 4. Manually verify: checkout appears to do nothing, and the network tab shows
   a 403 with the specific `missing_client_header` error body.
8. Run the full checklist in §7 top to bottom before considering this repo done.
9. Tag or branch a "bugs-fixed" version (all four fixes applied by hand) as a fallback in
   case the live agent demo has a bad run — keep the "bugs-present" version as `main`.