# 🚀 Deployment Guide - Recall YouTube Organizer

## Overview

This guide covers deploying:
1. **Web App** (Next.js) → Vercel
2. **Chrome Extension** → Chrome Web Store (or manual distribution)
3. **Configuration Updates** for production environment

---

## 📋 Pre-Deployment Checklist

- [x] Supabase project already set up
- [x] Google OAuth credentials created
- [x] Local development working
- [ ] Git repository initialized
- [ ] Vercel account ready
- [ ] Production URLs decided

---

## PART 1: Git Repository Setup

### Step 1.1: Initialize Git Repository

```bash
# Navigate to project root
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"

# Initialize git (if not already done)
git init

# Create root .gitignore
```

### Step 1.2: Create Root `.gitignore`

Create a file at the root: `c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\.gitignore`

```gitignore
# Dependencies
node_modules/
**/node_modules/

# Environment files
.env
.env.local
.env*.local
**/.env.local

# Build outputs
dist/
build/
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Chrome extension (keep source, ignore built extension)
recall-chrome-ext/dist/

# Misc
*.pem
.cache/
```

### Step 1.3: Stage and Commit

```bash
# Check what will be committed
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Recall YouTube Organizer with web app and Chrome extension"
```

### Step 1.4: Push to GitHub

```bash
# Create a new repository on GitHub (via web interface)
# Then connect and push:

git remote add origin https://github.com/YOUR_USERNAME/recall-youtube-organiser.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `.env.local` files are NOT committed (they're in .gitignore)

---

## PART 2: Deploy Web App to Vercel

### Step 2.1: Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `recall-youtube-organiser`
4. **Configure Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `recall-react-app` ⚠️ IMPORTANT
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Step 2.2: Add Environment Variables in Vercel

In Vercel project settings → **Environment Variables**, add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret

# Application URLs (UPDATE THESE!)
NEXTAUTH_URL=https://ytrecall.online
NEXT_PUBLIC_APP_URL=https://ytrecall.online

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Chrome Extension ID (leave empty for now, add after extension is deployed)
NEXT_PUBLIC_CHROME_EXTENSION_ID=
```

**Note**: Set these for **Production**, **Preview**, and **Development** environments.

### Step 2.3: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Note your production URL: `https://ytrecall.online`

---

## PART 3: Update Google Cloud Console

### Step 3.1: Add Production Redirect URIs

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Under **"Authorized redirect URIs"**, add:
   ```
   https://ytrecall.online/api/auth/callback
   https://ytrecall.online/api/youtube/callback
   ```
5. Keep the localhost URLs for development:
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/api/youtube/callback
   ```
6. Click **"Save"**

### Step 3.2: Verify OAuth Consent Screen

1. Go to **"OAuth consent screen"** in Google Cloud Console
2. Ensure these scopes are added:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/youtube.readonly`
3. Add your production domain if needed

---

## PART 4: Update Supabase Configuration

### Step 4.1: Add Production URL to Allowed Origins

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mpltdhgnmdcincgvkcav`
3. Go to **Settings** → **API**
4. Scroll to **"URL Configuration"**
5. Add to **"Site URL"**: `https://ytrecall.online`
6. Add to **"Redirect URLs"**:
   ```
   https://ytrecall.online/**
   http://localhost:3000/**
   ```

### Step 4.2: Update CORS Settings (if needed)

1. In Supabase Dashboard → **Settings** → **API**
2. Under **"CORS"**, ensure your production URL is allowed
3. Usually `*` is fine for public apps, but you can restrict to:
   ```
   https://ytrecall.online
   http://localhost:3000
   ```

---

## PART 5: Test Production Web App

### Step 5.1: Test Authentication Flow

1. Visit `https://ytrecall.online`
2. Click **"Sign in with Google"**
3. Complete OAuth flow
4. Verify you're redirected back and logged in

### Step 5.2: Test YouTube Connection

1. Click **"Connect YouTube"**
2. Authorize YouTube access
3. Try syncing liked videos
4. Verify videos appear in the app

### Step 5.3: Test Core Features

- [ ] Create folders
- [ ] Move videos between folders
- [ ] Tag filtering works
- [ ] Auto-tagging works
- [ ] Drag and drop works

---

## PART 6: Prepare Chrome Extension for Production

### Step 6.1: Update Extension Environment Variables

