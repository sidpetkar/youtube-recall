// YouTube URL utilities

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes("youtube.com") && urlObj.pathname === "/watch") {
      return urlObj.searchParams.get("v")
    }
    
    // Short URL: youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1) // Remove leading slash
    }
    
    // Shorts: youtube.com/shorts/VIDEO_ID
    if (urlObj.hostname.includes("youtube.com") && urlObj.pathname.startsWith("/shorts/")) {
      return urlObj.pathname.split("/")[2]
    }
    
    // Embed: youtube.com/embed/VIDEO_ID
    if (urlObj.hostname.includes("youtube.com") && urlObj.pathname.startsWith("/embed/")) {
      return urlObj.pathname.split("/")[2]
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Validate if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}
