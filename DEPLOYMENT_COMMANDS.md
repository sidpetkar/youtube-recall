# 🖥️ Deployment Commands - Copy & Paste Guide

This document contains all the exact commands you need to run for deployment.

---

## 📁 STEP 1: Git Repository Setup

### 1.1 Navigate to Project Root

```powershell
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"
```

### 1.2 Create Root .gitignore

Create file: `.gitignore` at project root with this content:

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

# Chrome extension
recall-chrome-ext/dist/

# Misc
*.pem
.cache/
```

### 1.3 Initialize Git and Commit

```powershell
# Initialize git repository
git init

# Check status (verify .env.local files are NOT listed)
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Recall YouTube Organizer with web app and Chrome extension"
```

### 1.4 Create GitHub Repository

**Via GitHub Web Interface:**
1. Go to https://github.com/new
2. Repository name: `recall-youtube-organiser`
3. Description: "YouTube video organizer with web app and Chrome extension"
4. Visibility: Public or Private (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 1.5 Push to GitHub

```powershell
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/recall-youtube-organiser.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify**: Go to your GitHub repository URL and confirm files are there

---

## ☁️ STEP 2: Deploy to Vercel

### 2.1 Via Vercel Web Interface

**Cannot be done via command line for first deployment. Follow these steps:**

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your repository: `recall-youtube-organiser`
5. Click **"Import"**

### 2.2 Configure Project Settings

**CRITICAL**: Set these before deploying:

- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: Click "Edit" → Enter `recall-react-app` → Save
- **Build Command**: `npm run build` (default, leave as is)
- **Output Directory**: `.next` (default, leave as is)
- **Install Command**: `npm install` (default, leave as is)

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add these one by one:

```bash
# Variable Name: GOOGLE_CLIENT_ID
# Value: (get from your .env.local file)
your_google_client_id.apps.googleusercontent.com

# Variable Name: GOOGLE_CLIENT_SECRET
# Value: (get from your .env.local file)
GOCSPX-your_google_client_secret

# Variable Name: NEXTAUTH_URL
# Value: (WAIT - you'll update this after deployment)
https://your-app-name.vercel.app

# Variable Name: NEXT_PUBLIC_APP_URL
# Value: (WAIT - you'll update this after deployment)
https://your-app-name.vercel.app

# Variable Name: NEXT_PUBLIC_SUPABASE_URL
# Value: (get from your .env.local file)
https://your-project-id.supabase.co

# Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
# Value: (get from your .env.local file)
your_supabase_anon_key

# Variable Name: SUPABASE_SERVICE_ROLE_KEY
# Value: (get from your .env.local file)
your_supabase_service_role_key

# Variable Name: YOUTUBE_API_KEY
# Value: (get from your .env.local file)
your_youtube_api_key

# Variable Name: NEXT_PUBLIC_CHROME_EXTENSION_ID
# Value: (leave empty for now)

```

**Important**: Apply to **Production**, **Preview**, and **Development** environments

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. **IMPORTANT**: Copy your production URL (e.g., `https://recall-youtube-organiser.vercel.app`)

### 2.5 Update Environment Variables with Actual URL

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL`:
   - Delete old value
   - Enter your actual Vercel URL: `https://your-actual-app-name.vercel.app`
   - Save
3. Edit `NEXT_PUBLIC_APP_URL`:
   - Delete old value
   - Enter your actual Vercel URL: `https://your-actual-app-name.vercel.app`
   - Save
4. Go to **Deployments** tab
5. Click **"Redeploy"** on the latest deployment

---

## 🔧 STEP 3: Update Google Cloud Console

### 3.1 Add Production Redirect URIs

**Via Web Interface:**

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (starts with `395221789012-`)
3. Click on it to edit
4. Scroll to **"Authorized redirect URIs"**
5. Click **"+ ADD URI"** and add:
   ```
   https://your-actual-app-name.vercel.app/api/auth/callback
   ```
6. Click **"+ ADD URI"** again and add:
   ```
   https://your-actual-app-name.vercel.app/api/youtube/callback
   ```
