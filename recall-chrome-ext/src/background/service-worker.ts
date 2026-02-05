import { getSessionFromStorage, isAuthenticated, saveAuthToStorage, clearAuthStorage } from "../lib/supabase"
import { fetchFolders, addVideoByUrl } from "../lib/api"
import { getCurrentYouTubeUrl, openWebApp } from "../lib/youtube"
import type { Folder } from "@shared/types/database"

// Context menu IDs
const CONTEXT_MENU_ROOT = "recall-add-to-folder"
const CONTEXT_MENU_LOGIN = "recall-login"

// Cache folders to avoid too many API calls
let foldersCache: Folder[] = []
let foldersCacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Initialize the extension
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Recall extension installed")
  console.log("Extension ID:", chrome.runtime.id)
  setupContextMenu()
})

/**
 * Listen for external messages from the web app
 * This is how the web app sends auth tokens to the extension
 */
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    console.log("External message received from:", sender.origin)
    console.log("Message type:", request?.type)
    
    // Verify the sender is from our web app
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://localhost:3000",
      "https://ytrecall.online",
    ]
    
    if (!sender.origin || !allowedOrigins.some(o => sender.origin === o || sender.origin?.startsWith(o.replace(":3000", "")))) {
      console.warn("Message from unauthorized origin:", sender.origin)
      sendResponse({ success: false, error: "Unauthorized origin" })
      return true
    }
    
    try {
      switch (request?.type) {
        case "AUTH_SYNC":
          // Web app is sending auth token
          if (request.accessToken) {
            await saveAuthToStorage({
              accessToken: request.accessToken,
              refreshToken: request.refreshToken,
              expiresAt: request.expiresAt,
              user: request.user,
            })
            // Refresh context menu with new auth state
            await setupContextMenu()
            sendResponse({ success: true, message: "Auth synced to extension" })
          } else {
            sendResponse({ success: false, error: "No access token provided" })
          }
          break
          
        case "AUTH_LOGOUT":
          // User logged out from web app
          await clearAuthStorage()
          foldersCache = []
          foldersCacheTimestamp = 0
          await setupContextMenu()
          sendResponse({ success: true, message: "Logged out from extension" })
          break
          
        case "PING":
          // Web app checking if extension is installed
          sendResponse({ 
            success: true, 
            installed: true,
            extensionId: chrome.runtime.id,
            version: chrome.runtime.getManifest().version 
          })
          break
          
        case "CHECK_AUTH":
          // Web app checking if extension has auth
          const hasAuth = await isAuthenticated()
          sendResponse({ success: true, authenticated: hasAuth })
          break
          
        default:
          sendResponse({ success: false, error: "Unknown message type" })
      }
    } catch (error) {
      console.error("Error handling external message:", error)
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      })
    }
    
    return true // Keep channel open for async response
  }
)

/**
 * Listen for tab updates to refresh context menu when user navigates to YouTube
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("youtube.com")) {
    setupContextMenu()
  }
})

/**
 * Setup context menu based on authentication state
 */
async function setupContextMenu() {
  // Remove all existing context menus
  await chrome.contextMenus.removeAll()
  
  const authenticated = await isAuthenticated()
  console.log("Setting up context menu, authenticated:", authenticated)
  
  if (!authenticated) {
    // Show login option if not authenticated
    chrome.contextMenus.create({
      id: CONTEXT_MENU_LOGIN,
      title: "Login to Recall",
      contexts: ["page", "link"],
      documentUrlPatterns: ["https://www.youtube.com/*"],
    })
    return
  }
  
  // User is authenticated - fetch folders and create menu
  try {
    const token = await getSessionFromStorage()
    if (!token) {
      throw new Error("No session token")
    }
    
    // Check cache first
    const now = Date.now()
    if (foldersCache.length > 0 && now - foldersCacheTimestamp < CACHE_DURATION) {
      createFolderContextMenu(foldersCache)
      return
    }
    
    // Fetch fresh folders
    const folders = await fetchFolders(token)
    foldersCache = folders
    foldersCacheTimestamp = now
    
    createFolderContextMenu(folders)
  } catch (error) {
    console.error("Error setting up context menu:", error)
    
    // Fallback - show login option
    chrome.contextMenus.create({
      id: CONTEXT_MENU_LOGIN,
      title: "Login to Recall",
      contexts: ["page", "link"],
      documentUrlPatterns: ["https://www.youtube.com/*"],
    })
  }
}

/**
 * Create context menu with folder options
 */
function createFolderContextMenu(folders: Folder[]) {
  // Create parent menu item
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ROOT,
    title: "Save to Recall",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://www.youtube.com/*"],
  })
  
  // Add folder options
  folders.forEach((folder) => {
    chrome.contextMenus.create({
      id: `folder-${folder.id}`,
      parentId: CONTEXT_MENU_ROOT,
      title: folder.name + (folder.is_default ? " (default)" : ""),
      contexts: ["page", "link"],
      documentUrlPatterns: ["https://www.youtube.com/*"],
    })
  })
  
  // Add separator and refresh option
  chrome.contextMenus.create({
    id: "separator-1",
    parentId: CONTEXT_MENU_ROOT,
    type: "separator",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://www.youtube.com/*"],
  })
  
  chrome.contextMenus.create({
    id: "refresh-folders",
    parentId: CONTEXT_MENU_ROOT,
    title: "↻ Refresh folders",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://www.youtube.com/*"],
  })
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_LOGIN) {
    openWebApp()
    return
  }
  
  if (info.menuItemId === "refresh-folders") {
    // Clear cache and refresh
    foldersCache = []
    foldersCacheTimestamp = 0
    await setupContextMenu()
    return
  }
  
  // Handle folder selection
  if (typeof info.menuItemId === "string" && info.menuItemId.startsWith("folder-")) {
    const folderId = info.menuItemId.replace("folder-", "")
    await handleAddToFolder(folderId, tab)
  }
})

