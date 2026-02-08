"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { extractYouTubeVideoId } from "@shared/utils/youtube"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

/** Find first YouTube URL in a string (for shared text). */
function findYouTubeUrlInText(text: string): string | null {
  const patterns = [
    /https?:\/\/(www\.)?youtube\.com\/watch\?v=[^\s&]+/i,
    /https?:\/\/youtu\.be\/[^\s?]+/i,
    /https?:\/\/(www\.)?youtube\.com\/shorts\/[^\s?]+/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) return m[0]
  }
  return null
}

function ShareTargetPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = React.useState<"loading" | "success" | "error" | "no-url" | "auth">("loading")
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    let cancelled = false

    async function handleShare() {
      const urlParam = searchParams.get("url")
      const textParam = searchParams.get("text")

      const youtubeUrl =
        (urlParam && extractYouTubeVideoId(urlParam) ? urlParam : null) ??
        (textParam ? findYouTubeUrlInText(textParam) : null)

      if (!youtubeUrl) {
        if (!cancelled) {
          setStatus("no-url")
          setMessage("No YouTube link found in the shared content.")
        }
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const next = `/app/share?${searchParams.toString()}`
        if (!cancelled) router.replace(`/auth?next=${encodeURIComponent(next)}`)
        else setStatus("auth")
        return
      }

      try {
        const res = await fetch("/api/videos/add-by-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeUrl }),
        })
        const data = await res.json()

        if (cancelled) return
        if (data.success) {
          setStatus("success")
          setMessage("Video added to your library.")
          setTimeout(() => router.replace("/app"), 1500)
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to add video.")
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error")
          setMessage("Something went wrong. Try again.")
        }
      }
    }

    handleShare()
    return () => {
      cancelled = true
    }
  }, [searchParams, router, supabase])

  if (status === "loading") {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Adding video to Recall…</p>
      </div>
    )
  }

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={() => router.push("/app")} variant="default">
        Open Recall
      </Button>
    </div>
  )
}

export default function ShareTargetPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ShareTargetPageContent />
    </React.Suspense>
  )
}
