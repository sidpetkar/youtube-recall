"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

// Declare chrome runtime types for TypeScript
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void
        ) => void
      }
    }
  }
}

interface ExtensionResponse {
  success: boolean
  message?: string
  error?: string
  installed?: boolean
  extensionId?: string
  version?: string
}

/**
 * Component that syncs authentication state with the Chrome extension
 * Uses externally_connectable message passing instead of cookies
 */
export function ExtensionAuthSync() {
  const [extensionInstalled, setExtensionInstalled] = React.useState(false)
  const [extensionId, setExtensionId] = React.useState<string | null>(null)
  const supabase = createClient()

  // Get extension ID from env or try to detect it
  React.useEffect(() => {
    const envExtensionId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID
    if (envExtensionId && envExtensionId.length > 0) {
      setExtensionId(envExtensionId)
    }
  }, [])

  // Check if extension is installed and sync auth
  React.useEffect(() => {
    if (!extensionId) return

    const checkExtension = async () => {
      try {
        const response = await sendMessageToExtension(extensionId, { type: "PING" })
        if (response?.success && response?.installed) {
          console.log("✓ Recall extension detected:", response.version)
          setExtensionInstalled(true)
          
          // Sync current auth state
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await syncAuthToExtension(extensionId, session)
          }
        }
      } catch (error) {
        // Extension not installed or doesn't respond - that's fine
        console.log("Extension not detected (this is normal if not installed)")
      }
    }

    checkExtension()
  }, [extensionId, supabase])

  // Listen for auth state changes
  React.useEffect(() => {
    if (!extensionId || !extensionInstalled) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event)
        
        if (event === "SIGNED_IN" && session) {
          await syncAuthToExtension(extensionId, session)
        } else if (event === "SIGNED_OUT") {
          await sendMessageToExtension(extensionId, { type: "AUTH_LOGOUT" })
          console.log("✓ Sent logout to extension")
        } else if (event === "TOKEN_REFRESHED" && session) {
          await syncAuthToExtension(extensionId, session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [extensionId, extensionInstalled, supabase])

  // This component doesn't render anything
  return null
}

/**
 * Send auth session to the Chrome extension
 */
async function syncAuthToExtension(extensionId: string, session: Session): Promise<void> {
  try {
    const response = await sendMessageToExtension(extensionId, {
      type: "AUTH_SYNC",
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    })
    
    if (response?.success) {
      console.log("✓ Auth synced to extension")
    } else {
      console.error("Failed to sync auth to extension:", response?.error)
    }
  } catch (error) {
    console.error("Error syncing auth to extension:", error)
  }
}

/**
 * Send a message to the Chrome extension
 * Returns null if extension is not installed
 */
function sendMessageToExtension(
  extensionId: string,
  message: unknown
): Promise<ExtensionResponse | null> {
  return new Promise((resolve) => {
    // Check if chrome.runtime is available (only in Chrome browser)
    if (typeof window === "undefined" || !window.chrome?.runtime?.sendMessage) {
      resolve(null)
      return
    }

    try {
      window.chrome.runtime.sendMessage(
        extensionId,
        message,
        (response: ExtensionResponse | undefined) => {
          // Check for errors (e.g., extension not installed)
          if (typeof chrome !== "undefined" && chrome.runtime?.lastError) {
            console.log("Chrome runtime error:", chrome.runtime.lastError.message)
            resolve(null)
            return
          }
          resolve(response || null)
        }
      )
    } catch (error) {
      console.log("Error sending message to extension:", error)
      resolve(null)
    }
  })
}
