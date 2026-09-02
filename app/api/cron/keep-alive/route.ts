import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Supabase's free tier pauses a project after 7 days with no API activity.
// Vercel Cron hits this once a day (see vercel.json) with a trivial read,
// just to keep the project counted as active — nothing here needs to
// succeed meaningfully, it just needs to happen regularly.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("plants").select("id").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
