import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeOnboarding } from "@/app/actions";
import OnboardForm from "@/components/OnboardForm";

export default async function OnboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // If they already onboarded, send them home.
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/");

  const defaultName: string =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email?.split("@")[0] ?? "spritz fan");

  return (
    <main className="flex flex-1 flex-col gap-6 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="display text-[44px]">Welcome, friend.</h1>
        <p className="text-[var(--color-ink-muted)]">Pick a face. Pick a hue. We&rsquo;ll do the rest.</p>
      </header>
      <OnboardForm action={completeOnboarding} defaultName={defaultName} initialError={error} />
    </main>
  );
}
