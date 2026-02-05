import { extractYouTubeVideoId } from "@shared/utils/youtube"
import folderIconUrl from "../../assets/icons/folder-icon.png?url"

const APP_URL = import.meta.env.VITE_APP_URL || "https://ytrecall.online"

// Floating/inline button containers
let floatingButton: HTMLDivElement | null = null
let inlineButton: HTMLButtonElement | null = null
let currentVideoId: string | null = null

/**
 * Initialize the content script
 */
function init() {
  // Wait for YouTube to fully load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupFloatingButton)
  } else {
    setupFloatingButton()
  }

  // Listen for URL changes (YouTube is a SPA)
  observeUrlChanges()
}

/**
 * Setup the floating button
 */
function setupFloatingButton() {
  // Check if we're on a video page
  const videoId = extractYouTubeVideoId(window.location.href)
  
  if (!videoId) {
    removeInlineButton()
    removeFloatingButton()
    return
  }

  // Only create button if video changed
  if (videoId === currentVideoId && (floatingButton || inlineButton)) {
    return
  }

  currentVideoId = videoId
  removeInlineButton()
  removeFloatingButton()

  // Try to insert the button next to YouTube's action buttons
  if (!createInlineButton()) {
    // Fallback to floating button
    createFloatingButton()
  }
}

/**
 * Create the floating button
 */
function createFloatingButton() {
  floatingButton = document.createElement("div")
  floatingButton.id = "recall-floating-button"
  floatingButton.className = "recall-floating-button"
  
  floatingButton.innerHTML = `
    <button class="recall-btn" title="Save to Recall">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="recall-btn-text">Save</span>
    </button>
  `
  
  document.body.appendChild(floatingButton)
  
  // Add click handler
  const button = floatingButton.querySelector(".recall-btn")
  button?.addEventListener("click", handleButtonClick)
}

/**
 * Create an inline "Save" button inside YouTube action bar
 */
function createInlineButton(): boolean {
  const container =
    document.querySelector("ytd-watch-metadata #top-level-buttons-computed") ||
    document.querySelector("#top-level-buttons-computed")

  if (!container) {
    return false
  }

  if (container.querySelector(".recall-inline-button")) {
    return true
  }

  const button = document.createElement("button")
  button.className =
    "recall-inline-button yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m"
  button.setAttribute("aria-label", "Save to Recall")
  button.innerHTML = `
    <span class="recall-inline-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </span>
    <span class="recall-inline-text">Save</span>
  `

  button.addEventListener("click", handleButtonClick)
  container.appendChild(button)
  inlineButton = button
  return true
}

/**
 * Remove the floating button
 */
function removeFloatingButton() {
  if (floatingButton) {
    floatingButton.remove()
    floatingButton = null
  }
}

function removeInlineButton() {
  if (inlineButton) {
    inlineButton.remove()
    inlineButton = null
  }
}

/**
 * Handle button click - show folder selector
 */
async function handleButtonClick() {
  // Send message to background to check auth
  const response = await chrome.runtime.sendMessage({ action: "checkAuth" })
  
  if (!response.authenticated) {
    showToast("Please sign in to Recall first", "error")
    // Redirect to auth page
    window.open(`${APP_URL}/auth`, "_blank")
    return
  }
  
  // Show folder selector modal
  showFolderSelectorModal()
}

/**
 * Show folder selector modal
 */
