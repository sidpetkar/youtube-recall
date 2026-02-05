# 🏗️ Architecture & Deployment Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
└───────────┬─────────────────────────────────────┬───────────────┘
            │                                     │
            │ Browser                             │ Chrome Extension
            │                                     │
            ▼                                     ▼
┌───────────────────────┐              ┌──────────────────────┐
│   WEB APP (Next.js)   │              │  CHROME EXTENSION    │
│  ─────────────────    │              │  ────────────────    │
│  • React UI           │              │  • Popup UI          │
│  • API Routes         │◄─────────────┤  • Content Script    │
│  • Auth (NextAuth)    │  Cookie Auth │  • Background Worker │
│  • YouTube Sync       │              │  • Context Menu      │
└───────────┬───────────┘              └──────────┬───────────┘
            │                                     │
            │ API Calls                           │ API Calls
            │                                     │
            ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                            │
│  ──────────────────────────────────────────────────────────     │
│  • PostgreSQL Database                                           │
│  • Row Level Security (RLS)                                      │
│  • Authentication                                                │
│  • Storage (for user data)                                       │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    │ Stores
                                    ▼
                        ┌───────────────────────┐
                        │   DATABASE TABLES     │
                        │  ─────────────────    │
                        │  • users              │
                        │  • folders            │
                        │  • videos             │
                        │  • tags               │
                        │  • youtube_tokens     │
                        └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD (OAuth & YouTube API)                  │
│  ──────────────────────────────────────────────────────────     │
│  • OAuth 2.0 Authentication                                      │
│  • YouTube Data API v3                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Saving a Video via Extension

```
1. User clicks "Save" on YouTube
   │
   ▼
2. Extension reads Supabase cookie (auth)
   │
   ▼
3. Extension calls Web App API: POST /api/videos/add-by-url
   │
   ▼
4. Web App validates auth token
   │
   ▼
5. Web App fetches video metadata from YouTube API
   │
   ▼
6. Web App applies auto-tagging logic
   │
   ▼
7. Web App saves to Supabase database
   │
   ▼
8. Supabase returns success
   │
   ▼
9. Web App returns success to Extension
   │
   ▼
10. Extension shows success notification
```

---

## 🌐 Environment Mapping: Local → Production

### Local Development
```
┌─────────────────────────────────────────────────────────┐
│ Web App: http://localhost:3000                          │
│ Extension: chrome-extension://LOCAL_ID                  │
│ Supabase: https://mpltdhgnmdcincgvkcav.supabase.co     │
│ Google OAuth: Redirect to localhost:3000               │
└─────────────────────────────────────────────────────────┘
```

### Production
```
┌─────────────────────────────────────────────────────────┐
│ Web App: https://ytrecall.online              │
│ Extension: chrome-extension://PROD_EXTENSION_ID         │
│ Supabase: https://mpltdhgnmdcincgvkcav.supabase.co     │
│ Google OAuth: Redirect to ytrecall.online     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Changes: Local → Production

### 1. Web App Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://ytrecall.online` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://ytrecall.online` |
| `GOOGLE_CLIENT_ID` | ✅ Same | ✅ Same |
| `GOOGLE_CLIENT_SECRET` | ✅ Same | ✅ Same |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Same | ✅ Same |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Same | ✅ Same |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Same | ✅ Same |
| `YOUTUBE_API_KEY` | ✅ Same | ✅ Same |
| `NEXT_PUBLIC_CHROME_EXTENSION_ID` | Local ID | Production ID |

### 2. Chrome Extension Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `VITE_APP_URL` | `http://localhost:3000` | `https://ytrecall.online` |
| `VITE_SUPABASE_URL` | ✅ Same | ✅ Same |
| `VITE_SUPABASE_ANON_KEY` | ✅ Same | ✅ Same |

### 3. Google Cloud Console

