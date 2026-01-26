# YouTube Knowledge Manager - Implementation Complete! 🎉

A Next.js application that helps you organize and manage your YouTube liked videos with folders, tags, and automatic syncing.

## 🚀 Quick Start

### 1. Install Dependencies (Already Done ✅)

```bash
npm install
```

### 2. Configure Environment Variables (Already Done ✅)

Your `.env.local` file is already configured with:
- Google OAuth credentials
- Supabase project credentials

### 3. **CRITICAL: Run Database Migration**

**⚠️ You MUST do this before the app will work!**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **"New query"**
5. Copy the contents of `supabase/migrations/001_initial_schema.sql`
6. Paste into the SQL Editor
7. Click **"Run"**

This creates all database tables, RLS policies, indexes, and triggers.

### 4. Configure Supabase Authentication

1. In Supabase dashboard → **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID: `395221789012-cbrbl0cct6r0gaaga2082i9meueo9l3p.apps.googleusercontent.com`
   - Client Secret: (from your `.env.local`)
4. Save

### 5. Update Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   ```
   https://mpltdhgnmdcincgvkcav.supabase.co/auth/v1/callback
   http://localhost:3000/api/auth/callback
   http://localhost:3000/api/youtube/callback
   ```
4. Save

### 6. Start the App

```bash
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
recall-demo/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/          # Supabase auth callback
│   │   ├── folders/                # Folder CRUD API
│   │   ├── videos/
│   │   │   ├── sync/               # Manual sync endpoint
│   │   │   ├── move/               # Move video endpoint
│   │   │   └── route.ts            # Video CRUD API
│   │   └── youtube/
│   │       ├── auth/               # YouTube OAuth init
│   │       └── callback/           # YouTube OAuth callback
│   ├── layout.tsx                  # Root layout with providers
│   └── page.tsx                    # Main page with video grid
├── components/
│   ├── auth-button.tsx             # Sign in/out with Google
│   ├── sync-button.tsx             # Manual sync trigger
│   ├── folder-list.tsx             # Sidebar folder navigation
│   ├── auto-sync.tsx               # Background auto-sync
│   ├── app-header.tsx              # Top header with search
│   ├── app-sidebar.tsx             # Sidebar with folders
│   ├── video-card.tsx              # Video display card
│   └── ui/                         # shadcn/ui components
├── hooks/
│   ├── use-videos.ts               # React Query video hooks
│   └── use-folders.ts              # React Query folder hooks
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts           # Auth middleware
│   ├── services/
│   │   ├── video-service.ts        # Video sync & management
│   │   ├── sync-config.ts          # Auto-tagging rules
│   │   └── auto-sync.ts            # Auto-sync utilities
│   ├── types/
│   │   ├── database.ts             # TypeScript interfaces
│   │   └── supabase.ts             # Supabase generated types
│   ├── query-client.ts             # TanStack Query config
│   └── youtube.ts                  # YouTube API helpers
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database setup
├── middleware.ts                    # Next.js middleware
├── SUPABASE_SETUP.md               # Setup instructions
└── TESTING_GUIDE.md                # Testing checklist
```

## ✨ Features Implemented

### 🔐 Authentication
- **Dual Auth System**: Supabase Auth (primary) + YouTube OAuth (secondary)
- Sign in with Google via Supabase
- Separate YouTube connection for API access
- Secure token storage in database
- Session management with cookies

### 📹 Video Management
- **Sync Liked Videos**: Import from YouTube API
- **Auto-Tagging**: Smart keyword detection
  - Dev, Tutorial, Music, Gaming, Cooking, etc.
- **Folder Organization**: Create custom folders
- **Default Inbox**: Auto-created for new users
- **Video Grid**: Display with thumbnails and metadata

### 🗂️ Folder System
- Create unlimited folders
- Drag-drop support (structure ready)
- Video count per folder
- Filter videos by folder
- Position-based ordering

### 🔄 Auto-Sync
- **On Login**: Syncs if last sync > 1 hour ago
- **Periodic**: Every 30 minutes (when tab visible)
- **Manual**: Click "Sync Videos" button
- Background operation (non-blocking)
- Smart duplicate detection

### 🏷️ Auto-Tagging Rules

Automatically applied based on video title keywords:

| Keywords | Tag | Color |
|----------|-----|-------|
| React, Vue, Next.js, TypeScript, etc. | Dev | Indigo |
| Tutorial, Guide, How to, Learn | Tutorial | Green |
| Music, Song, Album | Music | Pink |
| Cooking, Recipe, Food | Cooking | Amber |
| Gaming, Gameplay, Let's Play | Gaming | Purple |
| Vlog, Daily, Lifestyle | Vlog | Cyan |
| Review, Unboxing, Tech | Tech Review | Blue |
| Fitness, Workout, Gym | Fitness | Red |
| Comedy, Funny, Humor | Comedy | Amber |
| Podcast, Interview, Talk | Podcast | Slate |

### 🔒 Security
- **Row Level Security (RLS)**: Users can only see their own data
- **Encrypted Tokens**: YouTube tokens stored securely
- **Auth Middleware**: Session refresh on each request
- **Protected Routes**: Dashboard requires authentication

### ⚡ Performance
- **React Query**: Optimistic updates & caching
- **Database Indexes**: Fast queries on large datasets
- **Incremental Sync**: Only fetches new videos
- **Lazy Loading**: Components load on demand

## 🗄️ Database Schema

### Tables

**profiles** - User information
- Linked to Supabase Auth users
- Stores YouTube OAuth tokens
- Tracks last sync time

**folders** - Video organization
- User-owned folders
- Position-based ordering
- Default "Inbox" folder

**videos** - YouTube videos
- Linked to user and folder
- Full metadata (title, thumbnail, duration, etc.)
- Liked timestamp from YouTube

**tags** - Reusable tags
- User-defined or auto-generated
- Color customization
- Unique per user

**video_tags** - Many-to-many relationship
- Links videos to tags
- Allows multiple tags per video

### Relationships

```
auth.users (1) ─── (1) profiles
                    │
                    ├── (1-to-many) folders
                    │   │
                    │   └── (1-to-many) videos
                    │       │
                    │       └── (many-to-many) video_tags ─── tags
                    │
                    └── (1-to-many) tags
