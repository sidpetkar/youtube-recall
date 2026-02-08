"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FileStack, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SummarizerPanelProps {
  className?: string
}

export function SummarizerPanel({ className }: SummarizerPanelProps) {
  const [question, setQuestion] = React.useState("")

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-fit min-h-[400px] w-full flex-col rounded-lg border bg-card md:sticky md:top-4 md:w-[320px] md:shrink-0",
          className
        )}
      >
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold">Ask about this video</h3>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                disabled
              >
                <FileStack className="h-4 w-4" />
                Summarize the video
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Coming soon</p>
            </TooltipContent>
          </Tooltip>
          <div className="min-h-[120px] flex-1 rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 p-3 text-xs text-muted-foreground">
            Summary and timestamps will appear here once the backend is
            connected.
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled
              className="flex-1"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
