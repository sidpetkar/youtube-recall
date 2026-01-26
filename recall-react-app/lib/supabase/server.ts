import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/supabase"
import type { NextRequest } from "next/server"

/**
 * Create a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * This client uses cookies for session management
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client that supports Bearer token auth (for Chrome extension)
 * Falls back to cookie-based auth if no Bearer token is provided
 */
export async function createClientWithAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  
  // If Bearer token is provided, use it
  if (authHeader?.startsWith("Bearer ")) {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: authHeader } },
      }
    )
    
    // Set the session with the provided token
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { supabase, user: null, error: error || new Error("Invalid token") }
    }
    
    return { supabase, user, error: null }
  }
  
  // Fall back to cookie-based auth
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return { supabase, user, error }
}

/**
 * Create a Supabase admin client with service role key
 * Use this ONLY for operations that need to bypass RLS (e.g., storing YouTube tokens)
 * NEVER expose this client to the browser!
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
