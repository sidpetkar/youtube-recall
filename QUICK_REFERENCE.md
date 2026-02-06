# ⚡ Quick Reference Card

## 🎯 Your Current Setup

```
✅ Web App: recall-react-app/ (Next.js)
✅ Extension: recall-chrome-ext/ (Chrome Extension)
✅ Supabase: https://mpltdhgnmdcincgvkcav.supabase.co
✅ Google OAuth: Client ID configured
✅ Local Development: Working
```

---

## 📝 Deployment Steps (One-Page)

### 1️⃣ Git Setup (5 min)
```powershell
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"
git init
git add .
git commit -m "Initial commit"
```
Create repo on GitHub, then:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/recall-youtube-organiser.git
git push -u origin main
```

### 2️⃣ Vercel Deploy (10 min)
**Via https://vercel.com:**
- Import GitHub repo
- **Root Directory**: `recall-react-app` ⚠️
- Add environment variables (see below)
- Deploy
- **Copy production URL**

### 3️⃣ Update Google OAuth (3 min)
**Via https://console.cloud.google.com/apis/credentials:**
- Edit OAuth Client ID
- Add redirect URIs:
  - `https://recallmeapp.xyz/api/auth/callback`
  - `https://recallmeapp.xyz/api/youtube/callback`
- Save

### 4️⃣ Update Supabase (3 min)
**Via https://supabase.com/dashboard:**
- Settings → API → URL Configuration
- Site URL: `https://recallmeapp.xyz`
- Redirect URLs: `https://recallmeapp.xyz/**`
- Save

### 5️⃣ Test Web App (5 min)
- Visit production URL
- Sign in with Google
- Connect YouTube
- Sync videos

### 6️⃣ Build Extension (5 min)
```powershell
cd recall-chrome-ext
# Edit .env.local: Set VITE_APP_URL=https://recallmeapp.xyz
npm run build
```
Load in Chrome: `chrome://extensions/` → Load unpacked → Select `dist/`

### 7️⃣ Test Extension (5 min)
- Go to YouTube video
- Test context menu, floating button, popup
- Verify videos appear in web app

---

## 🔑 Environment Variables

### Vercel (Web App)
```bash
# Copy values from your local recall-react-app/.env.local file
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
NEXTAUTH_URL=https://recallmeapp.xyz
NEXT_PUBLIC_APP_URL=https://recallmeapp.xyz
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_CHROME_EXTENSION_ID=(optional)
```

### Extension (.env.local)
```bash
# Copy values from your local recall-chrome-ext/.env.local file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://recallmeapp.xyz
```

---

## ⚠️ Critical Checklist

- [ ] Root directory in Vercel: `recall-react-app`
- [ ] All environment variables added in Vercel
- [ ] Production URLs added to Google OAuth
- [ ] Production URL added to Supabase
- [ ] Extension `.env.local` updated with production URL
- [ ] `.env.local` files NOT committed to Git

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| **Vercel Dashboard** | https://vercel.com |
| **GitHub** | https://github.com |
| **Google Cloud Console** | https://console.cloud.google.com/apis/credentials |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/mpltdhgnmdcincgvkcav |
| **Chrome Extensions** | chrome://extensions/ |

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Vercel build fails | Check root directory is `recall-react-app` |
| OAuth error | Add production URLs to Google Cloud Console |
| Extension can't connect | Update `VITE_APP_URL` in extension `.env.local` |
| Videos won't sync | Check YouTube API quota, reconnect YouTube |

---

## 📚 Full Documentation

- **DEPLOYMENT_SUMMARY.md** - Overview & roadmap
- **DEPLOYMENT_GUIDE.md** - Detailed step-by-step guide
- **DEPLOYMENT_COMMANDS.md** - Copy-paste commands
- **DEPLOYMENT_CHECKLIST.md** - Progress tracker
- **ARCHITECTURE_DEPLOYMENT.md** - Visual diagrams

---

## ✅ Success Criteria

**Web App:**
- [ ] Accessible at production URL
- [ ] Google login works
- [ ] YouTube connection works
- [ ] Videos sync successfully

**Extension:**
- [ ] Loads in Chrome
- [ ] Detects web app login
- [ ] Saves videos (3 methods)
- [ ] Videos appear in web app

---

## 🚀 Next Steps After Deployment

1. **Test thoroughly** with real users
2. **Monitor** Vercel analytics and logs
3. **Gather feedback** and iterate
4. **Consider** publishing extension to Chrome Web Store
5. **Add custom domain** (optional)

---

**Total Time**: ~40 minutes (excluding Chrome Web Store review)

**Last Updated**: January 26, 2026
