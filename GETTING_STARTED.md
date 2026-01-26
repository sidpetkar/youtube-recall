# Getting Started with Recall

This guide will walk you through setting up the complete Recall system from scratch.

## Overview

Recall consists of three parts:
1. **Shared Package** - Common types and utilities
2. **Web App** - Next.js application for managing videos
3. **Chrome Extension** - Quick-save extension for YouTube

## Step-by-Step Setup

### Part 1: Supabase Setup (15 minutes)

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Sign up/login
   - Click "New Project"
   - Choose organization, name your project
   - Set a strong database password (save it!)
   - Select a region close to you
   - Wait for project to be ready (~2 minutes)

2. **Run Database Migrations**
   - In Supabase Dashboard, go to SQL Editor
   - Copy and paste each migration file from `recall-react-app/supabase/migrations/`
   - Run them in order:
     - `001_initial_schema.sql`
     - `002_add_parent_id_to_tags.sql`
     - `003_create_example_hierarchical_tags.sql`

3. **Get Your Credentials**
   - Go to Settings → API
   - Copy these values:
     - `Project URL` (looks like https://xxxxx.supabase.co)
     - `anon public` key (starts with "eyJ...")
     - `service_role` key (also starts with "eyJ..." - keep this secret!)

### Part 2: Google OAuth Setup (10 minutes)

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing
   - Name it "Recall" (or whatever you prefer)

2. **Enable YouTube Data API v3**
   - In Google Cloud Console
   - Click "Enable APIs and Services"
   - Search for "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "Credentials" in left menu
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: Recall
     - User support email: your email
     - Developer email: your email
     - Scopes: Add `../auth/youtube.readonly`
     - Test users: Add your Google account email
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (for development)
     - `http://localhost:3000/api/youtube/callback` (for YouTube)
     - Later add your production URLs
   - Click "Create"
   - Copy Client ID and Client Secret

### Part 3: Web App Setup (10 minutes)

1. **Install Dependencies**
   ```bash
   cd recall-react-app
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Edit `.env.local`** with your credentials:
   ```bash
   # From Google Cloud Console
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here

   # Your app URL
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # From Supabase Dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

4. **Start the Web App**
   ```bash
   npm run dev
   ```

5. **Test the Web App**
   - Open http://localhost:3000
   - Click "Sign in with Google"
   - Connect your YouTube account
   - Try syncing your liked videos
   - Create some folders

### Part 4: Chrome Extension Setup (5 minutes)

1. **Install Dependencies**
   ```bash
   cd recall-chrome-ext
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`** (use same Supabase credentials):
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_APP_URL=http://localhost:3000
   ```

4. **Build the Extension**
   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `recall-chrome-ext/dist` folder
   - Extension icon should appear in toolbar

6. **Test the Extension**
   - Make sure you're logged in to the web app
   - Go to any YouTube video (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
   - You should see a "Save" button in bottom-right
   - Right-click on the page → "Save to Recall"
   - Click extension icon in toolbar
   - All three methods should work!

## Common Issues

### "YouTube not connected"
**Problem**: Web app says you need to connect YouTube  
**Solution**: 
- Make sure you added the YouTube Data API v3 in Google Cloud
- Check that OAuth scope includes YouTube readonly access
- Try disconnecting and reconnecting in the web app

### Extension shows "Login to Recall"
**Problem**: Extension doesn't detect your web app login  
**Solution**:
- Make sure you're logged in to the web app first
- Check that `VITE_APP_URL` in extension `.env.local` matches web app URL
- Try clearing browser cookies and logging in again
- Check if cookies are enabled in Chrome settings

### "Failed to fetch folders"
**Problem**: Extension can't load your folders  
**Solution**:
- Make sure web app is running at the URL specified in `VITE_APP_URL`
- Check browser console for CORS errors
- Verify Supabase credentials are correct in both apps

### Database/Supabase Errors
**Problem**: Web app shows database errors  
**Solution**:
- Check that all migrations ran successfully
- Verify RLS policies are enabled
- Make sure you're using the correct Supabase project URL
- Check that service role key is correct (needed for YouTube token storage)

### API Quota Exceeded
**Problem**: YouTube API says quota exceeded  
**Solution**:
- Free tier allows 10,000 quota units per day
- Each sync uses ~50-100 units
- Wait until tomorrow or upgrade in Google Cloud Console
- Consider syncing less frequently

## Next Steps

### For Production

1. **Deploy Web App**
   - Use Vercel (recommended): `vercel deploy`
   - Or Netlify, Render, Railway, etc.
   - Update OAuth redirect URIs in Google Cloud Console
   - Update `VITE_APP_URL` in extension to production URL

2. **Publish Extension**
   - Update version in `manifest.json`
   - Build: `npm run build`
   - Create a developer account at Chrome Web Store
   - Upload the zipped `dist` folder
   - Fill in store listing details
   - Submit for review (takes 1-3 days)

3. **Add Custom Domain** (optional)
   - Set up custom domain in Vercel/Netlify
   - Update OAuth redirect URIs
   - Update `VITE_APP_URL` in extension

### Customization Ideas

- **Custom Tags**: Edit `shared/constants/tags.ts` to add your own auto-tagging rules
- **Branding**: Update colors in Tailwind config files
- **Icons**: Replace extension icons in `recall-chrome-ext/assets/icons/`
- **Features**: Add notes, ratings, watch history, playlists, etc.

## Getting Help

- Check the README files in each folder
- Review the implementation docs in `recall-react-app/`
- Check Supabase documentation for database issues
- Review Chrome Extension API docs for extension issues

## Success!

You now have a fully functional YouTube video organizer with:
- ✅ Web app for managing videos
- ✅ Chrome extension for quick saving
- ✅ Auto-tagging and folder organization
- ✅ Secure authentication
- ✅ Syncing from YouTube

Happy organizing! 🎉
