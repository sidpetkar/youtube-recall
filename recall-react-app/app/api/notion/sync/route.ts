import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const NOTION_VERSION = "2022-06-28"

function richText(content: string, bold = false, italic = false) {
  return [
    {
      type: "text" as const,
      text: { content: content.slice(0, 2000) },
      annotations: { bold, italic, strikethrough: false, underline: false, code: false, color: "default" },
    },
  ]
}

/** Convert HTML from editor to Notion block children. Server-safe: no DOMParser. */
function htmlToNotionBlocks(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = []
  if (!html || !html.trim()) return blocks

  const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
  const raw = html.replace(/<\/p>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<\/li>/gi, "\n")
  const lines = raw.split(/\n/).map(strip).filter((s) => s.length > 0)

  lines.forEach((line) => {
    if (/^[•\-*]\s/.test(line) || line.startsWith("· ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: richText(line.replace(/^[•\-*·]\s*/, "")) },
      })
    } else {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: richText(line) },
      })
    }
  })
  return blocks
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { pageId, content } = body as { pageId?: string; content?: string }
  if (!pageId || content === undefined) {
    return NextResponse.json({ error: "pageId and content required" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("notion_access_token")
    .eq("id", user.id)
    .single()

  const token = profile?.notion_access_token
  if (!token) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 403 })
  }

  const { data: row } = await supabase
    .from("notion_pages")
    .select("notion_page_id")
    .eq("user_id", user.id)
    .eq("notion_page_id", pageId)
    .single()

  if (!row) {
    return NextResponse.json(
      { error: "Notes page not linked. Refresh the watch page to create one." },
      { status: 404 }
    )
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  }

  const blockId = pageId.replace(/-/g, "")

  const listRes = await fetch(
    `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`,
    { headers }
  )
  if (listRes.ok) {
    const listData = (await listRes.json()) as { results?: { id: string }[] }
    for (const block of listData.results || []) {
      await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": NOTION_VERSION },
      })
    }
  }

  const blocks = htmlToNotionBlocks(content || "")
  if (blocks.length === 0) {
    return NextResponse.json({ ok: true })
  }

  const appendRes = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ children: blocks }),
  })

  if (!appendRes.ok) {
    const err = await appendRes.text()
    console.error("Notion append blocks failed:", appendRes.status, err)
    return NextResponse.json({ error: "Failed to sync to Notion" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
