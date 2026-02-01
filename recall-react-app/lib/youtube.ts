import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]

export function getAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/youtube/callback`
  )

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/youtube/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function getAuthenticatedClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/youtube/callback`
  )

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return oauth2Client
}

/** Callback when OAuth tokens are refreshed (e.g. new access_token) - persist to DB so next request has fresh token */
export type OnTokensRefreshed = (tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}) => void | Promise<void>

export async function getLikedVideos(
  accessToken: string,
  refreshToken?: string,
  maxResults: number = 10,
  onTokensRefreshed?: OnTokensRefreshed
) {
  const auth = getAuthenticatedClient(accessToken, refreshToken)

  // Persist new tokens when Google client auto-refreshes (access_token expires ~1h)
  if (onTokensRefreshed) {
    auth.on("tokens", (tokens) => {
      void Promise.resolve(onTokensRefreshed(tokens)).catch((err) =>
        console.error("Failed to persist refreshed YouTube tokens:", err)
      )
    })
  }

  const youtube = google.youtube({ version: "v3", auth })

  try {
    // The "Liked videos" playlist has a special ID: "LL" for the authenticated user
    // Paginate playlist items to sync as much as possible (most recent first)
    const videoIds: string[] = []
    const videoIdToLikedAt = new Map<string, string>()
    let pageToken: string | undefined

    do {
      const playlistResponse = await youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId: "LL",
        maxResults: 50, // API max per page
        pageToken: pageToken || undefined,
      })

      playlistResponse.data.items?.forEach((item) => {
        const videoId = item.contentDetails?.videoId
        if (videoId) {
          videoIds.push(videoId)
          if (item.snippet?.publishedAt) {
            videoIdToLikedAt.set(videoId, item.snippet.publishedAt)
          }
        }
      })

      pageToken = playlistResponse.data.nextPageToken ?? undefined
    } while (pageToken && videoIds.length < maxResults)

    if (videoIds.length === 0) {
      console.info("[YouTube] getLikedVideos: playlist LL returned 0 items (empty or no access)")
      return []
    }

    const idsToFetch = videoIds.slice(0, maxResults)

    // Get video details in batches of 50 (API limit)
    const allItems: Awaited<ReturnType<typeof youtube.videos.list>>["data"]["items"] = []
    for (let i = 0; i < idsToFetch.length; i += 50) {
      const batch = idsToFetch.slice(i, i + 50)
      const videosResponse = await youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: batch,
        maxResults: batch.length,
      })
      allItems.push(...(videosResponse.data.items || []))
    }

    // Preserve playlist order (most recently liked first)
    const orderMap = new Map(idsToFetch.map((id, idx) => [id, idx]))
    const sorted = [...allItems].sort((a, b) => (orderMap.get(a.id!) ?? 0) - (orderMap.get(b.id!) ?? 0))

    const videos = sorted.map((video) => {
      const snippet = video.snippet!
      const contentDetails = video.contentDetails!

      return {
        videoId: video.id!,
        title: snippet.title || "",
        channelName: snippet.channelTitle || "",
        channelThumbnail: snippet.thumbnails?.default?.url,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
        duration: parseDuration(contentDetails.duration || ""),
        publishedAt: formatDate(snippet.publishedAt),
        likedAt: videoIdToLikedAt.get(video.id!) || undefined,
      }
    })

    console.info("[YouTube] getLikedVideos: fetched", videos.length, "videos from liked playlist (LL)")
    return videos
  } catch (error: any) {
    const message = error?.message || String(error)
    const code = error?.code ?? error?.response?.status
    console.error("[YouTube] getLikedVideos failed:", message, "code:", code, error)
    throw error
  }
}

function parseDuration(duration: string): string {
  // Parse ISO 8601 duration (e.g., PT4M13S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ""

  const hours = parseInt(match[1] || "0", 10)
  const minutes = parseInt(match[2] || "0", 10)
  const seconds = parseInt(match[3] || "0", 10)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Get a single video by its ID
 * Used for manually adding videos by URL
 */
export async function getVideoById(videoId: string): Promise<any> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (apiKey) {
      const youtube = google.youtube({
        version: "v3",
        auth: apiKey,
      })

      const videosResponse = await youtube.videos.list({
        part: ["snippet", "contentDetails"],
        id: [videoId],
      })

      if (!videosResponse.data.items || videosResponse.data.items.length === 0) {
        throw new Error("Video not found")
      }

      const video = videosResponse.data.items[0]
      const snippet = video.snippet!
      const contentDetails = video.contentDetails!

      const duration = parseDuration(contentDetails.duration || "")

      return {
        videoId: video.id!,
        title: snippet.title || "",
        channelName: snippet.channelTitle || "",
        channelThumbnail: snippet.thumbnails?.default?.url,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
        duration: duration,
        publishedAt: formatDate(snippet.publishedAt),
      }
    }

    // Fallback: use oEmbed (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const oembedResponse = await fetch(oembedUrl)

    if (!oembedResponse.ok) {
      throw new Error("Unable to fetch video metadata (missing API key)")
    }

    const oembed = await oembedResponse.json()

    return {
      videoId,
      title: oembed.title || "",
      channelName: oembed.author_name || "",
      channelThumbnail: undefined,
      thumbnail: oembed.thumbnail_url || "",
      duration: null,
      publishedAt: "",
    }
  } catch (error) {
    console.error("Error fetching video by ID:", error)
    throw error
  }
}
