import { extractYouTubeVideoId } from "@shared/utils/youtube"

/**
 * Get the current YouTube video URL from the active tab
 */
export async function getCurrentYouTubeUrl(): Promise<string | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!tab?.url) {
      return null
    }
    
    // Check if it's a YouTube URL
    if (!tab.url.includes("youtube.com/watch") && 
        !tab.url.includes("youtube.com/shorts") &&
        !tab.url.includes("youtu.be/")) {
      return null
    }
    
    return tab.url
  } catch (error) {
    console.error("Error getting current YouTube URL:", error)
    return null
  }
}

/**
 * Get the current YouTube video ID
 */
export async function getCurrentVideoId(): Promise<string | null> {
  const url = await getCurrentYouTubeUrl()
  if (!url) return null
  
  return extractYouTubeVideoId(url)
}

/**
 * Open the web app in a new tab
 */
export function openWebApp(path: string = "") {
  const appUrl = import.meta.env.VITE_APP_URL || "https://ytrecall.online"
  chrome.tabs.create({ url: `${appUrl}${path}` })
}
