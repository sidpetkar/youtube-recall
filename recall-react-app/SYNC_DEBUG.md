# Debugging: Liked videos not showing after Sync

When you click **Sync Videos** and liked videos don’t appear in the carousel or Liked page, use the sync toast and this guide to narrow it down.

## 1. Check the toast after clicking "Sync Videos"

After sync, the toast will show one of these:

- **"Fetched 0 from YouTube"**  
  YouTube didn’t return any liked videos.  
  → Go to [2. Fetched 0 from YouTube](#2-fetched-0-from-youtube).

- **"Fetched N from YouTube. M already in library. K new added."**  
  YouTube returned videos; K new ones were inserted.  
  → If K is 0 but you just liked a video, go to [3. No new videos added](#3-no-new-videos-added).

- **"Sync failed" + YouTube error message**  
  The YouTube API call failed (token, scope, or network).  
  → Go to [4. Sync failed with YouTube error](#4-sync-failed-with-youtube-error).

---

## 2. Fetched 0 from YouTube

Possible causes:

1. **Different Google account**  
   The account you use to **like videos on YouTube** is not the one you used to **Connect YouTube** in the app.  
   - Fix: In the app, go to **Settings** (or the place where you connect YouTube), disconnect YouTube, then connect again and choose the **same** Google account you use on YouTube.

2. **No liked videos**  
   The connected account has no liked videos.  
   - Check: Open YouTube in an incognito window, sign in with that account, and check the Liked playlist.

3. **YouTube API / token issue**  
   Token expired, revoked, or scope missing.  
   - Fix: Disconnect YouTube in the app and connect again (re-authorize).  
   - Check **Vercel** (or your server) logs for errors right after you click Sync (e.g. `[YouTube] getLikedVideos failed` or `YouTube API error`).

---

## 3. No new videos added (Fetched N, M already in library, 0 new)

- **New like is in the first N**  
  If the video you just liked is in the “N” returned by YouTube but “0 new” was added, it’s already in the DB (e.g. added via the extension). It should appear on the **Liked Videos** page and in the carousel. Try refreshing; if it still doesn’t show, there may be a display/filter bug.

- **New like is beyond the first 250**  
  We only fetch up to 250 most recently liked videos. If your new like is older than that, it won’t be in this sync.  
  - Workaround: Add that video to a folder via the extension so it appears in the app.

---

## 4. Sync failed with YouTube error

- **Reconnect YouTube**  
  In the app, disconnect YouTube and connect again with the **same** Google account you use to like videos.

- **Check server logs**  
  In Vercel (or your host), open the logs for the request that runs when you click Sync. Look for:
  - `[YouTube] getLikedVideos failed:` + error message
  - `YouTube API error in getLikedVideos:` + message  

  Common errors:
  - **401 / Invalid credentials** → Token expired or revoked; reconnect YouTube.
  - **403 / Forbidden** → Scope or quota; ensure the app requests YouTube read scope and that the project has the YouTube Data API enabled and quota.

---

## 5. Video shows when added via extension but not when only liked

That usually means:

- **Sync path**: Sync uses the **YouTube “Liked” playlist** (playlist ID `LL`) for the **connected** Google account. If the account that liked the video is different from the one connected in the app, sync will never see that like.
- **Extension path**: The extension saves the **current page** to a folder; it doesn’t depend on the Liked playlist. So the same video can appear when “Save to folder” is used but not when you only like it and sync.

**Action:** Reconnect YouTube in the app with the **exact** Google account you use to like videos on YouTube, then click Sync again and check the new toast message.

---

## Quick checklist

- [ ] Connect YouTube in the app with the **same** Google account you use to like videos on YouTube.
- [ ] After changing account, click **Sync Videos** and read the toast (Fetched N / M already / K new, or error).
- [ ] If “Fetched 0”, disconnect and reconnect YouTube, then sync again.
- [ ] Check server logs for `[YouTube]` or `YouTube API error` when sync runs.
