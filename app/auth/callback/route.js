import { NextResponse } from "next/server";
import { getSiteUrl, isSupabaseConfigured } from "../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function buildRedirect(origin, nextPath = "/welcome") {
  if (!nextPath.startsWith("/")) {
    return `${origin}/welcome`;
  }

  return `${origin}${nextPath}`;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/welcome";
  const origin = requestUrl.origin || getSiteUrl();

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/`);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(buildRedirect(origin, next));
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
