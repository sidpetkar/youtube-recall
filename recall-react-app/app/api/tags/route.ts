import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/tags
 * Fetch user's tags with hierarchical structure
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all tags for the user
    const { data: tags, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (error) {
      throw error
    }

    // Organize tags into parent and children
    const parentTags = tags.filter((tag) => !tag.parent_id)
    const childTags = tags.filter((tag) => tag.parent_id)

    // Group children by parent
    const tagsWithChildren = parentTags.map((parent) => ({
      ...parent,
      children: childTags.filter((child) => child.parent_id === parent.id),
    }))

    return NextResponse.json(
      {
        tags: tagsWithChildren,
        allTags: tags, // Also return flat list for convenience
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tags",
        message: error.message,
      },
      { status: 500 }
    )
  }
}