```

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/callback` - Supabase auth callback
- `GET /api/youtube/auth` - Initiate YouTube OAuth
- `GET /api/youtube/callback` - YouTube OAuth callback

### Videos
- `GET /api/videos` - Fetch videos with filters
- `POST /api/videos/sync` - Trigger manual sync
- `POST /api/videos/move` - Move video to folder
- `DELETE /api/videos?id=<id>` - Delete video

### Folders
- `GET /api/folders` - Fetch user folders
- `POST /api/folders` - Create new folder
- `PATCH /api/folders` - Reorder folders
- `DELETE /api/folders?id=<id>` - Delete folder

## 🎯 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Google OAuth
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **YouTube API**: Google APIs (googleapis)
- **Icons**: Lucide React

## 📝 Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

See [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for comprehensive testing instructions.

**Quick Test:**
1. Run SQL migration in Supabase
2. Start dev server: `npm run dev`
3. Sign in with Google
4. Connect YouTube account
5. Click "Sync Videos"
6. Watch your videos appear!

## 🚨 Important Notes

### Before First Run
1. **SQL Migration is REQUIRED** - The app won't work without database tables
2. **Configure Supabase Auth** - Enable Google provider in dashboard
3. **Update Google OAuth URLs** - Add Supabase callback to Google Cloud Console

### YouTube API Limits
- Free tier: 10,000 quota units/day
- Syncing 50 videos ≈ 100 units
- You can sync ~5,000 videos per day

### Auto-Sync Behavior
- Runs only if last sync > 60 minutes ago
- Only when browser tab is visible
- Silent on login, shows toast on periodic sync
- Handles YouTube token refresh automatically

## 🔄 How It Works

### Authentication Flow
1. User clicks "Sign in with Google"
2. Redirects to Supabase Auth (Google provider)
3. Google auth completes
4. Callback creates profile in database
5. Default "Inbox" folder auto-created via trigger

### YouTube Connection Flow
1. User clicks "Let's connect Youtube"
2. Redirects to Google OAuth (YouTube scope)
3. YouTube auth completes
4. Tokens stored in profile (encrypted)
5. Ready to sync videos

### Video Sync Flow
1. Fetch liked videos from YouTube API (up to 50)
2. Check which videos already exist in database
3. Filter out duplicates
4. Insert new videos into default "Inbox" folder
5. Auto-tag based on title keywords
6. Update last sync timestamp
7. React Query refetches and updates UI

### Auto-Tagging Logic
```typescript
// Example: "Learn React - Complete Tutorial"
detectTags("Learn React - Complete Tutorial")
// Returns: ["Dev", "Tutorial"]

// Tags are created if they don't exist
// Video-tag relationships are created
```

## 📚 Next Steps

### Immediate
1. ✅ Run SQL migration
2. ✅ Configure Supabase Auth
3. ✅ Test the app

### Future Enhancements
- [ ] Drag-drop videos between folders
- [ ] Search videos by title/channel
- [ ] Custom tag colors via UI
- [ ] Export videos to CSV/JSON
- [ ] Share folders publicly
- [ ] Video notes and bookmarks
- [ ] Playlists integration
- [ ] Advanced filtering (date, duration, tags)

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

### Database Errors
- Check SQL migration ran successfully
- Verify RLS policies are enabled
- Check user is authenticated

### Sync Errors
- Verify YouTube tokens in profiles table
- Check YouTube API quota in Google Cloud Console
- Review Supabase logs

### Auth Errors
- Verify Google OAuth callback URLs
- Check Supabase Auth provider is enabled
- Review browser console for errors

## 📄 License

This project is for educational purposes.

## 🙏 Credits

Built with:
- Next.js
- Supabase
- TanStack Query
- shadcn/ui
- Tailwind CSS

---

**Ready to organize your YouTube videos? Start with the SQL migration!** 🚀

For detailed setup instructions, see [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

For testing checklist, see [`TESTING_GUIDE.md`](TESTING_GUIDE.md)
