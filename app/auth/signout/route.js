import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const requestUrl = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(`${requestUrl.origin}/`, { status: 303 });
}
