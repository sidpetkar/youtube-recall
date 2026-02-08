"use client"

import * as React from "react"
import { Bold, Italic, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NotionEditorProps {
  pageId: string
  initialHtml?: string
  className?: string
}

export function NotionEditor({ pageId, initialHtml = "", className }: NotionEditorProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [syncing, setSyncing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isEmpty, setIsEmpty] = React.useState(true)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkEmpty = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const text = el.innerText?.trim() ?? ""
    setIsEmpty(text.length === 0)
  }, [])

  const syncToNotion = React.useCallback(
    async (html: string) => {
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

  const scheduleSync = React.useCallback(() => {
    checkEmpty()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      const html = ref.current?.innerHTML ?? ""
      if (html.trim()) syncToNotion(html)
      else syncToNotion("")
    }, 800)
  }, [syncToNotion, checkEmpty])

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  React.useEffect(() => {
    if (!ref.current || initialHtml === undefined) return
    if (ref.current.innerHTML !== initialHtml) {
      ref.current.innerHTML = initialHtml
    }
    setIsEmpty(!initialHtml?.trim())
  }, [initialHtml])

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    ref.current?.focus()
    scheduleSync()
  }

  return (
    <div className={cn("flex flex-col rounded-lg border border-border overflow-hidden", className)}>
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/50 p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => exec("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {syncing && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Syncing…
            </span>
          )}
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </div>
      <div className="relative">
        {isEmpty && (
          <div
            className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground"
            aria-hidden
          >
            Write notes here… They sync to Notion.
          </div>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[280px] w-full bg-[#0f0f0f] p-4 text-sm text-foreground outline-none prose prose-invert prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-6 [&_p]:mb-2 [&_p:last-child]:mb-0"
          onInput={scheduleSync}
          onBlur={() => {
            checkEmpty()
            const html = ref.current?.innerHTML ?? ""
            syncToNotion(html)
          }}
          onFocus={checkEmpty}
        />
      </div>
    </div>
  )
}
