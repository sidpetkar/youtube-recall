# 🚀 Vercel Deployment - Step by Step

## ✅ Git Push Complete!

Your code is now on GitHub: https://github.com/sidpetkar/youtube-recall

---

## 📝 Next: Deploy to Vercel

### Step 1: Go to Vercel

1. Open https://vercel.com in your browser
2. Sign in (or sign up if needed - use GitHub account for easy integration)

### Step 2: Import Project

1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see "Import Git Repository"
4. Find **"sidpetkar/youtube-recall"** in the list
5. Click **"Import"**

### Step 3: Configure Build Settings

⚠️ **CRITICAL**: Before deploying, configure these settings:

#### Root Directory
- Click **"Edit"** next to "Root Directory"
- Enter: `recall-react-app`
- Click **"Continue"**

#### Framework Preset
- Should auto-detect as **"Next.js"**
- If not, select it from dropdown

#### Build & Development Settings
- Leave as defaults:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"** section and add these **ONE BY ONE**:

#### Variable 1: GOOGLE_CLIENT_ID
```
Name: GOOGLE_CLIENT_ID
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 2: GOOGLE_CLIENT_SECRET
```
Name: GOOGLE_CLIENT_SECRET
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 3: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://ytrecall.online
(or your custom domain / Vercel URL - update after adding domain in Vercel)
```

#### Variable 4: NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://ytrecall.online
(same as NEXTAUTH_URL)
```

#### Variable 5: NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 6: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 7: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 8: YOUTUBE_API_KEY
```
Name: YOUTUBE_API_KEY
Value: (copy from your recall-react-app/.env.local file)
```

#### Variable 9: NEXT_PUBLIC_CHROME_EXTENSION_ID
```
Name: NEXT_PUBLIC_CHROME_EXTENSION_ID
Value: (leave empty for now)
```

**Apply to**: Production, Preview, and Development

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. You'll see a success screen with your URL

### Step 6: Copy Your Production URL

Your app will be at your custom domain or Vercel URL, e.g.:
- `https://ytrecall.online`
- or `https://your-project.vercel.app`

**Copy this URL** - you'll need it for the next steps!

### Step 7: Update Environment Variables with Real URL

1. Go to your Vercel project
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Find `NEXTAUTH_URL` and click **"Edit"**
5. Update value to your actual Vercel URL
6. Find `NEXT_PUBLIC_APP_URL` and click **"Edit"**
7. Update value to your actual Vercel URL
8. Click **"Save"**

### Step 8: Redeploy

1. Go to **"Deployments"** tab
2. Click the three dots (...) on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment to complete

---

## 🔧 Next Steps After Vercel Deployment

### 1. Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID
2. Click **"Edit"**
3. Add these to **"Authorized redirect URIs"**:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/auth/callback
   https://YOUR-VERCEL-URL.vercel.app/api/youtube/callback
   ```
4. Click **"Save"**

### 2. Update Supabase Dashboard

Go to: https://supabase.com/dashboard/project/mpltdhgnmdcincgvkcav

1. Click **"Settings"** (gear icon)
2. Click **"API"**
3. Scroll to **"URL Configuration"**
4. Update **"Site URL"** to: `https://YOUR-VERCEL-URL.vercel.app`
5. Add to **"Redirect URLs"**: `https://YOUR-VERCEL-URL.vercel.app/**`
6. Click **"Save"**

### 3. Test Your Production App

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Connect YouTube
5. Sync videos
6. Test all features

---

## 🎯 Your Credentials (Quick Reference)

Open your local `.env.local` files to copy these values:

### From `recall-react-app/.env.local`:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- YOUTUBE_API_KEY

---

## ✅ Success Checklist

- [ ] Vercel project created
- [ ] Root directory set to `recall-react-app`
- [ ] All 9 environment variables added
- [ ] Deployment successful
- [ ] Production URL copied
- [ ] Environment variables updated with real URL
- [ ] Redeployed
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase URLs updated
- [ ] Production app tested and working

---

## 🆘 If Deployment Fails

### Check Vercel Logs
1. Go to your deployment in Vercel
2. Click on the failed deployment
3. Click **"View Function Logs"**
4. Look for error messages

### Common Issues

**Build fails with "Cannot find module"**
- Check that root directory is set to `recall-react-app`

**Environment variable errors**
- Verify all variables are set correctly
- Check for typos in variable names

**OAuth errors after deployment**
- Update Google Cloud Console redirect URIs
- Update Supabase allowed URLs

---

**Ready to deploy? Let's go! 🚀**

**Your GitHub Repo**: https://github.com/sidpetkar/youtube-recall
**Next**: Go to https://vercel.com and follow the steps above!
