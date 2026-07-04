import { createClient } from "@supabase/supabase-js";

const SUPABASEURL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const SUPABASEKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(SUPABASEURL, SUPABASEKEY);