async function showFolderSelectorModal() {
  // Create modal overlay
  const modal = document.createElement("div")
  modal.id = "recall-modal"
  modal.className = "recall-modal"
  
  modal.innerHTML = `
    <div class="recall-modal-overlay"></div>
    <div class="recall-modal-content">
      <div class="recall-modal-header">
        <h3>Save to Folder</h3>
        <button class="recall-modal-close">&times;</button>
      </div>
      <div class="recall-modal-body">
        <div class="recall-loading">Loading folders...</div>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  
  // Close handlers
  const closeBtn = modal.querySelector(".recall-modal-close")
  const overlay = modal.querySelector(".recall-modal-overlay")
  
  const closeModal = () => {
    modal.remove()
  }
  
  closeBtn?.addEventListener("click", closeModal)
  overlay?.addEventListener("click", closeModal)
  
  // Fetch folders via background script
  try {
    const folders = await fetchFolders()
    renderFolders(modal, folders)
  } catch (error) {
    console.error("Error loading folders:", error)
    const body = modal.querySelector(".recall-modal-body")
    if (body) {
      body.innerHTML = `
        <div class="recall-error">
          ${error instanceof Error ? error.message : "Failed to load folders. Please try again."}
        </div>
      `
    }
  }
}

/**
 * Get session token via background script
 */
async function getSessionToken(): Promise<string | null> {
  const response = await chrome.runtime.sendMessage({ action: "getSessionToken" })
  return response?.token || null
}

/**
 * Fetch folders via background script
 */
async function fetchFolders(): Promise<any[]> {
  const response = await chrome.runtime.sendMessage({ action: "getFolders" })
  
  if (!response?.success) {
    throw new Error(response?.error || "Failed to fetch folders")
  }
  
  return response.folders || []
}

/**
 * Render folders in modal
 */
function renderFolders(modal: HTMLElement, folders: any[]) {
  const body = modal.querySelector(".recall-modal-body")
  if (!body) return
  
  if (folders.length === 0) {
    body.innerHTML = `
      <div class="recall-empty">
        No folders found. Create one in the web app first.
      </div>
    `
    return
  }

  body.innerHTML = `
    <div class="recall-modal-folders">
      ${folders
        .map(
          (folder) => `
        <button class="recall-folder-item" data-folder-id="${folder.id}">
          <img class="recall-folder-icon" src="${folderIconUrl}" alt="" />
          <div class="recall-folder-text">
            <span class="recall-folder-name">${folder.name}${folder.is_default ? " (default)" : ""}</span>
            ${typeof folder.video_count === "number" ? `<span class="recall-folder-count">${folder.video_count} video${folder.video_count !== 1 ? "s" : ""}</span>` : ""}
          </div>
        </button>
      `
        )
        .join("")}
    </div>
  `
  
  // Add click handlers
  body.querySelectorAll(".recall-folder-item").forEach((item) => {
    item.addEventListener("click", async (e) => {
      const folderId = (e.currentTarget as HTMLElement).dataset.folderId
      if (!folderId) return
      
      await handleAddToFolder(folderId)
      modal.remove()
    })
  })
}

/**
 * Get current playback position (seconds) from the YouTube video element
 */
function getCurrentPlaybackSeconds(): number {
  const video = document.querySelector("video")
  if (!video || Number.isNaN(video.currentTime)) return 0
  return Math.floor(video.currentTime)
}

/**
 * Handle adding current video to folder
 */
async function handleAddToFolder(folderId: string) {
  const videoUrl = window.location.href
  const resumeAtSeconds = getCurrentPlaybackSeconds()

  showToast("Saving video...", "info")

  try {
    const response = await chrome.runtime.sendMessage({
      action: "addToFolder",
      folderId,
      url: videoUrl,
      resumeAtSeconds: resumeAtSeconds > 0 ? resumeAtSeconds : undefined,
    })
    
    if (response.success) {
      showToast("Video saved successfully!", "success")
    } else {
      showToast(response.message || response.error || "Failed to save video", "error")
    }
  } catch (error) {
    showToast("An error occurred", "error")
  }
}

/**
 * Show toast notification
 */
function showToast(message: string, type: "success" | "error" | "info") {
  const toast = document.createElement("div")
  toast.className = `recall-toast recall-toast-${type}`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  // Animate in
  setTimeout(() => toast.classList.add("recall-toast-show"), 10)
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("recall-toast-show")
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Listen for messages from background (context menu feedback)
 */
chrome.runtime.onMessage.addListener((request) => {
  if (request?.action === "showToast") {
    showToast(request.message, request.type || "info")
  }
})

/**
 * Observe URL changes (for SPA navigation)
 */
function observeUrlChanges() {
  let lastUrl = window.location.href
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl
      setupFloatingButton()
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Initialize
init()

// Export for testing
export {}