| Setting | Local | Production |
|---------|-------|------------|
| **Authorized Redirect URIs** | | |
| Auth Callback | `http://localhost:3000/api/auth/callback` | `https://ytrecall.online/api/auth/callback` |
| YouTube Callback | `http://localhost:3000/api/youtube/callback` | `https://ytrecall.online/api/youtube/callback` |

**Action**: Add production URIs (keep local ones for development)

### 4. Supabase Dashboard

| Setting | Local | Production |
|---------|-------|------------|
| **Site URL** | `http://localhost:3000` | `https://ytrecall.online` |
| **Redirect URLs** | `http://localhost:3000/**` | `https://ytrecall.online/**` |
| **CORS Origins** | `http://localhost:3000` | `https://ytrecall.online` |

**Action**: Add production URLs (keep local ones for development)

---

## 📦 Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Prepare Code                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Ensure all code is working locally                       │
│ 2. Create .gitignore (exclude .env.local, node_modules)     │
│ 3. Commit to Git                                            │
│ 4. Push to GitHub                                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Deploy Web App to Vercel                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Import GitHub repo to Vercel                            │
│ 2. Set root directory: recall-react-app                    │
│ 3. Add environment variables                               │
│ 4. Deploy                                                   │
│ 5. Get production URL                                       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Update External Services                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Google Cloud Console:                                   │
│    → Add production OAuth redirect URIs                    │
│ 2. Supabase Dashboard:                                     │
│    → Add production URL to Site URL                        │
│    → Add production URL to Redirect URLs                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Test Production Web App                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Visit production URL                                    │
│ 2. Test Google OAuth login                                 │
│ 3. Test YouTube connection                                 │
│ 4. Test syncing videos                                     │
│ 5. Test all core features                                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Build Production Extension                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Update .env.local with production VITE_APP_URL          │
│ 2. Run: npm run build                                      │
│ 3. Test locally with production web app                   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Distribute Extension                               │
├─────────────────────────────────────────────────────────────┤
│ Option A: Manual (zip dist folder, share)                  │
│ Option B: Chrome Web Store (submit for review)             │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Final Testing                                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Install production extension                            │
│ 2. Test cookie authentication                              │
│ 3. Test all save methods                                   │
│ 4. Verify videos appear in web app                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### Cookie Piggyback Authentication

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User logs in to Web App                                   │
│    ↓                                                          │
│ 2. Supabase sets session cookie                              │
│    • Domain: .vercel.app (or your domain)                    │
│    • HttpOnly: true                                           │
│    • Secure: true (in production)                            │
│    • SameSite: Lax (or None for cross-origin)               │
│    ↓                                                          │
│ 3. Extension reads cookie from browser                       │
│    • chrome.cookies API                                      │
│    • Matches domain pattern                                  │
│    ↓                                                          │
│ 4. Extension includes cookie in API requests                 │
│    • Automatic via fetch()                                   │
│    • Credentials: 'include'                                  │
│    ↓                                                          │
│ 5. Web App validates session                                 │
│    • Supabase middleware checks cookie                       │
│    • Returns user data if valid                              │
└──────────────────────────────────────────────────────────────┘
```

### Important Cookie Considerations

**Same Domain (Recommended)**
- Web App: `app.yourdomain.com`
- Extension: Uses same domain for API calls
- Cookies work seamlessly ✅

**Cross-Origin (Requires Configuration)**
- Web App: `ytrecall.online`
- Extension: `chrome-extension://extension-id`
- Requires:
  - Supabase cookie `SameSite: None`
  - Supabase cookie `Secure: true`
  - CORS headers properly configured
  - May have browser compatibility issues ⚠️

---

