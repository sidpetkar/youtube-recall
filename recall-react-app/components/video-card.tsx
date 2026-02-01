"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface VideoCardProps {
  videoId: string
  title: string
  channelName: string
  channelThumbnail?: string
  thumbnail: string
  duration?: string
  publishedAt?: string
  /** Folder name chip on top-right when video is in a folder */
  folderName?: string | null
  /** When set, open YouTube at this position (seconds) */
  resumeAtSeconds?: number | null
  className?: string
}

export function VideoCard({
  videoId,
  title,
  channelName,
  channelThumbnail,
  thumbnail,
  duration,
  publishedAt,
  folderName,
  resumeAtSeconds,
  className,
}: VideoCardProps) {
  const handleClick = () => {
    const url = new URL(`https://www.youtube.com/watch?v=${videoId}`)
    if (resumeAtSeconds != null && resumeAtSeconds > 0) {
      url.searchParams.set("t", String(Math.floor(resumeAtSeconds)))
    }
    window.open(url.toString(), "_blank")
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
          {folderName && (
            <span className="absolute top-2 right-2 rounded-md bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
              {folderName}
            </span>
          )}
          {duration && (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
              {duration}
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            {channelThumbnail && (
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={channelThumbnail} alt={channelName} />
                <AvatarFallback>{channelName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {channelName}
              </p>
              {publishedAt && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {publishedAt}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
