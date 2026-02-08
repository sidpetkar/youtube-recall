"use client"

import * as React from "react"
// import { Button } from "@/components/ui/button"
// import { FileText, RefreshCw, Loader2 } from "lucide-react"
import { NotionTiptapEditor } from "@/components/watch/notion-tiptap-editor"
import { cn } from "@/lib/utils"

export interface NotionSectionProps {
  /** When provided, OAuth return URL will be /watch/{videoId} and we get/create a Notion page for this video */
  videoId?: string
  className?: string
}

export function NotionSection({ videoId, className }: NotionSectionProps) {
  // --- NOTION DISABLED: use text editor only (local). Uncomment below to re-enable Notion. ---
  // const [connected, setConnected] = React.useState<boolean | null>(null)
  // const [pageId, setPageId] = React.useState<string | null>(null)
  // const [pageError, setPageError] = React.useState<string | null>(null)

  // React.useEffect(() => {
  //   let cancelled = false
  //   fetch("/api/notion/status")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (!cancelled) setConnected(data.connected === true)
  //     })
  //     .catch(() => {
  //       if (!cancelled) setConnected(false)
  //     })
  //   return () => {
  //     cancelled = true
  //   }
  // }, [])

  // React.useEffect(() => {
  //   if (!connected || !videoId) {
  //     setPageId(null)
  //     setPageError(null)
  //     return
  //   }
  //   let cancelled = false
  //   setPageError(null)
  //   fetch(`/api/notion/page?videoId=${encodeURIComponent(videoId)}`)
  //     .then((res) => {
  //       if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error || "Failed to load page")))
  //       return res.json()
  //     })
  //     .then((data) => {
  //       if (!cancelled) setPageId(data.pageId)
  //     })
  //     .catch((e) => {
  //       if (!cancelled) {
  //         setPageError(e.message || "Could not load notes page")
  //         setPageId(null)
  //       }
  //     })
  //   return () => {
  //     cancelled = true
  //   }
  // }, [connected, videoId])

  // const nextPath = videoId ? `/watch/${videoId}` : "/"
  // const syncUrl = `/api/notion/auth?next=${encodeURIComponent(nextPath)}`

  // if (connected === null) {
  //   return (
  //     <section
  //       className={cn(
  //         "rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-6 flex items-center justify-center min-h-[200px]",
  //         className
  //       )}
  //     >
  //       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  //     </section>
  //   )
  // }

  // if (!connected) {
  //   return (
  //     <section
  //       className={cn(
  //         "rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-6",
  //         className
  //       )}
  //     >
  //       <div className="flex flex-col items-center justify-center gap-4 py-8 text-center text-muted-foreground">
  //         <FileText className="h-12 w-12 opacity-50" />
  //         <p className="text-sm font-medium">Notion page will appear here</p>
  //         <p className="text-xs">
  //           Connect Notion and sync your notes to save them to your workspace.
  //         </p>
  //         <Button variant="outline" size="sm" className="gap-2" asChild>
  //           <a href={syncUrl}>
  //             <RefreshCw className="h-4 w-4" />
  //             Sync to Notion
  //           </a>
  //         </Button>
  //       </div>
  //     </section>
  //   )
  // }

  // if (pageError) {
  //   return (
  //     <section
  //       className={cn(
  //         "rounded-lg border border-border overflow-hidden bg-[#0f0f0f] p-6",
  //         className
  //       )}
  //     >
  //       <p className="text-sm text-muted-foreground">{pageError}</p>
  //       <p className="mt-2 text-xs text-muted-foreground">
  //         In Notion, share at least one page with the Recall integration, then refresh.
  //       </p>
  //     </section>
  //   )
  // }

  // if (pageId === null) {
  //   return (
  //     <section
  //       className={cn(
  //         "rounded-lg border border-border overflow-hidden flex items-center justify-center min-h-[280px] bg-muted/30",
  //         className
  //       )}
  //     >
  //       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  //     </section>
  //   )
  // }

  // Always show text editor (local only). Pass pageId to re-enable Notion sync when you uncomment above.
  return (
    <section className={cn("rounded-lg overflow-hidden", className)}>
      <NotionTiptapEditor storageKey={videoId} initialHtml="" />
    </section>
  )
}
