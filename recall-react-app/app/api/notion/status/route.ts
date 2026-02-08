import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 200 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notion_access_token")
    .eq("id", user.id)
    .single()

  const connected = !!(profile?.notion_access_token)
  return NextResponse.json({ connected })
}
