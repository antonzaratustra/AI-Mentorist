import { redirect } from "next/navigation";
import SupabaseSetupCard from "../../components/supabase-setup-card";
import WorkspaceShell from "../../components/workspace-shell";
import { createInitialState } from "../../components/mentorist-data";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function WorkspacePage({ searchParams }) {
  const params = await searchParams;
  const isPreview = params?.preview === "1";

  if (isPreview) {
    return (
      <WorkspaceShell
        initialWorkspaceState={createInitialState()}
        syncEnabled={false}
        user={{
          id: "preview-user",
        }}
        userLabel="Preview user"
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

  const { data: onboarding, error: onboardingError } = await supabase
    .from("user_onboarding")
    .select("display_name, onboarding_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (onboardingError) {
    return <SupabaseSetupCard title="Workspace не может загрузиться, пока нет таблицы onboarding." />;
  }

  if (!onboarding?.onboarding_completed_at) {
    redirect("/welcome");
  }

  const { data: workspaceState, error: workspaceError } = await supabase
    .from("user_workspace_state")
    .select("app_state")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <WorkspaceShell
      initialWorkspaceState={workspaceState?.app_state ?? null}
      syncEnabled={!workspaceError}
      user={{
        id: user.id,
      }}
      userLabel={onboarding.display_name ?? user.user_metadata?.full_name ?? user.email ?? "Mentorist user"}
    />
  );
}