## 📊 Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Core Database)                  │
│  ──────────────────────────────────────────────────────     │
│  Status: ✅ Already configured                               │
│  URL: https://mpltdhgnmdcincgvkcav.supabase.co             │
│  Action: Add production URL to allowed origins              │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Stores data
                            │
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD (OAuth & YouTube)                  │
│  ──────────────────────────────────────────────────────     │
│  Status: ✅ Already configured                               │
│  Client ID: 395221789012-cbrbl0cct6r0gaaga2082i9meueo9l3p   │
│  Action: Add production redirect URIs                       │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Authenticates
                            │
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Web Hosting)                      │
│  ──────────────────────────────────────────────────────     │
│  Status: ⬜ To be set up                                     │
│  Action: Deploy web app, set environment variables          │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Hosts
                            │
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB (Code Repository)                  │
│  ──────────────────────────────────────────────────────     │
│  Status: ⬜ To be set up                                     │
│  Action: Create repo, push code                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Critical URLs to Track

| Service | Type | URL | Where Used |
|---------|------|-----|------------|
| **Supabase** | Database | `https://mpltdhgnmdcincgvkcav.supabase.co` | Web App, Extension |
| **Vercel** | Web Host | `https://ytrecall.online` | Production Web App |
| **GitHub** | Code Repo | `https://github.com/username/repo` | Version Control |
| **Google OAuth** | Auth | `console.cloud.google.com` | OAuth Redirect URIs |
| **Extension** | Chrome | `chrome-extension://extension-id` | Extension ID |

---

## 🔄 Update Sequence

When deploying, update in this order:

```
1. Deploy Web App to Vercel
   ↓ (Get production URL)
   
2. Update Google Cloud Console
   ↓ (Add redirect URIs)
   
3. Update Supabase Dashboard
   ↓ (Add allowed origins)
   
4. Test Web App
   ↓ (Verify everything works)
   
5. Update Extension .env.local
   ↓ (Point to production URL)
   
6. Build Extension
   ↓ (Create production build)
   
7. Test Extension
   ↓ (Verify with production web app)
   
8. Distribute Extension
   ↓ (Manual or Chrome Web Store)
```

---

## 🚨 Common Pitfalls

### ❌ Pitfall 1: Wrong Root Directory in Vercel
**Problem**: Deploying from repo root instead of `recall-react-app`  
**Solution**: Set root directory to `recall-react-app` in Vercel settings

### ❌ Pitfall 2: Forgot to Update OAuth Redirect URIs
**Problem**: OAuth fails with "redirect_uri_mismatch" error  
**Solution**: Add production URLs to Google Cloud Console

### ❌ Pitfall 3: Extension Points to Localhost
**Problem**: Extension can't connect to web app in production  
**Solution**: Update `VITE_APP_URL` in extension `.env.local`

### ❌ Pitfall 4: Environment Variables Not Set
**Problem**: App crashes or features don't work  
**Solution**: Add all environment variables in Vercel dashboard

### ❌ Pitfall 5: Cookie Authentication Fails
**Problem**: Extension can't authenticate with web app  
**Solution**: Check Supabase cookie settings, CORS configuration

### ❌ Pitfall 6: Committed .env.local to Git
**Problem**: Secrets exposed in public repository  
**Solution**: Ensure `.env.local` is in `.gitignore`, remove from history

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Web app is accessible at production URL
- ✅ Users can sign in with Google
- ✅ Users can connect YouTube account
- ✅ Videos sync from YouTube
- ✅ Extension detects web app login
- ✅ Extension can save videos via all 3 methods
- ✅ Saved videos appear in web app immediately
- ✅ Auto-tagging works
- ✅ No console errors
- ✅ Mobile responsive

---

## 📈 Scaling Considerations

### Current Setup (Good for 100-1000 users)
- Vercel: Free tier (100GB bandwidth/month)
- Supabase: Free tier (500MB database, 2GB bandwidth)
- YouTube API: Free tier (10,000 quota units/day)

### When to Upgrade
- **Vercel**: When you exceed bandwidth or need custom domain
- **Supabase**: When database > 500MB or need more bandwidth
- **YouTube API**: When quota exceeded (upgrade in Google Cloud)

---

**Last Updated**: January 26, 2026
**Version**: 1.0.0
