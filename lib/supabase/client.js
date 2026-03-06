"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

let browserClient = null;

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }

  return browserClient;
}
