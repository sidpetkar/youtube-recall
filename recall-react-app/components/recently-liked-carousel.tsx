"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { VideoCard } from "@/components/video-card"
import { DraggableVideoCard } from "@/components/draggable-video-card"
import { Card, CardContent } from "@/components/ui/card"

export interface Video {
  dbId?: string
  videoId: string
  title: string
  channelName: string
  channelThumbnail?: string
  thumbnail: string
  duration?: string
  publishedAt?: string
  folderName?: string | null
  resumeAtSeconds?: number | null
}

interface RecentlyLikedCarouselProps {
  videos?: Video[]
  isLoading?: boolean
}

export function RecentlyLikedCarousel({
  videos = [],
  isLoading = false,
}: RecentlyLikedCarouselProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Liked Videos</h2>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="w-[300px] animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Liked Videos</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {videos.map((video) => (
            <CarouselItem
              key={video.videoId}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              {video.dbId ? (
                <DraggableVideoCard
                  videoDbId={video.dbId}
                  videoId={video.videoId}
                  title={video.title}
                  channelName={video.channelName}
                  channelThumbnail={video.channelThumbnail}
                  thumbnail={video.thumbnail}
                  duration={video.duration}
                  publishedAt={video.publishedAt}
                  folderName={video.folderName}
                  resumeAtSeconds={video.resumeAtSeconds}
                />
              ) : (
                <VideoCard {...video} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
