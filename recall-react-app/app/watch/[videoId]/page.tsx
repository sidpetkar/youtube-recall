"use client"

import * as React from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { YoutubeEmbed } from "@/components/watch/youtube-embed"
import { NotionSection } from "@/components/watch/notion-section"
import { SummarizerPanel } from "@/components/watch/summarizer-panel"
import { FileText, MessageCircle } from "lucide-react"

export default function WatchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const videoId = params.videoId as string
  const startAtSeconds = searchParams.get("t")
    ? parseInt(searchParams.get("t")!, 10)
    : undefined
  const [user, setUser] = React.useState<unknown>(null)
  const supabase = createClient()

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      if (!u) {
        router.push("/auth")
        return
      }
      setUser(u)
    }
    getUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.push("/auth")
      else setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!videoId) {
    router.replace("/")
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 space-y-6">
              <YoutubeEmbed
                videoId={videoId}
                startAtSeconds={
                  Number.isFinite(startAtSeconds) ? startAtSeconds! : undefined
                }
              />
              {isMobile ? (
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notes" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="ask" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Ask
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="notes" className="mt-3">
                    <NotionSection videoId={videoId} />
                  </TabsContent>
                  <TabsContent value="ask" className="mt-3">
                    <SummarizerPanel className="w-full" />
                  </TabsContent>
                </Tabs>
              ) : (
                <NotionSection videoId={videoId} />
              )}
            </div>
            {!isMobile && <SummarizerPanel />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
