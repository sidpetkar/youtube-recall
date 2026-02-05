"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

// Chrome extension types
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

export default function AuthPage() {
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [extensionStatus, setExtensionStatus] = React.useState<string>("checking...")
  const [syncStatus, setSyncStatus] = React.useState<string>("")
  const supabase = createClient()
  const router = useRouter()
  const { setTheme } = useTheme()
  const extensionId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || ""

  // Auth page always in light mode
  React.useEffect(() => {
    setTheme("light")
    return () => { setTheme("system") }
  }, [setTheme])

  React.useEffect(() => {
    // Check if already signed in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    checkAuth()
    
    // Check extension status
    checkExtension()
  }, [supabase])
  
  const checkExtension = async () => {
    if (!extensionId) {
      setExtensionStatus("Extension ID not configured")
      return
    }
    
    if (!window.chrome?.runtime?.sendMessage) {
      setExtensionStatus("Not in Chrome browser")
      return
    }
    
    try {
      window.chrome.runtime.sendMessage(
        extensionId,
        { type: "PING" },
        (response: any) => {
          if (chrome.runtime?.lastError) {
            setExtensionStatus("Extension not found - check ID")
            return
          }
          if (response?.success) {
            setExtensionStatus(`Connected (v${response.version})`)
          } else {
            setExtensionStatus("Extension not responding")
          }
        }
      )
    } catch (e) {
      setExtensionStatus("Error checking extension")
    }
  }
  
  const syncToExtension = async () => {
    setSyncStatus("Syncing...")
    
    if (!extensionId) {
      setSyncStatus("No extension ID configured")
      return
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSyncStatus("Not logged in")
      return
    }
    
    try {
      window.chrome?.runtime?.sendMessage(
        extensionId,
        {
          type: "AUTH_SYNC",
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
          user: {
            id: session.user.id,
            email: session.user.email,
          },
        },
        (response: any) => {
          if (chrome.runtime?.lastError) {
            setSyncStatus("Failed: " + chrome.runtime.lastError.message)
            return
          }
          if (response?.success) {
            setSyncStatus("Synced successfully! Reload extension.")
          } else {
            setSyncStatus("Failed: " + (response?.error || "Unknown error"))
          }
        }
      )
    } catch (e: any) {
      setSyncStatus("Error: " + e.message)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/api/youtube/auth`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "https://www.googleapis.com/auth/youtube.readonly",
      },
    })

    if (error) {
      console.error("Error signing in:", error)
      setLoading(false)
    }
  }

  // If user is logged in, show sync option
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3] p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <img
              src="/recall-svg-logo.svg"
              alt="Recall"
              width={145}
              height={56}
              className="mx-auto h-14 w-auto max-h-14 object-contain object-center"
            />
            <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-white p-8 shadow-lg">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Chrome Extension Sync</h2>
              <p className="text-sm text-muted-foreground">
                Sync your login to the Recall Chrome extension
              </p>
            </div>
            
            <div className="rounded-md bg-muted p-3 text-left text-sm">
              <p><strong>Extension Status:</strong> {extensionStatus}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ID: {extensionId ? `${extensionId.substring(0, 8)}...` : "Not set"}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={syncToExtension}
              disabled={!extensionId || extensionStatus.includes("not")}
            >
              Sync to Extension
            </Button>
            
            {syncStatus && (
              <p className={`text-sm ${syncStatus.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {syncStatus}
              </p>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
                Go to App
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            After syncing, reload the extension in Chrome and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <img
            src="/recall-svg-logo.svg"
            alt="Recall"
            width={145}
            height={56}
            className="mx-auto h-14 w-auto max-h-14 object-contain object-center"
          />
          <p className="text-lg text-muted-foreground">
            Organize your liked videos with folders and save from YouTube with the Chrome extension.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-white p-8 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Get started</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with Google to access your liked videos and sync with the extension.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSignIn}
            disabled={loading}
          >
            <img
              src="/google-g-logo.png"
              alt=""
              className="mr-2 h-5 w-5 object-contain"
              width={20}
              height={20}
            />
            {loading ? "Connecting…" : "Continue with Google"}
          </Button>

          <p className="pt-4 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
