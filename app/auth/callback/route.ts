import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(errorDescription ?? error)}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL(`/auth/error?reason=missing_code`, url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(exchangeError.message)}`, url.origin),
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/auth/error?reason=no_user`, url.origin));
  }

  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return NextResponse.redirect(new URL(participant ? "/" : "/onboard", url.origin));
}
