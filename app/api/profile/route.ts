import { profiles } from "@/lib/store";

export async function POST(req: Request) {
  const { email, name, company, plan } = await req.json();

  profiles.set(email, { name, company, plan });

  return Response.json({ status: "ok" });
}
