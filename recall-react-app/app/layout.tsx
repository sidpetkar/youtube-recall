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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Recall — YouTube Liked Videos Organizer",
  description: "Organize and manage your liked YouTube videos",
  openGraph: {
    title: "Recall — YouTube Liked Videos Organizer",
    description: "Organize and manage your liked YouTube videos",
    url: appUrl,
    siteName: "Recall",
  },
  alternates: {
    canonical: appUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={bricolageGrotesque.variable}>
      <head>
        <meta name="google-site-verification" content="-dWScSuzsChBd8Wu6zL9Hnq3yfzKzW_iDVpPZrX5QRs" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        {/* PWA / Add to Home Screen (iOS) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/recal-icon-128.png" />
      </head>
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
