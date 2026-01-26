import type { Folder } from "@shared/types/database"
import type { AddVideoByUrlRequest, AddVideoByUrlResponse } from "@shared/types/api"

const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:3000"

/**
 * Fetch user's folders from the API
 */
export async function fetchFolders(accessToken: string): Promise<Folder[]> {
  try {
    const response = await fetch(`${APP_URL}/api/folders?includeCount=true`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      throw new Error(`Failed to fetch folders (${response.status}) ${errorText}`.trim())
    }

    const data = await response.json()
    return data.folders || []
  } catch (error) {
    console.error("Error fetching folders:", error)
    throw error
  }
}

/**
 * Add a video by URL to a specific folder
 */
export async function addVideoByUrl(
  url: string,
  folderId: string | undefined,
  accessToken: string
): Promise<AddVideoByUrlResponse> {
  try {
    const body: AddVideoByUrlRequest = {
      url,
      folderId,
    }

    const response = await fetch(`${APP_URL}/api/videos/add-by-url`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data: AddVideoByUrlResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error adding video by URL:", error)
    return {
      success: false,
      error: "Network error occurred",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