/**
 * Get current playback position (seconds) from the YouTube tab
 */
async function getResumeSecondsFromTab(tabId: number): Promise<number> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const video = document.querySelector("video")
        if (!video || Number.isNaN(video.currentTime)) return 0
        return Math.floor(video.currentTime)
      },
    })
    const value = results?.[0]?.result
    return typeof value === "number" && value > 0 ? value : 0
  } catch {
    return 0
  }
}

/**
 * Handle adding current video to a folder
 */
async function handleAddToFolder(folderId: string, tab?: chrome.tabs.Tab) {
  try {
    const token = await getSessionFromStorage()
    if (!token) {
      throw new Error("Not authenticated")
    }

    // Get current YouTube URL
    const url = await getCurrentYouTubeUrl()
    if (!url) {
      showNotification("Error", "Please navigate to a YouTube video page")
      return
    }

    // Get resume position from tab if available (context menu path)
    let resumeAtSeconds: number | undefined
    if (tab?.id) {
      resumeAtSeconds = await getResumeSecondsFromTab(tab.id)
      if (resumeAtSeconds === 0) resumeAtSeconds = undefined
    }

    // Add video via API
    const result = await addVideoByUrl(url, folderId, token, resumeAtSeconds)
    
    if (result.success) {
      const folder = foldersCache.find(f => f.id === folderId)
      showFeedback(
        tab?.id,
        "Video Saved!",
        `Added to "${folder?.name || "folder"}"`,
        "success"
      )
    } else {
      showFeedback(
        tab?.id,
        "Error",
        result.message || result.error || "Failed to save video",
        "error"
      )
    }
  } catch (error) {
    console.error("Error adding video to folder:", error)
    showFeedback(
      tab?.id,
      "Error",
      error instanceof Error ? error.message : "An error occurred",
      "error"
    )
  }
}

/**
 * Show a notification to the user
 */
function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/icons/icon-128.svg"),
    title: title,
    message: message,
    priority: 1,
  })
}

/**
 * Show feedback in the tab if possible, otherwise fallback to notification
 */
function showFeedback(
  tabId: number | undefined,
  title: string,
  message: string,
  type: "success" | "error" | "info"
) {
  if (tabId) {
    chrome.tabs.sendMessage(
      tabId,
      { action: "showToast", message, type },
      () => {
        if (chrome.runtime.lastError) {
          showNotification(title, message)
        }
      }
    )
    return
  }

  showNotification(title, message)
}

/**
 * Listen for messages from content script or popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkAuth") {
    isAuthenticated().then(authenticated => {
      sendResponse({ authenticated })
    })
    return true
  }
  
  if (request.action === "refreshFolders") {
    foldersCache = []
    foldersCacheTimestamp = 0
    setupContextMenu().then(() => {
      sendResponse({ success: true })
    })
    return true
  }
  
  if (request.action === "addToFolder") {
    const { folderId, url, resumeAtSeconds } = request
    getSessionFromStorage().then(token => {
      if (!token) {
        sendResponse({ success: false, error: "Not authenticated" })
        return
      }

      addVideoByUrl(url, folderId, token, resumeAtSeconds).then(result => {
        sendResponse(result)

        if (result.success) {
          const folder = foldersCache.find(f => f.id === folderId)
          showNotification(
            "Video Saved!",
            `Added to "${folder?.name || "folder"}"`
          )
        }
      })
    })
    return true
  }
  
  if (request.action === "getExtensionId") {
    sendResponse({ extensionId: chrome.runtime.id })
    return true
  }
  
  if (request.action === "getFolders") {
    // Fetch folders for content script
    getSessionFromStorage().then(async token => {
      if (!token) {
        sendResponse({ success: false, folders: [], error: "Not authenticated" })
        return
      }
      
      try {
        // Check cache first
        const now = Date.now()
        if (foldersCache.length > 0 && now - foldersCacheTimestamp < CACHE_DURATION) {
          sendResponse({ success: true, folders: foldersCache })
          return
        }
        
        // Fetch fresh folders
        const folders = await fetchFolders(token)
        foldersCache = folders
        foldersCacheTimestamp = now
        sendResponse({ success: true, folders })
      } catch (error) {
        console.error("Error fetching folders:", error)
        sendResponse({ 
          success: false, 
          folders: [], 
          error: error instanceof Error ? error.message : "Failed to fetch folders" 
        })
      }
    })
    return true
  }
  
  if (request.action === "getSessionToken") {
    // Get session token for content script
    getSessionFromStorage().then(token => {
      sendResponse({ token })
    })
    return true
  }
})

// Export for module
export {}
