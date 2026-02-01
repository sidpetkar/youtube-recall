"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Main content sheet: white in light, elevated surface in dark (--main-sheet token). 24px radius. */
export function MainSheet({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col bg-main-sheet text-main-sheet-foreground rounded-3xl p-4 md:p-6 lg:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