Edit: `recall-chrome-ext\.env.local`

```bash
# Supabase (same as before)
VITE_SUPABASE_URL=https://mpltdhgnmdcincgvkcav.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbHRkaGdubWRjaW5jZ3ZrY2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzEwNzIsImV4cCI6MjA4NDkwNzA3Mn0.RcokPCwM-8gx4eJ157_7oucQVaVWejoVVnFVJUehoUA

# UPDATE THIS to your production URL
VITE_APP_URL=https://ytrecall.online
```

### Step 6.2: Update Manifest Version

Edit: `recall-chrome-ext\manifest.json`

Update the version number (if publishing to Chrome Web Store):

```json
{
  "manifest_version": 3,
  "name": "Recall - YouTube Video Organizer",
  "version": "1.0.0",
  ...
}
```

### Step 6.3: Build Production Extension

```bash
cd recall-chrome-ext
npm run build
```

This creates a production-ready extension in `recall-chrome-ext/dist/`

---

## PART 7: Deploy Chrome Extension

### Option A: Manual Distribution (Fastest)

**For personal use or testing:**

1. Build the extension (Step 6.3)
2. Zip the `dist` folder:
   ```bash
   # In recall-chrome-ext folder
   Compress-Archive -Path dist\* -DestinationPath recall-extension-v1.0.0.zip
   ```
3. Share the zip file with users
4. Users load it via `chrome://extensions/` → "Load unpacked"

### Option B: Chrome Web Store (Public Distribution)

**For public release:**

#### Step 7.1: Create Developer Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay one-time $5 registration fee
3. Complete developer profile

#### Step 7.2: Prepare Store Listing Assets

You'll need:
- **Icon**: 128x128px (already have in `assets/icons/`)
- **Screenshots**: 1280x800px or 640x400px (take 3-5 screenshots)
- **Promotional images** (optional):
  - Small tile: 440x280px
  - Large tile: 920x680px
  - Marquee: 1400x560px

#### Step 7.3: Create Store Listing

1. Click **"New Item"** in Chrome Web Store Developer Dashboard
2. Upload the **zipped dist folder** (`recall-extension-v1.0.0.zip`)
3. Fill in required fields:
   - **Name**: Recall - YouTube Video Organizer
   - **Summary**: Save and organize YouTube videos with one click
   - **Description**: (Write compelling description)
   - **Category**: Productivity
   - **Language**: English
4. Upload icon and screenshots
5. Add privacy policy URL (if collecting user data)
6. Set pricing: Free

#### Step 7.4: Submit for Review

1. Click **"Submit for review"**
2. Review typically takes **1-3 business days**
3. You'll receive email when approved/rejected

#### Step 7.5: Get Extension ID

After publishing (or even in draft):
1. Note the extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
2. Update Vercel environment variable:
   ```
   NEXT_PUBLIC_CHROME_EXTENSION_ID=your_extension_id_here
   ```
3. Redeploy web app

---

## PART 8: Cookie Authentication Configuration

### Important: Cross-Origin Cookies

The extension uses **cookie piggyback authentication**, which means it reads the Supabase session cookie from your web app.

#### For Development (localhost)
✅ Works by default - same origin

#### For Production (different domains)
You have **two options**:

### Option 1: Same Domain (Recommended)

**Host extension on same domain as web app:**

1. In Vercel, add a custom domain: `app.yourdomain.com`
2. Extension will be published with ID
3. Cookies work seamlessly (same domain)

### Option 2: Cross-Origin Setup

**If extension and web app are on different domains:**

1. **Update Supabase Cookie Settings**:
   - In your Supabase project
   - Go to **Authentication** → **Settings**
   - Set **"Cookie Options"**:
     - `SameSite`: `None`
     - `Secure`: `true`

2. **Update Web App CORS** (if needed):
   - Add extension origin to allowed CORS origins
   - Extension ID: `chrome-extension://YOUR_EXTENSION_ID`

3. **Test thoroughly** - cross-origin cookies can be tricky!

---

## PART 9: Final Testing Checklist

### Web App Production Tests

- [ ] Visit production URL
- [ ] Sign in with Google works
- [ ] Connect YouTube works
- [ ] Sync liked videos works
- [ ] Create/edit/delete folders works
- [ ] Move videos between folders works
- [ ] Tag filtering works
- [ ] Drag and drop works
- [ ] Theme toggle works
- [ ] Mobile responsive

