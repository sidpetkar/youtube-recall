/**
 * Auto-sync utilities for YouTube videos
 */

/**
 * Check if auto-sync should run based on last sync time
 * @param lastSyncAt ISO timestamp of last sync, or null
 * @param intervalMinutes Minimum minutes between syncs (default: 60)
 */
export function shouldAutoSync(
  lastSyncAt: string | null,
  intervalMinutes: number = 60
): boolean {
  if (!lastSyncAt) {
    return true // Never synced before
  }

  const lastSync = new Date(lastSyncAt)
  const now = new Date()
  const diffMs = now.getTime() - lastSync.getTime()
  const diffMinutes = diffMs / (1000 * 60)

  return diffMinutes >= intervalMinutes
}

/**
 * Check if document is currently visible
 */
export function isDocumentVisible(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "visible"
}
