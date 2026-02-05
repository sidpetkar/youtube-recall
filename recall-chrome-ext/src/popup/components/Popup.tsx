import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LoginPrompt } from "./LoginPrompt"
import { FolderSelector } from "./FolderSelector"
import { LoadingSpinner } from "./LoadingSpinner"
import { isAuthenticated } from "../../lib/supabase"
import { getCurrentYouTubeUrl } from "../../lib/youtube"

export function Popup() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    isAuthenticated().then(setAuthenticated)
    getCurrentYouTubeUrl().then(setCurrentUrl)
  }, [])

  if (authenticated === null) {
    return (
      <div className="w-[420px] min-h-[360px] flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginPrompt />
  }

  if (!currentUrl) {
    return (
      <div className="w-[420px] p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight mb-2">Not on YouTube</h2>
          <p className="text-sm text-muted-foreground">
            Navigate to a YouTube video to save it to your library
          </p>
        </div>
      </div>
    )
  }

  return <FolderSelector videoUrl={currentUrl} />
}