### Chrome Extension Tests

- [ ] Install production extension
- [ ] Extension detects web app login (cookie auth)
- [ ] Right-click context menu appears on YouTube
- [ ] Context menu saves video
- [ ] Floating button appears on YouTube video pages
- [ ] Floating button saves video
- [ ] Extension popup shows folders
- [ ] Extension popup saves video
- [ ] Saved videos appear in web app immediately
- [ ] Auto-tagging works
- [ ] Notifications show success/error

---

## PART 10: Post-Deployment Updates

### When You Make Changes

#### Web App Updates:
```bash
# Make changes
git add .
git commit -m "Description of changes"
git push origin main

# Vercel auto-deploys on push to main
```

#### Extension Updates:
```bash
# Update version in manifest.json
# Make changes
cd recall-chrome-ext
npm run build

# For manual distribution: zip and share
# For Chrome Web Store: upload new version in developer dashboard
```

---

## 🔒 Security Checklist

- [ ] `.env.local` files are in `.gitignore` (never committed)
- [ ] Service role key only used server-side (Next.js API routes)
- [ ] Anon key is public (safe to expose in extension)
- [ ] OAuth redirect URIs restricted to your domains
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced on production
- [ ] Cookie `Secure` flag enabled in production

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Optional)

1. In Vercel project → **Analytics**
2. Enable Web Analytics
3. View traffic, performance metrics

### Supabase Logs

1. Supabase Dashboard → **Logs**
2. Monitor API usage, errors
3. Check authentication logs

### Chrome Web Store Stats

1. Developer Dashboard → **Your listing**
2. View installs, ratings, reviews

---

## 🚨 Troubleshooting Production Issues

### "OAuth Error" in Production

**Cause**: Redirect URI not configured
**Fix**: Add production URL to Google Cloud Console authorized redirect URIs

### Extension Can't Load Folders

**Cause**: CORS or cookie issue
**Fix**: 
1. Check `VITE_APP_URL` points to production
2. Verify Supabase CORS settings
3. Test cookie authentication

### "Failed to Fetch" Errors

**Cause**: API endpoint not accessible
**Fix**:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API endpoints directly

### Videos Not Syncing

**Cause**: YouTube API quota exceeded or token expired
**Fix**:
1. Check Google Cloud Console quota usage
2. Disconnect and reconnect YouTube in web app
3. Wait for quota reset (midnight Pacific Time)

---

## 📝 Environment Variables Summary

### Web App (Vercel)
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=https://ytrecall.online
NEXT_PUBLIC_APP_URL=https://ytrecall.online
NEXT_PUBLIC_SUPABASE_URL=https://mpltdhgnmdcincgvkcav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_CHROME_EXTENSION_ID=your_extension_id (optional)
```

### Chrome Extension (.env.local)
```bash
VITE_SUPABASE_URL=https://mpltdhgnmdcincgvkcav.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://ytrecall.online
```

---

## 🎯 Quick Deployment Steps (TL;DR)

```bash
# 1. Git setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/recall-youtube-organiser.git
git push -u origin main

# 2. Deploy to Vercel
# - Import from GitHub
# - Set root directory: recall-react-app
# - Add environment variables
# - Deploy

# 3. Update Google OAuth
# - Add production redirect URIs

# 4. Update Supabase
# - Add production URL to allowed origins

# 5. Build extension
cd recall-chrome-ext
# Update VITE_APP_URL in .env.local
npm run build

# 6. Test everything!
```

---

## 🎉 Success!

You now have:
- ✅ Web app deployed on Vercel
- ✅ Chrome extension built for production
- ✅ All services configured for production
- ✅ Secure authentication working
- ✅ Full functionality in production

**Next Steps:**
- Share with users
- Gather feedback
- Iterate and improve
- Consider publishing to Chrome Web Store

---

## 📞 Need Help?

- **Vercel Issues**: https://vercel.com/docs
- **Supabase Issues**: https://supabase.com/docs
- **Chrome Extension Issues**: https://developer.chrome.com/docs/extensions/
- **Google OAuth Issues**: https://console.cloud.google.com/apis/credentials

---

**Last Updated**: January 26, 2026
**Version**: 1.0.0
