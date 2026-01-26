// Auto-tagging utilities for video sync

import { TAG_RULES } from "../constants/tags"

/**
 * Detect tags for a video based on its title
 * Returns an array of tag names that match
 */
export function detectTags(title: string): string[] {
  const lowerTitle = title.toLowerCase()
  const detectedTags: string[] = []

  for (const rule of TAG_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        if (!detectedTags.includes(rule.tagName)) {
          detectedTags.push(rule.tagName)
        }
        break // Move to next rule once matched
      }
    }
  }

  return detectedTags
}

/**
 * Get the color for a specific tag name
 */
export function getTagColor(tagName: string): string {
  const rule = TAG_RULES.find((r) => r.tagName === tagName)
  return rule?.color || "#6366f1" // Default to indigo
}
