"use client"

import * as React from "react"
import { Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function YouTubeConnectDialog() {
  const [open, setOpen] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Redirect to OAuth endpoint
      window.location.href = "/api/youtube/auth"
    } catch (error) {
      setIsConnecting(false)
      toast({
        title: "Connection failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Youtube className="mr-2 h-4 w-4" />
          Let&apos;s connect Youtube
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your YouTube Account</DialogTitle>
          <DialogDescription>
            Connect your Google account to fetch and organize your liked YouTube videos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By connecting your YouTube account, you&apos;ll be able to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>View your recently liked videos</li>
              <li>Organize videos into categories</li>
              <li>Search through your liked videos</li>
            </ul>
            <div className="pt-4">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <span className="mr-2">Connecting...</span>
                  </>
                ) : (
                  <>
                    <Youtube className="mr-2 h-4 w-4" />
                    Connect with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
