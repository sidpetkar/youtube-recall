"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface YoutubeEmbedProps {
  videoId: string
  /** Start time in seconds (YouTube embed supports ?start=) */
  startAtSeconds?: number
  className?: string
}

export function YoutubeEmbed({
  videoId,
  startAtSeconds,
  className,
}: YoutubeEmbedProps) {
  const embedUrl = React.useMemo(() => {
    const url = new URL(`https://www.youtube.com/embed/${videoId}`)
    if (startAtSeconds != null && startAtSeconds > 0) {
      url.searchParams.set("start", String(Math.floor(startAtSeconds)))
    }
    return url.toString()
  }, [videoId, startAtSeconds])

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-muted",
        "aspect-video max-w-[1280px] mx-auto",
        className
      )}
    >
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
