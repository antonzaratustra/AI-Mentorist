import { redirect } from "next/navigation";
import LandingPage from "../components/landing-page";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { createSupabaseServerClient } from "../lib/supabase/server";

export default async function Home() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/welcome");
    }
  }

  return <LandingPage isSupabaseReady={isSupabaseConfigured()} />;
}
