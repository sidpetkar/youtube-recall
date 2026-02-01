"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** White content sheet with 24px border radius (matches design) */
export function MainSheet({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col bg-white rounded-3xl p-4 md:p-6 lg:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
