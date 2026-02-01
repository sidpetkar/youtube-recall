// @ts-nocheck
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getLikedVideos } from "@/lib/youtube"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("youtube_access_token")?.value
    const refreshToken = request.cookies.get("youtube_refresh_token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please connect your YouTube account." },
        { status: 401 }
      )
    }

    const maxResults = parseInt(
      request.nextUrl.searchParams.get("maxResults") || "10",
      10
    )

    const videos = await getLikedVideos(accessToken, refreshToken, maxResults)

    return NextResponse.json({ videos })
  } catch (error: any) {
    console.error("Error fetching liked videos:", error)

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Authentication expired. Please reconnect your YouTube account." },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch liked videos" },
      { status: 500 }
    )
  }
}
