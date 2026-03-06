import { redirect } from "next/navigation";
import BalanceOnboarding from "../../components/balance-onboarding";
import SupabaseSetupCard from "../../components/supabase-setup-card";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function WelcomePage({ searchParams }) {
  const params = await searchParams;
  const isPreview = params?.preview === "1";

  if (isPreview) {
    return (
      <BalanceOnboarding
        initialDisplayName="Марина"
        schemaReady={false}
        user={{
          id: "preview-user",
          email: "preview@mentorist.app",
          userMetadata: {},
        }}
      />
    );
  }

  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: onboarding, error } = await supabase
    .from("user_onboarding")
    .select("display_name, onboarding_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (onboarding?.onboarding_completed_at) {
    redirect("/workspace");
  }

  if (error && error.code !== "PGRST116") {
    return <SupabaseSetupCard title="Auth уже работает, но onboarding-таблица еще недоступна." />;
  }

  return (
    <BalanceOnboarding
      initialDisplayName={onboarding?.display_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""}
      schemaReady={!error || error.code === "PGRST116"}
      user={{
        id: user.id,
        email: user.email ?? "",
        userMetadata: user.user_metadata ?? {},
      }}
    />
  );
}
