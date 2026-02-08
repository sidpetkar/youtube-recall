import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const NOTION_VERSION = "2022-06-28"

async function getNotionToken(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("notion_access_token")
    .eq("id", userId)
    .single()
  return data?.notion_access_token ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get("videoId")
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const existing = await supabase
    .from("notion_pages")
    .select("notion_page_id")
    .eq("user_id", user.id)
    .eq("youtube_video_id", videoId)
    .single()

  if (existing.data?.notion_page_id) {
    return NextResponse.json({ pageId: existing.data.notion_page_id })
  }

  const token = await getNotionToken(user.id)
  if (!token) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 403 })
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  }

  const searchRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: { property: "object", value: "page" },
      page_size: 1,
    }),
  })

  if (!searchRes.ok) {
    const err = await searchRes.text()
    console.error("Notion search failed:", searchRes.status, err)
    return NextResponse.json(
      { error: "Could not find a page in Notion. Share at least one page with the integration." },
      { status: 502 }
    )
  }

  const searchData = (await searchRes.json()) as { results?: { id: string }[] }
  const parentId = searchData.results?.[0]?.id
  if (!parentId) {
    return NextResponse.json(
      { error: "No pages found. Share a page with the integration in Notion." },
      { status: 502 }
    )
  }

  const createRes = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId.replace(/-/g, "") },
      properties: {
        title: {
          type: "title",
          title: [{ type: "text", text: { content: `Recall notes · ${videoId}` } }],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "Notes for this video." } }],
          },
        },
      ],
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    console.error("Notion create page failed:", createRes.status, err)
    return NextResponse.json({ error: "Failed to create Notion page" }, { status: 502 })
  }

  const pageData = (await createRes.json()) as { id: string }
  const notionPageId = pageData.id

  const { error: insertError } = await supabase.from("notion_pages").insert({
    user_id: user.id,
    youtube_video_id: videoId,
    notion_page_id: notionPageId,
  })

  if (insertError) {
    console.error("Notion page insert failed:", insertError)
    return NextResponse.json(
      { error: "Failed to save notes page. Make sure the notion_pages table exists and RLS allows insert." },
      { status: 500 }
    )
  }

  return NextResponse.json({ pageId: notionPageId })
}
