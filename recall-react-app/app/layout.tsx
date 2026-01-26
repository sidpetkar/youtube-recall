import type { Metadata } from "next"
import { Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { DndProvider } from "@/components/dnd-provider"
import { Toaster } from "@/components/ui/toaster"
import { ExtensionAuthSync } from "@/components/extension-auth-sync"

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
})

export const metadata: Metadata = {
  title: "YouTube Liked Videos Organizer",
  description: "Organize and manage your liked YouTube videos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={bricolageGrotesque.variable}>
      <body className={`${bricolageGrotesque.className} overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <DndProvider>
              {children}
              <Toaster />
              <ExtensionAuthSync />
            </DndProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
