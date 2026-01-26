import { NextRequest, NextResponse } from "next/server"
import { createClientWithAuth } from "@/lib/supabase/server"

/**
 * GET /api/folders
 * Fetch user's folders with optional video counts
 * Supports both cookie auth (web app) and Bearer token auth (Chrome extension)
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await createClientWithAuth(request)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCount = searchParams.get("includeCount") === "true"

    const { data: folders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("position_index", { ascending: true })

    if (foldersError) {
      throw foldersError
    }

    // Optionally add video counts
    if (includeCount) {
      const foldersWithCounts = await Promise.all(
        (folders || []).map(async (folder) => {
          const { count } = await supabase
            .from("videos")
            .select("id", { count: "exact", head: true })
            .eq("folder_id", folder.id)

          return {
            ...folder,
            video_count: count || 0,
          }
        })
      )

      return NextResponse.json({ folders: foldersWithCounts }, { status: 200 })
    }

    return NextResponse.json({ folders: folders || [] }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching folders:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch folders",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/folders
 * Create a new folder
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folder = await VideoService.createFolder(user.id, name.trim())

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating folder:", error)
    return NextResponse.json(
      {
        error: "Failed to create folder",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/folders
 * Reorder folders (for drag-drop)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { folderIds } = body

    if (!folderIds || !Array.isArray(folderIds)) {
      return NextResponse.json(
        { error: "folderIds array is required" },
        { status: 400 }
      )
    }

    await VideoService.reorderFolders(user.id, folderIds)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error reordering folders:", error)
    return NextResponse.json(
      {
        error: "Failed to reorder folders",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/folders
 * Delete a folder
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("id")

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    await VideoService.deleteFolder(folderId, user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting folder:", error)
    return NextResponse.json(
      {
        error: "Failed to delete folder",
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/folders
 * Update/rename a folder
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name } = body

    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder ID and name are required" },
        { status: 400 }
      )
    }

    // Update folder name
    const { data: folder, error: updateError } = await supabase
      .from("folders")
      .update({ name: name.trim() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ folder }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating folder:", error)
    return NextResponse.json(
      {
        error: "Failed to update folder",
        message: error.message,
      },
      { status: 500 }
    )
  }
}
