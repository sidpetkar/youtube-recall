"use client"

import * as React from "react"
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useTheme } from "next-themes"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo2,
  Redo2,
  Loader2,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NOTES_STORAGE_KEY = "recall-notes"

export interface NotionTiptapEditorProps {
  /** When set, content syncs to Notion. Omit or leave empty for local-only editor. */
  pageId?: string
  /** When set, content is persisted to DB (and localStorage as cache) keyed by this id (e.g. videoId = YouTube id). */
  storageKey?: string
  initialHtml?: string
  className?: string
}

export function NotionTiptapEditor({
  pageId,
  storageKey,
  initialHtml = "",
  className,
}: NotionTiptapEditorProps) {
  const { resolvedTheme } = useTheme()
  const [syncing, setSyncing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = React.useRef(false)
  const loadedForStorageKeyRef = React.useRef<string | null>(null)

  // NOTION: only sync when pageId is set. When disabled, editor is local-only.
  const syncToNotion = React.useCallback(
    async (html: string) => {
      if (!pageId) return
      setSyncing(true)
      setError(null)
      try {
        const res = await fetch("/api/notion/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, content: html }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Sync failed")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to sync")
      } finally {
        setSyncing(false)
      }
    },
    [pageId]
  )

  const scheduleSync = React.useCallback(
    (editorInstance: ReturnType<typeof useEditor>["editor"]) => {
      if (!pageId) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        const html = editorInstance?.getHTML() ?? ""
        syncToNotion(html)
      }, 800)
    },
    [syncToNotion, pageId]
  )

  // Persist to localStorage (cache / offline)
  const saveToStorage = React.useCallback((html: string) => {
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(`${NOTES_STORAGE_KEY}-${storageKey}`, html)
      } catch (_) {}
    }
  }, [storageKey])

  const apiDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveToApi = React.useCallback(
    async (html: string) => {
      if (!storageKey) return
      try {
        const res = await fetch(`/api/videos/${encodeURIComponent(storageKey)}/notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: html }),
        })
        if (!res.ok) throw new Error("Failed to save")
      } catch (_) {
        // Offline or not in library: keep in localStorage only
      }
    },
    [storageKey]
  )

  const scheduleSaveToApi = React.useCallback(
    (editorInstance: ReturnType<typeof useEditor>["editor"]) => {
      if (!storageKey) return
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current)
      apiDebounceRef.current = setTimeout(() => {
        apiDebounceRef.current = null
        const html = editorInstance?.getHTML() ?? ""
        saveToApi(html)
      }, 800)
    },
    [storageKey, saveToApi]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Write notes here…",
      }),
    ],
    content: initialHtml || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] w-full px-4 pt-1 pb-3 text-sm outline-none prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isMounted.current) {
        scheduleSync(ed)
        saveToStorage(ed.getHTML())
        scheduleSaveToApi(ed)
      }
    },
    onBlur: ({ editor: ed }) => {
      if (pageId) syncToNotion(ed.getHTML())
      const html = ed.getHTML()
      saveToStorage(html)
      saveToApi(html)
    },
  })

  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current)
    }
  }, [])

  // Load notes from API (cross-device) when storageKey/editor ready; fallback to localStorage
  React.useEffect(() => {
    if (!editor || !storageKey || typeof window === "undefined") return
    if (loadedForStorageKeyRef.current === storageKey) return
    loadedForStorageKeyRef.current = storageKey

    let cancelled = false
    fetch(`/api/videos/${encodeURIComponent(storageKey)}/notes`)
      .then((res) => {
        if (cancelled) return
        if (res.ok) return res.json().then((data: { notes?: string }) => data.notes ?? "")
        return null
      })
      .then((notesFromApi) => {
        if (cancelled) return
        const content = notesFromApi ?? (() => {
          try {
            return window.localStorage.getItem(`${NOTES_STORAGE_KEY}-${storageKey}`)
          } catch {
            return null
          }
        })()
        editor.commands.setContent(content && content.trim() ? content : "<p></p>", false)
        if (notesFromApi != null && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(`${NOTES_STORAGE_KEY}-${storageKey}`, notesFromApi)
          } catch (_) {}
        }
      })
      .catch(() => {
        if (cancelled) return
        try {
          const saved = window.localStorage.getItem(`${NOTES_STORAGE_KEY}-${storageKey}`)
          editor.commands.setContent(saved ?? "<p></p>", false)
        } catch (_) {}
      })

    return () => {
      cancelled = true
    }
  }, [editor, storageKey])


  if (!editor) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-lg border border-border bg-muted/30",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border overflow-hidden",
        "bg-background text-foreground",
        className
      )}
    >
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: "top" }}
        className="flex items-center gap-0.5 rounded-md border border-border bg-background p-1 shadow-md"
      >
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </Button>
      </BubbleMenu>

      {/* Persistent toolbar: all StarterKit actions. onMouseDown preventDefault keeps editor focus/selection. */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Type className="h-3.5 w-3.5" /> Paragraph
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </Button>
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCode().run()} title="Code">
          <Code className="h-4 w-4" />
        </Button>
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <Code className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {pageId && (syncing || error) && (
        <div className="flex items-center justify-end gap-2 border-b border-border bg-muted/30 px-2 py-1">
          {syncing && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
            </span>
          )}
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      )}

      <div
        className={cn(
          "min-h-[280px] pt-0",
          isDark ? "bg-[#0f0f0f]" : "bg-background"
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
