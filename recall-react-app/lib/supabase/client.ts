import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types/supabase"

/**
 * Create a Supabase client for use in the browser (client components)
 * This client automatically handles cookie-based sessions
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
