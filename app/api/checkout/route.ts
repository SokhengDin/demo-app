import { profiles } from "@/lib/store";

export async function POST(req: Request) {
  if (!req.headers.get("x-client-version")) {
    return Response.json({ error: "missing_client_header" }, { status: 403 });
  }

  const { email } = await req.json();
  const profile = profiles.get(email);

  if (profile) {
    profiles.set(email, { ...profile, purchased: true });
  }

  return Response.json({ status: "purchased" });
}
