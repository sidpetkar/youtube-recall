# Testing Guide for YouTube Knowledge Manager

## Pre-requisites Checklist

Before testing, ensure you've completed the following:

- [x] Supabase project created
- [x] Environment variables in `.env.local` are configured
- [ ] **SQL Migration executed** in Supabase SQL Editor
- [ ] Google OAuth configured in Supabase dashboard
- [ ] Google Cloud Console has Supabase callback URL

## Step 1: Run the SQL Migration

**This is CRITICAL - the app won't work without the database tables!**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `youtube-knowledge-manager`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Open the file: `supabase/migrations/001_initial_schema.sql`
6. Copy the entire SQL script
7. Paste it into the Supabase SQL Editor
8. Click **"Run"** button
9. You should see: `Success. No rows returned`

### Verify Migration

Go to **Table Editor** and verify these tables exist:
- ✅ profiles
- ✅ folders
- ✅ videos
- ✅ tags
- ✅ video_tags

## Step 2: Configure Supabase Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. Enter your Google OAuth credentials:
   - Client ID: (from `.env.local`)
   - Client Secret: (from `.env.local`)
4. Click **Save**

## Step 3: Update Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://mpltdhgnmdcincgvkcav.supabase.co/auth/v1/callback
   http://localhost:3000/api/auth/callback
   http://localhost:3000/api/youtube/callback
   ```
4. Click **Save**

## Step 4: Start the Development Server

```bash
npm run dev
```

The app should start at http://localhost:3000

## Testing Flow

### Test 1: Sign In with Google (Supabase Auth)

1. Open http://localhost:3000
2. Click **"Sign in with Google"** button in header
3. Select your Google account
4. Grant permissions
5. You should be redirected back to the app
6. Your avatar and name should appear in the header

**Expected Result:**
- ✅ User is signed in
- ✅ Profile created in `profiles` table
- ✅ Default "Inbox" folder auto-created

**Verify in Supabase:**
- Go to **Table Editor** → **profiles** → You should see your profile
- Go to **Table Editor** → **folders** → You should see "Inbox" folder

### Test 2: Connect YouTube Account

1. While signed in, click **"Let's connect Youtube"** button
2. Grant YouTube read permissions
3. You should be redirected back with success message

**Expected Result:**
- ✅ YouTube tokens stored in your profile
- ✅ `youtube_connected_at` timestamp set

**Verify in Supabase:**
- Go to **Table Editor** → **profiles**
- Your profile should have `youtube_access_token` and `youtube_refresh_token`

### Test 3: Manual Sync Videos

1. After connecting YouTube, click **"Sync Videos"** button in header
2. Wait for sync to complete (spinner will show)
3. You should see a toast notification with count of new videos

**Expected Result:**
- ✅ Videos imported from YouTube
- ✅ Videos saved to "Inbox" folder
- ✅ Auto-tags applied based on video titles
- ✅ Videos displayed in grid

**Verify in Supabase:**
- Go to **Table Editor** → **videos** → See your imported videos
- Go to **Table Editor** → **tags** → See auto-generated tags
- Go to **Table Editor** → **video_tags** → See video-tag relationships

### Test 4: Auto-Tagging

Check which tags were automatically applied:

**Tag Rules:**
- Videos with "React", "JavaScript", "TypeScript" → "Dev" tag
- Videos with "Tutorial", "Guide", "How to" → "Tutorial" tag
- Videos with "Music", "Song" → "Music" tag
- Videos with "Gaming", "Gameplay" → "Gaming" tag

**Expected Result:**
- ✅ Videos have relevant tags based on title keywords

### Test 5: Folder Management

1. In the sidebar, you should see **"Folders"** section
2. Click the **"+"** button next to "Folders"
3. Create a new folder: "Dev Tutorials"
4. Click **Create**

**Expected Result:**
- ✅ New folder appears in sidebar
- ✅ Shows video count (0 initially)

**Verify in Supabase:**
- Go to **Table Editor** → **folders**
- See your new folder with correct `position_index`

### Test 6: Filter Videos by Folder

1. Click on "Inbox" folder in sidebar
2. Only videos in Inbox should display
3. Click on your custom folder
4. Should show "No videos yet"

**Expected Result:**
- ✅ Video list updates based on selected folder
- ✅ Title shows "Folder Videos"
- ✅ Video count updates

### Test 7: Automatic Sync on Login

1. Sign out from the app
2. Sign back in with Google
3. Wait 5-10 seconds
4. Auto-sync should trigger in background (check console logs)

**Expected Result:**
- ✅ Auto-sync runs if last sync > 1 hour ago
- ✅ Console shows "Auto-syncing videos..."
- ✅ No toast notification (silent background sync)

### Test 8: Periodic Background Sync

1. Keep the app open for 30+ minutes (or reduce interval in code for testing)
2. Auto-sync should trigger periodically
3. Only runs when tab is visible

**Expected Result:**
- ✅ Background sync every 30 minutes
- ✅ Only when document is visible
- ✅ Toast notification shows new video count

### Test 9: Row Level Security (RLS)

To verify RLS is working:

1. Create another Google account
2. Sign in with the second account
3. You should NOT see videos from the first account

**Expected Result:**
- ✅ Users can only see their own data
- ✅ No data leakage between users

### Test 10: React Query DevTools

1. Look for React Query DevTools icon in bottom-left corner
2. Click to open
3. Explore queries and mutations

**Expected Result:**
- ✅ See "videos" and "folders" queries
- ✅ Check query cache and status
- ✅ Useful for debugging

## Common Issues & Solutions

### Issue: Tables don't exist
**Solution:** Run the SQL migration script in Supabase SQL Editor

### Issue: "YouTube not connected" error
**Solution:** 
1. Check YouTube OAuth callback route stored tokens
2. Verify tokens in `profiles` table in Supabase
3. Re-connect YouTube account

### Issue: Videos not syncing
**Solution:**
1. Check browser console for errors
2. Verify YouTube API quota in Google Cloud Console
3. Check Supabase logs in dashboard
4. Ensure YouTube tokens are valid

### Issue: Auto-sync not working
**Solution:**
1. Check `last_sync_at` in profiles table
2. Ensure interval has passed (60 minutes)
3. Check browser console for auto-sync logs

### Issue: RLS policy errors
**Solution:**
1. Verify you're signed in (check Supabase Auth)
2. Check that user ID matches profile ID
3. Review RLS policies in Supabase dashboard

### Issue: Build errors
**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

## Testing Checklist

Use this checklist to ensure everything works:

- [ ] Sign in with Google (Supabase Auth)
- [ ] Profile created in database
- [ ] Default "Inbox" folder created
- [ ] Connect YouTube account
- [ ] YouTube tokens stored in profile
- [ ] Manual sync videos works
- [ ] Videos imported to Inbox
- [ ] Auto-tags applied correctly
- [ ] Create new folder works
- [ ] Filter videos by folder
- [ ] Video count updates in sidebar
- [ ] Auto-sync on login (if > 1 hour since last sync)
- [ ] Periodic background sync (30 min intervals)
- [ ] RLS prevents seeing other users' data
- [ ] React Query caching works
- [ ] Sign out works
- [ ] Sign back in works

## Performance Testing

### Database Queries
1. Check query performance in Supabase dashboard
2. Queries should use indexes efficiently
3. Video fetch should be < 500ms

### React Query Caching
1. Navigate between folders
2. Cached data should load instantly
3. Fresh data fetched in background

### Auto-sync Performance
1. Auto-sync should not block UI
2. Runs in background without interrupting user
3. Handles errors gracefully

## Next Steps After Testing

Once everything works:

1. **Deploy to Production:**
   - Set up Vercel/Netlify deployment
   - Add production URL to Supabase and Google OAuth

2. **Optional Enhancements:**
   - Add drag-drop to move videos between folders
   - Implement video search
   - Add custom tag colors
   - Export videos to CSV
   - Share folders publicly

3. **Monitor:**
   - Check Supabase dashboard for usage
   - Monitor YouTube API quota
   - Review error logs

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables
4. Review this testing guide

Happy testing! 🚀
