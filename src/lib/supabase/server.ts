import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASEURL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const SUPABASEKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers (e.g. the OAuth/recovery callback). Reads/writes the same
 * cookies the browser client (src/lib/supabaseClient.ts) and middleware.ts
 * use, so a single session is shared consistently across all three contexts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASEURL, SUPABASEKEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies directly —
          // safe to ignore since middleware.ts refreshes the session on
          // every request that needs it.
        }
      },
    },
  });
}
