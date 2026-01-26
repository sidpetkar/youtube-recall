# Recall - YouTube Video Organizer

A full-stack application for organizing and managing your YouTube liked videos. Save, categorize, and organize videos with folders and tags.

## Project Structure

This is a monorepo containing:

- **shared/** - Shared TypeScript types, constants, and utilities
- **recall-react-app/** - Next.js web application
- **recall-chrome-ext/** - Chrome extension for quick video saving

## Features

### Web App
- 🔐 Google OAuth authentication via Supabase
- 📺 Sync liked videos from YouTube
- 📁 Organize videos into custom folders
- 🏷️ Auto-tagging based on video titles
- 🔍 Search and filter videos
- 🎨 Modern, responsive UI with dark mode
- ✨ Drag-and-drop folder management

### Chrome Extension
- 🖱️ Right-click context menu to save videos
- 💾 Floating button on YouTube pages
- 🚀 Quick folder selector popup
- 🔒 Cookie-based authentication (no separate login!)
- 📱 Seamless integration with web app

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account ([Get one free](https://supabase.com))
- Google Cloud Platform project (for OAuth and YouTube API)

### 1. Setup Shared Package

```bash
cd shared
npm install
```

### 2. Setup Web App

```bash
cd recall-react-app
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials
```

**Configure Supabase:**
- Create a new Supabase project
- Run the migrations in `supabase/migrations/`
- Get your project URL and anon key from Supabase dashboard
- Add them to `.env.local`

**Configure Google OAuth:**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
- Add YouTube Data API v3 to your project
- Add credentials to `.env.local`

**Run the web app:**
```bash
npm run dev
```

Visit http://localhost:3000

### 3. Setup Chrome Extension

```bash
cd recall-chrome-ext
npm install

# Copy environment template
cp .env.example .env.local

# Use same Supabase credentials from web app
# Set VITE_APP_URL=http://localhost:3000
```

**Build and load:**
```bash
npm run build
```

Then:
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `recall-chrome-ext/dist` folder

## Tech Stack

### Shared
- TypeScript
- YouTube API utilities
- Auto-tagging logic

### Web App
- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth + Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React

### Chrome Extension
- **Build Tool**: Vite + @crxjs/vite-plugin
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **API**: Supabase JS client
- **Manifest**: V3

## Environment Variables

### Web App (`.env.local`)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Chrome Extension (`.env.local`)

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:3000
```

## Database Schema

Tables:
- **profiles** - User profiles with YouTube tokens
- **folders** - Video organization folders
- **videos** - Saved YouTube videos
- **tags** - Hierarchical tags for categorization
- **video_tags** - Many-to-many relationship

All tables have Row Level Security (RLS) enabled.

## API Endpoints

### Web App
- `GET /api/folders` - Get user's folders
- `POST /api/folders` - Create new folder
- `GET /api/videos` - Get user's videos with filters
- `POST /api/videos/add-by-url` - Add video by YouTube URL
- `POST /api/videos/sync` - Sync liked videos from YouTube
- `GET /api/tags` - Get user's tags
- `POST /api/youtube/auth` - Initiate YouTube OAuth

## Development Workflow

### Working on Shared Types

1. Edit files in `shared/`
2. Changes are automatically available in both web app and extension
3. Run `npm run typecheck` to verify types

### Working on Web App

1. Make sure web app is running (`npm run dev`)
2. Changes hot-reload automatically
3. Test in browser at http://localhost:3000

### Working on Extension

1. Make changes in `recall-chrome-ext/`
2. Run `npm run build` to rebuild
3. Click "Reload" button in `chrome://extensions/`
4. Test on YouTube pages

## Deployment

### Web App

Deploy to Vercel (recommended):
```bash
vercel deploy
```

Or any Next.js compatible platform (Netlify, Render, etc.)

### Chrome Extension

1. Update version in `manifest.json`
2. Build for production: `npm run build`
3. Zip the `dist` folder
4. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## Troubleshooting

### "YouTube not connected" error
- Go to web app and connect your YouTube account
- Make sure Google OAuth includes YouTube scope

### Extension can't authenticate
- Sign in to web app first
- Make sure `VITE_APP_URL` matches your web app URL
- Check that cookies are enabled

### Videos not syncing
- Check YouTube API quota (10,000 requests/day for free tier)
- Verify YouTube API is enabled in Google Cloud Console
- Check that refresh token is valid

### Database errors
- Verify RLS policies are set up correctly
- Check Supabase project status
- Review migration files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in each package's README
- Review Supabase and Google OAuth documentation

---

Built with ❤️ using Next.js, Supabase, and Chrome Extensions API
