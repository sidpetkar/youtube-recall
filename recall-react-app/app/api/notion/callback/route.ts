import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token"
const NOTION_VERSION = "2022-06-28"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const errorParam = searchParams.get("error")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const baseUrl = appUrl.replace(/\/$/, "")

  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}/auth?error=notion_denied`)
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${baseUrl}/auth?error=notion_callback`)
  }

  let state: { next?: string; userId?: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString())
  } catch {
    return NextResponse.redirect(`${baseUrl}/auth?error=notion_invalid_state`)
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/auth?error=notion_config`)
  }

  const redirectUri = `${baseUrl}/api/notion/callback`

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  })

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const tokenRes = await fetch(NOTION_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authHeader}`,
      "Notion-Version": NOTION_VERSION,
    },
    body: body.toString(),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error("Notion token exchange failed:", tokenRes.status, err)
    return NextResponse.redirect(`${baseUrl}/auth?error=notion_token`)
  }

  const data = (await tokenRes.json()) as {
    access_token: string
    workspace_id: string
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || (state.userId && user.id !== state.userId)) {
    return NextResponse.redirect(`${baseUrl}/auth`)
  }

  const adminClient = createAdminClient()
  await adminClient
    .from("profiles")
    .update({
      notion_access_token: data.access_token,
      notion_workspace_id: data.workspace_id,
      notion_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  const next = state.next && state.next.startsWith("/") ? state.next : "/"
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocal = process.env.NODE_ENV === "development"
  if (isLocal) {
    return NextResponse.redirect(`${baseUrl}${next}`)
  }
  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  }
  return NextResponse.redirect(`${baseUrl}${next}`)
}