7. Keep existing localhost URIs:
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/api/youtube/callback
   ```
8. Click **"Save"**

---

## 🗄️ STEP 4: Update Supabase Configuration

### 4.1 Add Production URL

**Via Supabase Dashboard:**

1. Go to https://supabase.com/dashboard
2. Select project: `mpltdhgnmdcincgvkcav`
3. Click **Settings** (gear icon in sidebar)
4. Click **API**
5. Scroll to **"URL Configuration"**
6. Under **"Site URL"**, change to:
   ```
   https://your-actual-app-name.vercel.app
   ```
7. Under **"Redirect URLs"**, add:
   ```
   https://your-actual-app-name.vercel.app/**
   ```
   Keep existing:
   ```
   http://localhost:3000/**
   ```
8. Click **"Save"**

### 4.2 Verify CORS Settings

1. Still in **Settings** → **API**
2. Scroll to **"CORS"**
3. Ensure allowed origins include:
   ```
   *
   ```
   Or specifically:
   ```
   https://your-actual-app-name.vercel.app
   http://localhost:3000
   ```

---

## 🧪 STEP 5: Test Production Web App

### 5.1 Open Production URL

```powershell
# Open in browser (replace with your actual URL)
start https://your-actual-app-name.vercel.app
```

### 5.2 Test Checklist

Manually test these:
- [ ] Page loads without errors
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow
- [ ] Redirected back and logged in
- [ ] Click "Connect YouTube"
- [ ] Authorize YouTube access
- [ ] Click "Sync Liked Videos"
- [ ] Videos appear in the app
- [ ] Create a test folder
- [ ] Move a video to the folder

**If any test fails, check Vercel logs:**
1. Go to Vercel project → **Deployments**
2. Click on latest deployment
3. Click **"View Function Logs"**

---

## 🧩 STEP 6: Build Production Chrome Extension

### 6.1 Update Extension Environment Variables

```powershell
# Navigate to extension folder
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext"

# Open .env.local in notepad
notepad .env.local
```

**Update the file to:**

```bash
# Supabase credentials (get from your recall-chrome-ext/.env.local file)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# UPDATE THIS LINE with your production URL:
VITE_APP_URL=https://your-actual-app-name.vercel.app
```

**Save and close**

### 6.2 Build Extension

```powershell
# Make sure you're in recall-chrome-ext folder
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext"

# Install dependencies (if not already done)
npm install

# Build production extension
npm run build
```

**Verify**: Check that `dist` folder was created with files inside

### 6.3 Load Extension in Chrome

**Via Chrome Browser:**

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Navigate to: `c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext\dist`
6. Click **"Select Folder"**
7. Extension should appear in the list

### 6.4 Get Extension ID

1. In `chrome://extensions/`, find your extension
2. Look for **"ID:"** under the extension name
3. Copy the ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. Save it for later

---

## 🧪 STEP 7: Test Production Extension

### 7.1 Test Authentication

