// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/youtube"

export async function GET(request: Request) {
  try {
    // Use request origin so local sign-in stays on localhost (no prod redirect)
    const origin = new URL(request.url).origin
    const authUrl = getAuthUrl(origin)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 }
    )
  }
}
