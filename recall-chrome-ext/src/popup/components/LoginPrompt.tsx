import React from "react"
import { openWebApp } from "../../lib/youtube"

export function LoginPrompt() {
  const iconUrl = chrome.runtime.getURL("assets/icons/icon-128.png")
  
  return (
    <div className="w-80 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img 
            src={iconUrl} 
            alt="Recall" 
            className="w-16 h-16 rounded-xl"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Welcome to Recall</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to start organizing your YouTube videos
          </p>
        </div>

        <button
          onClick={() => openWebApp("/auth")}
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