1. Make sure you're logged in to production web app
2. Go to any YouTube video (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Click extension icon in Chrome toolbar
4. Should show your folders (not login prompt)

### 7.2 Test Save Methods

**Method 1: Context Menu**
1. Right-click on YouTube page
2. Click **"Save to Recall"**
3. Select a folder
4. Should show success notification

**Method 2: Floating Button**
1. Look for floating "Save" button in bottom-right
2. Click it
3. Select a folder
4. Should show success notification

**Method 3: Extension Popup**
1. Click extension icon in toolbar
2. Select a folder
3. Click "Save"
4. Should show success notification

### 7.3 Verify in Web App

1. Go back to production web app
2. Navigate to the folder you saved to
3. Video should appear there

---

## 📦 STEP 8: Package Extension for Distribution

### Option A: Manual Distribution (Quick)

```powershell
# Navigate to extension folder
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext"

# Create zip file
Compress-Archive -Path dist\* -DestinationPath recall-extension-v1.0.0.zip -Force

# Zip file created: recall-extension-v1.0.0.zip
```

**Share this zip file with users**

Users can install by:
1. Unzip the file
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the unzipped folder

### Option B: Chrome Web Store (Public)

**Cannot be done via command line. Follow these steps:**

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time registration fee (if not already done)
3. Click **"New Item"**
4. Upload `recall-extension-v1.0.0.zip`
5. Fill in store listing:
   - **Name**: Recall - YouTube Video Organizer
   - **Summary**: Save and organize YouTube videos with one click
   - **Description**: (Write detailed description)
   - **Category**: Productivity
   - **Language**: English
6. Upload screenshots (take 3-5 screenshots of extension in action)
7. Upload icon: `recall-chrome-ext\assets\icons\icon-128.png`
8. Set pricing: Free
9. Click **"Submit for review"**
10. Wait 1-3 business days for approval

---

## 🔄 STEP 9: Update Extension ID in Web App (Optional)

If you want web app to know about the extension:

### 9.1 Via Vercel Dashboard

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_CHROME_EXTENSION_ID`
3. Click **"Edit"**
4. Enter your extension ID (from Step 6.4)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on latest deployment

---

## 🎯 STEP 10: Future Updates

### Update Web App

```powershell
# Navigate to project root
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"

# Make your changes to files in recall-react-app/

# Commit changes
git add .
git commit -m "Description of your changes"
git push origin main

# Vercel automatically deploys on push to main
```

### Update Extension

```powershell
# Navigate to extension folder
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext"

# Make your changes

# Update version in manifest.json
notepad manifest.json
# Change "version": "1.0.0" to "1.0.1" (or next version)

# Rebuild
npm run build

# For manual distribution:
Compress-Archive -Path dist\* -DestinationPath recall-extension-v1.0.1.zip -Force

# For Chrome Web Store:
# Upload new version in developer dashboard
```

---

## 🆘 Troubleshooting Commands

### Check Git Status

```powershell
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"
git status
```

### Check if .env.local is Ignored

```powershell
git check-ignore recall-react-app\.env.local
git check-ignore recall-chrome-ext\.env.local
# Should output the file paths (meaning they're ignored)
```

### View Git Remote

```powershell
git remote -v
```

### Check Node/NPM Version

```powershell
node --version
npm --version
```

### Clear NPM Cache (if build issues)

```powershell
npm cache clean --force
```

### Rebuild Extension from Scratch

```powershell
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser\recall-chrome-ext"
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
npm install
npm run build
```

### View Vercel Deployment Logs (via CLI)

```powershell
# Install Vercel CLI (one-time)
npm install -g vercel

# Login
vercel login

# View logs
vercel logs
```

---

## 📋 Quick Reference: All URLs

**Replace these with your actual values:**

```
GitHub Repository:
https://github.com/YOUR_USERNAME/recall-youtube-organiser

Production Web App:
https://your-actual-app-name.vercel.app

Vercel Dashboard:
https://vercel.com/your-username/recall-youtube-organiser

Google Cloud Console:
https://console.cloud.google.com/apis/credentials

Supabase Dashboard:
https://supabase.com/dashboard/project/mpltdhgnmdcincgvkcav

Chrome Extensions:
chrome://extensions/

Chrome Web Store Developer:
https://chrome.google.com/webstore/devconsole
```

---

## ✅ Final Verification Commands

```powershell
# 1. Verify Git repository
cd "c:\Sid\Siddhant\AI Coding\recall-youtube-organiser"
git log --oneline -5

# 2. Verify extension build
cd recall-chrome-ext
Test-Path dist\manifest.json
# Should output: True

# 3. Verify web app files
cd ..\recall-react-app
Test-Path package.json
# Should output: True

# 4. Check environment files are NOT committed
cd ..
git ls-files | Select-String ".env.local"
# Should output: (nothing)
```

---

**Last Updated**: January 26, 2026
**Version**: 1.0.0

**Note**: This guide uses PowerShell commands for Windows. If you're on Mac/Linux, use equivalent bash commands.
