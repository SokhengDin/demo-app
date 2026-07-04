import { profiles } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const profile = email ? profiles.get(email) : undefined;

  if (!profile) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  return Response.json({ plan: profile.plan });
}
