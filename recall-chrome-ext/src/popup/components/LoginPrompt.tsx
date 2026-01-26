import React from "react"
import { openWebApp } from "../../lib/youtube"

export function LoginPrompt() {
  return (
    <div className="w-80 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Welcome to Recall</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to start organizing your YouTube videos
          </p>
        </div>

        <button
          onClick={openWebApp}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Sign In
        </button>

        <p className="text-xs text-muted-foreground">
          You'll be redirected to the Recall web app to sign in.
          <br />
          Once signed in, your session will sync automatically.
        </p>
      </div>
    </div>
  )
}
