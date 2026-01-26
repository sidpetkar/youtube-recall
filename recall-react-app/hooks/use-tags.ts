"use client"

import { useQuery } from "@tanstack/react-query"
import type { Tag, TagWithChildren } from "@/lib/types/database"

interface TagsResponse {
  tags: TagWithChildren[]
  allTags: Tag[]
}

/**
 * Fetch tags with hierarchical structure
 */
export function useTags() {
  return useQuery<TagsResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags")
      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }
      return response.json()
    },
  })
}
