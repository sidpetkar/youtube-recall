"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Public landing page at / — visible without login.
 * Meets Google OAuth homepage requirements: describes the app, explains data use, links to Privacy/Terms.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] flex flex-col">
      {/* Glass morphic header */}
      <header className="sticky top-0 z-10 border-b border-white/20 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:bg-background/40 dark:backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <img
            src="/recall-svg-logo.svg"
            alt="Recall"
            className="h-9 w-auto object-contain"
          />
          <Link href="/auth">
            <Button variant="default" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl py-12 px-4 md:py-16">
        <div className="space-y-12 text-center md:text-left">
          {/* Hero: Recall logo, headline (slipping behind graphic), large graphic */}
          <section className="space-y-4">
            <div className="flex justify-center">
              <img
                src="/recall-svg-logo.svg"
                alt="Recall"
                className="h-14 w-auto object-contain md:h-16"
              />
            </div>
            <h1
              className="text-4xl font-bold tracking-tight text-center md:text-5xl lg:text-6xl pb-2"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              Organize your YouTube liked videos
            </h1>
            <div className="flex justify-center -mt-6 md:-mt-8">
              <img
                src="/landing-graphic.png"
                alt="Save to Folder — choose a folder for this video"
                className="w-full max-w-4xl object-contain md:max-w-5xl"
              />
            </div>
          </section>

          {/* Get started with Google above the two cards */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/auth">
              <Button size="lg" className="w-full min-w-[280px] md:w-auto">
                <img
                  src="/google-g-logo.png"
                  alt=""
                  className="mr-2 h-5 w-5 object-contain"
                  width={20}
                  height={20}
                />
                Get started with Google
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </div>

          <section className="rounded-xl border border-border bg-card p-6 text-left space-y-4">
            <h2 className="text-xl font-semibold">What Recall does</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Sync your liked videos from YouTube into the app</li>
              <li>Organize them into custom folders</li>
              <li>Save videos from YouTube while browsing with the Chrome extension</li>
              <li>Search and filter your library</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 text-left space-y-4">
            <h2 className="text-xl font-semibold">Why we use your Google / YouTube data</h2>
            <p className="text-muted-foreground">
              Recall uses Google Sign-In to identify you and the YouTube Data API to read your 
              liked videos (and related metadata such as title and channel). We use this data only 
              to sync and display your videos inside Recall and to let you organize them. 
              We do not access your Google Drive or other Google services. You can revoke access 
              at any time from your Google Account settings.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground md:flex-row">
          <span>Recall — YouTube Liked Videos Organizer</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
