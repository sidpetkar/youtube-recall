// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getTokensFromCode } from "@/lib/youtube"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?error=${error}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?error=no_code`
    )
  }

  try {
    // Get authenticated user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?error=not_authenticated`
      )
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

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
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?youtube_connected=true`
    )

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
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?error=token_exchange_failed`
    )
  }
}
