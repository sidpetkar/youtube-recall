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
  className,
}: VideoCardProps) {
  const handleClick = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
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
