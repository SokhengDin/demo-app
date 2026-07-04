import { signups } from "@/lib/store";

const inFlight = new Map<string, { id: string }>();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Intentional bug: no check for an existing/in-flight signup before
  // starting a new one. A single request is fine. But two rapid calls for
  // the same email both register themselves as "the" in-flight signup; the
  // one that finishes second finds that the first call already deleted the
  // in-flight marker out from under it, and crashes dereferencing it.
  const marker = { id: crypto.randomUUID() };
  inFlight.set(email, marker);

  const verificationToken = crypto.randomUUID();

  // Simulated persistence latency, standing in for a real datastore write.
  await new Promise((resolve) => setTimeout(resolve, 50));

  signups.set(email, {
    id: marker.id,
    password,
    verified: false,
    verificationToken,
  });

  // BUG: assumes the marker this call registered is still the one in the
  // map. On a race, the other call's completion already deleted it.
  const current = inFlight.get(email)!;
  inFlight.delete(email);
  if (current.id !== marker.id) {
    throw new Error("in-flight marker mismatch");
  }

  return Response.json({ status: "pending_verification", verificationToken });
}
