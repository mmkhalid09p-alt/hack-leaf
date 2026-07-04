import { createBrowserClient } from "@supabase/ssr";

const SUPABASEURL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const SUPABASEKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Browser client, backed by cookies (not localStorage) via @supabase/ssr.
 * This is what lets middleware.ts's server-side client see the same session
 * that pages establish here — using @supabase/supabase-js's plain createClient()
 * instead would store the session in localStorage only, invisible to the
 * middleware and causing signed-in users to be bounced back to /AuthPage.
 */
export const supabase = createBrowserClient(SUPABASEURL, SUPABASEKEY);
