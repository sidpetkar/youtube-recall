// Tag color constants

export const DEFAULT_FOLDER_NAME = "Inbox"
export const DEFAULT_TAG_COLOR = "#6366f1" // Indigo

export const TAG_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Green
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#64748b", // Slate
] as const

export type TagColor = (typeof TAG_COLORS)[number]

// Tag detection rules
export interface TagRule {
  keywords: string[]
  tagName: string
  color: string
}

export const TAG_RULES: TagRule[] = [
  {
    keywords: [
      "react",
      "vue",
      "angular",
      "next.js",
      "nextjs",
      "typescript",
      "javascript",
      "python",
      "java",
      "golang",
      "rust",
      "programming",
      "coding",
      "developer",
      "software",
      "web dev",
      "frontend",
      "backend",
      "fullstack",
    ],
    tagName: "Dev",
    color: "#6366f1", // Indigo
  },
  {
    keywords: [
      "tutorial",
      "guide",
      "how to",
      "learn",
      "course",
      "lesson",
      "walkthrough",
      "explained",
      "introduction",
      "beginner",
    ],
    tagName: "Tutorial",
    color: "#10b981", // Green
  },
  {
    keywords: [
      "music",
      "song",
      "album",
      "playlist",
      "audio",
      "lyrics",
      "official music video",
      "mv",
    ],
    tagName: "Music",
    color: "#ec4899", // Pink
  },
  {
    keywords: [
      "cooking",
      "recipe",
      "food",
      "baking",
      "kitchen",
      "chef",
      "meal",
      "cuisine",
    ],
    tagName: "Cooking",
    color: "#f59e0b", // Amber
  },
  {
    keywords: [
      "gaming",
      "gameplay",
      "game",
      "playthrough",
      "lets play",
      "walkthrough",
      "speedrun",
    ],
    tagName: "Gaming",
    color: "#8b5cf6", // Purple
  },
  {
    keywords: ["vlog", "daily", "life", "lifestyle", "day in the life"],
    tagName: "Vlog",
    color: "#06b6d4", // Cyan
  },
  {
    keywords: [
      "review",
      "unboxing",
      "comparison",
      "vs",
      "tech",
      "gadget",
      "product",
    ],
    tagName: "Tech Review",
    color: "#3b82f6", // Blue
  },
  {
    keywords: ["fitness", "workout", "exercise", "gym", "health", "training"],
    tagName: "Fitness",
    color: "#ef4444", // Red
  },
  {
    keywords: ["comedy", "funny", "humor", "laugh", "meme", "parody"],
    tagName: "Comedy",
    color: "#f59e0b", // Amber
  },
  {
    keywords: ["podcast", "interview", "talk", "discussion", "conversation"],
    tagName: "Podcast",
    color: "#64748b", // Slate
  },
]
