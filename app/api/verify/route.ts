import { signups } from "@/lib/store";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return Response.json({ error: "missing_token" }, { status: 400 });
  }

  const entry = [...signups.entries()].find(
    ([, record]) => record.verificationToken === token
  );

  if (!entry) {
    return Response.json({ error: "invalid_token" }, { status: 400 });
  }

  const [email, record] = entry;
  signups.set(email, { ...record, verified: true });

  return Response.json({ status: "verified", email });
}
