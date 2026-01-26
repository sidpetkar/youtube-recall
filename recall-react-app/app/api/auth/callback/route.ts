import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists, if not create it
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single()
        
        if (!profile) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata.full_name || user.user_metadata.name || null,
              avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
            })
          
          if (profileError) {
            console.error("Error creating profile:", profileError)
          }
        }

        // Get the session to extract YouTube tokens
        const { data: { session: fullSession } } = await supabase.auth.getSession()
        
        if (fullSession?.provider_token && fullSession?.provider_refresh_token) {
          // Store YouTube tokens in profile using admin client
          const adminClient = createAdminClient()
          await adminClient
            .from("profiles")
            .update({
              youtube_access_token: fullSession.provider_token,
              youtube_refresh_token: fullSession.provider_refresh_token,
              youtube_connected_at: new Date().toISOString(),
            })
            .eq("id", user.id)
        }
      }
      
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth`)
}
