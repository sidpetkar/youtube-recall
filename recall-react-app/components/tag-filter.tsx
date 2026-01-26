"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { useTags } from "@/hooks/use-tags"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface TagFilterProps {
  selectedTagIds: string[]
  onTagSelect: (tagId: string) => void
  onTagDeselect: (tagId: string) => void
  className?: string
}

export function TagFilter({
  selectedTagIds,
  onTagSelect,
  onTagDeselect,
  className,
}: TagFilterProps) {
  const { data, isLoading } = useTags()

  const tags = data?.tags || []
  const selectedParentTag = tags.find((tag) =>
    selectedTagIds.includes(tag.id)
  )

  // Show child tags if a parent tag is selected
  const childTags = selectedParentTag?.children || []

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    )
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Parent Tags Row */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => {
                if (isSelected) {
                  onTagDeselect(tag.id)
                } else {
                  // Deselect all other parent tags first
                  selectedTagIds.forEach((id) => {
                    if (tags.some((t) => t.id === id)) {
                      onTagDeselect(id)
                    }
                  })
                  onTagSelect(tag.id)
                }
              }}
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-1.5 text-sm font-medium",
                  isSelected && "border-2"
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                        color: "white",
                      }
                    : {
                        borderColor: tag.color,
                        color: tag.color,
                      }
                }
              >
                {tag.name}
              </Badge>
            </button>
          )
        })}
      </div>

      {/* Child Tags Row - Only show if a parent is selected */}
      {childTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-2">
          {childTags.map((childTag) => {
            const isSelected = selectedTagIds.includes(childTag.id)
            return (
              <button
                key={childTag.id}
                onClick={() => {
                  if (isSelected) {
                    onTagDeselect(childTag.id)
                  } else {
                    onTagSelect(childTag.id)
                  }
                }}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 text-xs font-medium",
                    isSelected && "border-2"
                  )}
                  style={
                    isSelected
                      ? {
                          backgroundColor: childTag.color,
                          borderColor: childTag.color,
                          color: "white",
                        }
                      : {
                          borderColor: childTag.color,
                          color: childTag.color,
                        }
                  }
                >
                  {childTag.name}
                </Badge>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
