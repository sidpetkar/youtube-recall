# Recall Chrome Extension

Chrome extension for quickly saving YouTube videos to your Recall folders while browsing.

## Features

- **Context Menu Integration**: Right-click on any YouTube video page to save it to a folder
- **Floating Button**: Quick save button appears on YouTube video pages
- **Popup Interface**: Click the extension icon for a clean folder selector UI
- **Cookie Piggyback Authentication**: Seamlessly uses your web app login session
- **Auto-tagging**: Videos are automatically tagged based on their titles

## Development Setup

### Prerequisites

- Node.js 18+ installed
- Web app running locally (for testing)
- Supabase project configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your environment variables in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:3000
```

### Development

Build the extension in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Usage

### First Time Setup

1. Install the extension in Chrome
2. Navigate to your Recall web app and sign in with Google
3. The extension will automatically detect your session

### Saving Videos

**Method 1: Context Menu**
1. Navigate to any YouTube video
2. Right-click anywhere on the page
3. Select "Save to Recall" → Choose folder

**Method 2: Floating Button**
1. Navigate to any YouTube video
2. Click the "Save" button in the bottom-right corner
3. Select a folder from the modal

**Method 3: Extension Popup**
1. Click the extension icon in Chrome toolbar
2. If on a YouTube video page, select a folder
3. Video will be saved automatically

## Architecture

### Components

- **Background Service Worker** (`src/background/service-worker.ts`)
  - Manages context menu
  - Handles authentication state
  - Caches folders for performance
  - Shows notifications

- **Content Script** (`src/content/youtube-detector.ts`)
  - Injects floating button on YouTube
  - Detects video page changes
  - Shows folder selector modal

- **Popup** (`src/popup/`)
  - React-based UI
  - Folder selector component
  - Login prompt for unauthenticated users

### Authentication

Uses "cookie piggyback" method:
1. User logs in to web app
2. Supabase sets session cookie in browser
3. Extension reads the session cookie
4. Extension makes authenticated API calls

No separate login required!

## Project Structure

```
recall-chrome-ext/
├── src/
│   ├── background/
│   │   └── service-worker.ts    # Background script
│   ├── content/
│   │   ├── youtube-detector.ts  # Content script
│   │   └── styles.css           # Injected styles
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.tsx            # Popup entry
│   │   ├── styles.css
│   │   └── components/
│   │       ├── Popup.tsx
│   │       ├── FolderSelector.tsx
│   │       ├── LoginPrompt.tsx
│   │       └── LoadingSpinner.tsx
│   └── lib/
│       ├── supabase.ts          # Supabase client & auth
│       ├── api.ts               # API calls
│       ├── youtube.ts           # YouTube utilities
│       └── utils.ts             # General utilities
├── assets/
│   └── icons/                   # Extension icons
├── manifest.json                # Extension manifest
├── vite.config.ts              # Vite configuration
├── package.json
└── README.md
```

## Troubleshooting

### Extension shows "Login to Recall"
- Make sure you're logged in to the web app first
- Refresh the extension page in Chrome
- Check that the `VITE_APP_URL` matches your web app URL

### Context menu not appearing
- Ensure you're on a YouTube video page
- Try refreshing the page
- Check Chrome DevTools for any errors

### Videos not saving
- Check that the web app API is running
- Verify Supabase credentials are correct
- Check browser console for error messages

### Floating button not appearing
- Make sure you're on a YouTube video page (not homepage)
- Check if other extensions are conflicting
- Try disabling and re-enabling the extension

## Building for Production

1. Update version in `manifest.json`
2. Build the extension:
```bash
npm run build
```
3. The `dist` folder contains the production build
4. Zip the `dist` folder for Chrome Web Store submission

## License

MIT
