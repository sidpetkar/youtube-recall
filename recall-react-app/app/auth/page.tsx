"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()
  const router = useRouter()

  React.useEffect(() => {
    // Check if already signed in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/")
      }
    }
    checkAuth()
  }, [supabase, router])

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
            <span className="text-4xl font-bold text-primary-foreground">YT</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">YouTube Knowledge Manager</h1>
          <p className="text-lg text-muted-foreground">
            Organize and manage your YouTube liked videos with AI-powered tagging
          </p>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-8 shadow-lg">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to access your YouTube liked videos
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSignIn}
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Connecting..." : "Proceed with Google"}
          </Button>

          <div className="space-y-2 pt-4 text-xs text-muted-foreground">
            <p>By signing in, you agree to:</p>
            <ul className="list-inside list-disc space-y-1 text-left">
              <li>Access your YouTube liked videos (read-only)</li>
              <li>Store your video data securely</li>
              <li>Automatic tagging and organization</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✨ Features:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span>📁 Smart Folders</span>
            <span>🏷️ Auto-Tagging</span>
            <span>🔄 Auto-Sync</span>
            <span>🔒 Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  )
}
