import type { Folder } from "@shared/types/database"
import type { AddVideoByUrlRequest, AddVideoByUrlResponse } from "@shared/types/api"

const APP_URL = import.meta.env.VITE_APP_URL || "https://ytrecall.online"

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
 * Add a video by URL to a specific folder.
 * resumeAtSeconds: when saving from YouTube, current playback position (seconds) so the app can open the video at that point.
 */
export async function addVideoByUrl(
  url: string,
  folderId: string | undefined,
  accessToken: string,
  resumeAtSeconds?: number | null
): Promise<AddVideoByUrlResponse> {
  try {
    const body: AddVideoByUrlRequest = {
      url,
      folderId,
      ...(resumeAtSeconds != null && resumeAtSeconds > 0 ? { resume_at_seconds: Math.floor(resumeAtSeconds) } : {}),
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
