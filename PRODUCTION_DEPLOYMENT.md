# Production Deployment Guide

## Part 1: Push Web App to Git (triggers Vercel)

From the **repo root** (`recall-youtube-organiser`):

```bash
# Ensure you're on main (or your production branch)
git status
git add .
git commit -m "Production: web app updates, favicons, auth/terms styling, extension fixes"
git push origin main
```

Vercel will auto-deploy when it sees the push. Check the Vercel dashboard for build status.

---

## Part 2: Vercel Environment Variables (don’t break prod)

Set these in **Vercel** → your project → **Settings** → **Environment Variables**. Use **Production** (and Preview/Development if you want).

| Variable | Production value | Notes |
|----------|------------------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://www.recallmeapp.xyz` | Or `https://recallmeapp.xyz` if that’s your canonical URL |
| `NEXTAUTH_URL` | Same as `NEXT_PUBLIC_APP_URL` | Must match or OAuth redirects break |
| `NEXT_PUBLIC_CHROME_EXTENSION_ID` | **Chrome Web Store extension ID** | See Part 4 – set **after** first publish or when updating |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Same as dev if same project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Same as dev if same project |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Server-only, keep secret |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret | Keep secret |
| `YOUTUBE_API_KEY` | (optional) YouTube Data API key | If you use it |

**Critical for extension sync**

- `NEXT_PUBLIC_CHROME_EXTENSION_ID` must be the **exact** ID of the extension users install from the Chrome Web Store (see Part 4).
- After you publish or update the extension, copy the store extension ID and set/update this in Vercel, then **redeploy** so the auth/sync page uses the correct ID.

---

## Part 3: Publish / Update Extension on Chrome Web Store

### One-time: Developer account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with a Google account and pay the **one-time $5 developer registration** if you haven’t already.

### Build the extension (production)

From the **repo root**:

```bash
cd recall-chrome-ext
npm ci
npm run build
```

Ensure the build uses **production** values:

- **VITE_APP_URL** must be your production web app URL (e.g. `https://www.recallmeapp.xyz` or `https://recallmeapp.xyz`).
- Set via `.env.local` in `recall-chrome-ext/` (not committed). Example:

```bash
# recall-chrome-ext/.env.local (do not commit)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://www.recallmeapp.xyz
```

Then run `npm run build` again. The built extension is in `recall-chrome-ext/dist/`.

### First-time publish (new item)

1. In [Developer Dashboard](https://chrome.google.com/webstore/devconsole), click **“New item”**.
2. Upload a **ZIP** of the **contents** of `recall-chrome-ext/dist/` (not the `dist` folder itself):
   - Zip the **contents** of `dist/` (e.g. `manifest.json`, `src/`, `assets/`, etc. at the root of the zip).
3. Fill in:
   - **Description**, **Category** (e.g. Productivity), **Language**.
   - **Screenshots** (required): at least one; use 1280x800 or 640x400.
   - **Small tile**: 440x280 px (optional but recommended).
   - **Privacy**: link to your privacy policy (e.g. `https://www.recallmeapp.xyz/privacy`).
   - **Single purpose**: describe that the extension saves YouTube videos to Recall folders.
4. Submit for review. Review can take from hours to a few days.

### Update existing item

1. In the Developer Dashboard, open your existing **Recall** item.
2. Click **“Package”** → **“Upload new package”**.
3. Upload a new ZIP of the **contents** of `recall-chrome-ext/dist/` (same as above).
4. **Bump version** in `recall-chrome-ext/manifest.json` (e.g. `1.0.2` → `1.0.3`) before building; the store will reject the upload if the version isn’t greater than the current one.
5. Add **“What’s new”** notes for users, then submit for review.

### Get the extension ID (for Vercel)

- **After first publish:** In the Developer Dashboard, open your item. The **Item ID** in the URL or on the page is the extension ID (e.g. `https://chrome.google.com/webstore/devconsole/.../EDIT/abc...xyz` → the long string is the ID).
- Or install the extension **from the store** in Chrome, go to `chrome://extensions`, enable “Developer mode”, and copy the **ID** under your extension.
- Set this exact value as **`NEXT_PUBLIC_CHROME_EXTENSION_ID`** in Vercel (see Part 2), then redeploy the web app.

---

## Part 4: URLs and extension ID – what must match

| What | Where | Value |
|------|--------|--------|
| Web app URL | Extension `.env.local`: `VITE_APP_URL` | `https://www.recallmeapp.xyz` (or your prod URL) |
| Web app URL | Google OAuth “Authorized redirect URIs” | `https://www.recallmeapp.xyz/api/auth/callback` (and `/api/youtube/callback` if used) |
| Web app URL | Supabase “Redirect URLs” | `https://www.recallmeapp.xyz/**` |
| Extension ID | Vercel: `NEXT_PUBLIC_CHROME_EXTENSION_ID` | **Chrome Web Store** extension ID (same as when users install from store) |

**Important**

- The extension ID you get from **“Load unpacked”** (e.g. `eobgacfijiamdpjbnknaeoegmngceghk`) is **not** necessarily the same as the **Chrome Web Store** Item ID. Once the extension is published, always use the **store** extension ID in Vercel.
- If you only ever install unpacked and never publish, then the unpacked ID is correct for `NEXT_PUBLIC_CHROME_EXTENSION_ID` (e.g. for a staging site).

---

## Quick checklist before going live

- [ ] Web app pushed to git; Vercel deploy succeeded.
- [ ] Vercel env: `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, Supabase, Google OAuth, and (after publish) `NEXT_PUBLIC_CHROME_EXTENSION_ID` set for Production.
- [ ] Extension built with prod `VITE_APP_URL` in `recall-chrome-ext/.env.local`.
- [ ] `manifest.json` version bumped if updating an existing store item.
- [ ] Extension zip = contents of `recall-chrome-ext/dist/` (not the `dist` folder itself).
- [ ] After publish: store extension ID copied into Vercel `NEXT_PUBLIC_CHROME_EXTENSION_ID` and project redeployed.
