# 🚀 Deployment Checklist - Quick Reference

Use this checklist to track your deployment progress.

---

## ☑️ Phase 1: Git Repository

- [ ] Navigate to project root: `cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"`
- [ ] Create root `.gitignore` file (see DEPLOYMENT_GUIDE.md)
- [ ] Initialize git: `git init`
- [ ] Stage files: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit: Recall YouTube Organizer"`
- [ ] Create GitHub repository (via web interface)
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/recall-youtube-organiser.git`
- [ ] Push to GitHub: `git push -u origin main`
- [ ] Verify `.env.local` files are NOT in repository

---

## ☑️ Phase 2: Vercel Deployment

- [ ] Go to https://vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Import GitHub repository: `recall-youtube-organiser`
- [ ] **Set Root Directory**: `recall-react-app` ⚠️ CRITICAL
- [ ] Framework: Next.js (auto-detected)
- [ ] Add Environment Variables (copy from local `.env.local`):
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `NEXTAUTH_URL` (update to Vercel URL)
  - [ ] `NEXT_PUBLIC_APP_URL` (update to Vercel URL)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `YOUTUBE_API_KEY`
  - [ ] `NEXT_PUBLIC_CHROME_EXTENSION_ID` (leave empty for now)
- [ ] Click "Deploy"
- [ ] Wait for deployment (~2-3 minutes)
- [ ] **Note your production URL**: `https://_____________________.vercel.app`

---

## ☑️ Phase 3: Google Cloud Console Updates

- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Find OAuth 2.0 Client ID → Edit
- [ ] Add Authorized Redirect URIs:
  - [ ] `https://recallmeapp.xyz/api/auth/callback`
  - [ ] `https://recallmeapp.xyz/api/youtube/callback`
- [ ] Keep localhost URIs for development
- [ ] Click "Save"
- [ ] Verify OAuth consent screen has YouTube scope

---

## ☑️ Phase 4: Supabase Configuration

- [ ] Go to https://supabase.com/dashboard
- [ ] Select project: `mpltdhgnmdcincgvkcav`
- [ ] Settings → API → URL Configuration
- [ ] Add to "Site URL": `https://recallmeapp.xyz`
- [ ] Add to "Redirect URLs": `https://recallmeapp.xyz/**`
- [ ] Verify CORS settings allow your domain

---

## ☑️ Phase 5: Test Production Web App

- [ ] Visit production URL: `https://recallmeapp.xyz`
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow successfully
- [ ] Click "Connect YouTube"
- [ ] Authorize YouTube access
- [ ] Sync liked videos (test API)
- [ ] Create a test folder
- [ ] Move a video to the folder
- [ ] Test tag filtering
- [ ] Test drag and drop
- [ ] Test on mobile device

---

## ☑️ Phase 6: Prepare Chrome Extension

- [ ] Open `recall-chrome-ext\.env.local`
- [ ] Update `VITE_APP_URL` to production: `https://recallmeapp.xyz`
- [ ] Save file
- [ ] Open `recall-chrome-ext\manifest.json`
- [ ] Update version if needed: `"version": "1.0.0"`
- [ ] Navigate to extension folder: `cd recall-chrome-ext`
- [ ] Build production extension: `npm run build`
- [ ] Verify `dist` folder created successfully

---

## ☑️ Phase 7: Test Extension Locally

- [ ] Open Chrome
- [ ] Go to `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select `recall-chrome-ext\dist` folder
- [ ] Extension icon appears in toolbar
- [ ] **Note Extension ID**: `_____________________________________`
- [ ] Go to YouTube video
- [ ] Test: Right-click → "Save to Recall"
- [ ] Test: Floating button appears
- [ ] Test: Extension popup shows folders
- [ ] Verify video appears in web app

---

## ☑️ Phase 8: Update Extension ID (Optional)

If you want web app to know about the extension:

- [ ] Copy Extension ID from `chrome://extensions/`
- [ ] Go to Vercel project → Settings → Environment Variables
- [ ] Add/Update: `NEXT_PUBLIC_CHROME_EXTENSION_ID` = `your_extension_id`
- [ ] Redeploy web app

---

## ☑️ Phase 9: Extension Distribution

### Option A: Manual Distribution (Quick)
- [ ] Zip the `dist` folder: `Compress-Archive -Path dist\* -DestinationPath recall-extension-v1.0.0.zip`
- [ ] Share zip file with users
- [ ] Users load via "Load unpacked"

### Option B: Chrome Web Store (Public)
- [ ] Go to https://chrome.google.com/webstore/devconsole
- [ ] Pay $5 registration fee
- [ ] Create new item
- [ ] Upload zipped `dist` folder
- [ ] Fill in store listing (name, description, screenshots)
- [ ] Submit for review (1-3 days)
- [ ] After approval, note Extension ID
- [ ] Update Vercel env variable with Extension ID

---

## ☑️ Phase 10: Final Production Tests

### Web App
- [ ] Sign in works
- [ ] YouTube connection works
- [ ] Sync works
- [ ] Folders work
- [ ] Video management works
- [ ] Tags work
- [ ] Mobile responsive
- [ ] No console errors

### Extension
- [ ] Detects web app login (cookie auth)
- [ ] Context menu saves videos
- [ ] Floating button saves videos
- [ ] Popup saves videos
- [ ] Videos appear in web app immediately
- [ ] Auto-tagging works
- [ ] Notifications work
- [ ] No console errors

---

## 🎯 URLs to Update

Track your URLs here:

| Service | URL | Status |
|---------|-----|--------|
| **Production Web App** | `https://_______________.vercel.app` | ⬜ |
| **GitHub Repository** | `https://github.com/________/________` | ⬜ |
| **Supabase Project** | `https://mpltdhgnmdcincgvkcav.supabase.co` | ✅ |
| **Google OAuth** | Console: https://console.cloud.google.com | ✅ |
| **Chrome Extension ID** | `_____________________________________` | ⬜ |

---

## 🔑 Environment Variables Reference

### Production Web App (Vercel)
```bash
# Copy these values from your local recall-react-app/.env.local file
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
NEXTAUTH_URL=https://recallmeapp.xyz
NEXT_PUBLIC_APP_URL=https://recallmeapp.xyz
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_CHROME_EXTENSION_ID=(add after extension deployed)
```

### Chrome Extension (.env.local)
```bash
# Copy these values from your local recall-chrome-ext/.env.local file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://recallmeapp.xyz
```

---

## 📝 Notes & Issues

Use this space to track any issues or notes during deployment:

```
Issue 1: 
Solution: 

Issue 2:
Solution:

Issue 3:
Solution:
```

---

## ✅ Deployment Complete!

Once all checkboxes are checked:
- [ ] Web app is live on Vercel
- [ ] Extension is built and tested
- [ ] All services configured
- [ ] Production testing passed

**Congratulations! Your app is deployed! 🎉**

---

**Date Completed**: _______________
**Deployed By**: _______________
**Production URL**: _______________
