# Extension Deployment Checklist

## Extension ID
**Your Chrome Extension ID:** `eobgacfijiamdpjbnknaeoegmngceghk`

## Vercel Environment Variable Setup

### Required: Add Extension ID to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `youtube-recall` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Key:** `NEXT_PUBLIC_CHROME_EXTENSION_ID`
   - **Value:** `eobgacfijiamdpjbnknaeoegmngceghk`
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**
6. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

## Git Push (if needed)

If you need to push code changes manually:

```bash
# Remove git lock if it exists
rm .git/index.lock

# Add and commit changes
git add .
git commit -m "Fix extension auth sync and production URLs"

# Push to trigger Vercel deployment
git push origin main
```

## Testing After Deployment

1. **Reload Chrome Extension:**
   - Go to `chrome://extensions/`
   - Find "Recall - YouTube Video Organizer"
   - Click the refresh icon

2. **Test Auth Sync:**
   - Go to `https://youtube-recall.vercel.app/auth`
   - Sign in with Google
   - You should see "Extension Status" and "Sync to Extension" button
   - Click "Sync to Extension"
   - Should show "Synced successfully!"

3. **Test Extension:**
   - Go to any YouTube video
   - Click the extension icon or floating "Save" button
   - Should show your folders (not redirect to auth page)

## Troubleshooting

### Extension still shows "Sign In"
- Check browser console for errors (F12)
- Verify extension ID in Vercel matches: `eobgacfijiamdpjbnknaeoegmngceghk`
- Make sure you clicked "Sync to Extension" after logging in
- Reload the extension after syncing

### Extension Status shows "Extension not found"
- Verify the extension ID in Vercel is exactly: `eobgacfijiamdpjbnknaeoegmngceghk`
- No quotes, no spaces, no extra characters
- Make sure extension is loaded in Chrome (`chrome://extensions/`)

### Build Errors (Dynamic Server Usage)
- These are warnings, not errors
- The app should still work
- If you want to fix them, add `export const dynamic = 'force-dynamic'` to API routes

## Files Changed

### Extension (`recall-chrome-ext/`)
- ✅ Updated all URLs from localhost to production
- ✅ Added new gradient bookmark icon
- ✅ Fixed auth sync to accept production origin
- ✅ Updated manifest.json with production URL

### Web App (`recall-react-app/`)
- ✅ Added extension sync debugging UI to auth page
- ✅ Updated .env.local.example with extension ID variable
