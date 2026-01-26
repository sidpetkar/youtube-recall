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

export async function getLikedVideos(accessToken: string, refreshToken?: string, maxResults: number = 10) {
  const auth = getAuthenticatedClient(accessToken, refreshToken)
  const youtube = google.youtube({ version: "v3", auth })

  try {
    // The "Liked videos" playlist has a special ID: "LL" for the authenticated user
    // Get playlist items from the liked videos playlist
    const playlistResponse = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId: "LL", // Special playlist ID for liked videos
      maxResults: maxResults,
    })

    // Extract video IDs from playlist items
    const videoIds: string[] = []
    playlistResponse.data.items?.forEach((item) => {
      if (item.contentDetails?.videoId) {
        videoIds.push(item.contentDetails.videoId)
      }
    })

    if (videoIds.length === 0) {
      return []
    }

    // Get video details
    const videosResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails", "statistics"],
      id: videoIds,
      maxResults: maxResults,
    })

    // Format the response
    const videos = videosResponse.data.items?.map((video) => {
      const snippet = video.snippet!
      const contentDetails = video.contentDetails!

      // Calculate duration
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
    }) || []

    return videos
  } catch (error) {
    console.error("Error fetching liked videos:", error)
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
