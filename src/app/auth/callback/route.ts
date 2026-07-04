import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles both OAuth sign-in redirects and password-recovery email links.
 * @supabase/ssr's browser client uses the PKCE flow, so Supabase redirects
 * here with a `?code=` param that must be exchanged for a session
 * server-side before any session cookie exists.
 *
 * `next` lets callers (e.g. the forgot-password flow) choose where to land
 * once the session is established, instead of always going through the
 * profile-completeness check below.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/AuthPage?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${origin}/AuthPage?error=auth_callback_failed`);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/AuthPage`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 = "not found", expected for brand-new users.
    console.error("Profile check error:", profileError);
  }

  if (!profile || !profile.first_name || !profile.last_name) {
    return NextResponse.redirect(`${origin}/complete-profile`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
