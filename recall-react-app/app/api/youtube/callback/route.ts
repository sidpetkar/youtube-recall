// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getTokensFromCode } from "@/lib/youtube"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Use request origin so we redirect back to the same host (localhost vs prod)
  const baseUrl = requestUrl.origin
  const redirectBase = baseUrl.replace(/\/$/, "")

  if (error) {
    return NextResponse.redirect(`${redirectBase}/auth?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${redirectBase}/auth?error=no_code`)
  }

  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${redirectBase}/auth?error=not_authenticated`)
    }

    // Exchange code for tokens (pass baseUrl so redirect_uri matches what we sent to Google)
    const tokens = await getTokensFromCode(code, baseUrl)

    if (!tokens.access_token) {
      throw new Error("No access token received")
    }

    // Use admin client to store tokens (bypassing RLS)
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        youtube_access_token: tokens.access_token,
        youtube_refresh_token: tokens.refresh_token || null,
        youtube_connected_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error storing YouTube tokens:", updateError)
      throw updateError
    }

    // Also store in cookies for backward compatibility with existing code
    const response = NextResponse.redirect(`${redirectBase}?youtube_connected=true`)

    response.cookies.set("youtube_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (tokens.refresh_token) {
      response.cookies.set("youtube_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    return response
  } catch (err) {
    console.error("Error exchanging code for tokens:", err)
    return NextResponse.redirect(`${redirectBase}/auth?error=token_exchange_failed`)
  }
}
