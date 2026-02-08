import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const NOTION_AUTH_URL = "https://api.notion.com/v1/oauth/authorize"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get("next") ?? "/"
  const clientId = process.env.NOTION_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  if (!clientId) {
    return NextResponse.json(
      { error: "Notion integration not configured" },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL("/auth", appUrl))
  }

  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/notion/callback`
  const state = Buffer.from(JSON.stringify({ next, userId: user.id })).toString("base64url")
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    owner: "user",
    redirect_uri: redirectUri,
    state,
  })

  const authUrl = `${NOTION_AUTH_URL}?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
