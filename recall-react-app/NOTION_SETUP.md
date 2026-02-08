# Notion integration setup

To use "Sync to Notion" in the watch/focus page, you need a **Notion Public integration** and env vars.

## 1. Create a Notion Public integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations).
2. Click **"+ New integration"**.
3. Choose **"Public"** (so users can connect their own workspace via OAuth).
4. Set a name (e.g. "Recall") and optionally an logo.
5. Under **"OAuth Domain & URIs"** add your redirect URI(s):
   - Local: `http://localhost:3000/api/notion/callback`
   - Production: `https://YOUR_DOMAIN/api/notion/callback`
6. Copy the **OAuth client ID** and **OAuth client secret** (under "Secrets").

## 2. Environment variables

Add to `.env.local` (and your production env):

```bash
# Notion (Public integration OAuth)
NOTION_CLIENT_ID=your_notion_oauth_client_id
NOTION_CLIENT_SECRET=your_notion_oauth_client_secret
```

`NEXT_PUBLIC_APP_URL` is already used for the redirect (e.g. `http://localhost:3000` or `https://recallmeapp.xyz`). The callback URL will be `{NEXT_PUBLIC_APP_URL}/api/notion/callback`.

## 3. Database migration

Run in Supabase (SQL Editor):

**Profiles (Notion OAuth):**
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notion_access_token text,
  ADD COLUMN IF NOT EXISTS notion_workspace_id uuid,
  ADD COLUMN IF NOT EXISTS notion_connected_at timestamptz;
```

**Notion pages (notes per video):**
```sql
CREATE TABLE IF NOT EXISTS public.notion_pages (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    notion_page_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, youtube_video_id)
);
CREATE INDEX IF NOT EXISTS idx_notion_pages_user_id ON public.notion_pages(user_id);
ALTER TABLE public.notion_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notion_pages" ON public.notion_pages FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## What you need to provide

- **NOTION_CLIENT_ID** – from the integration’s "OAuth client ID".
- **NOTION_CLIENT_SECRET** – from the integration’s "Secrets" (OAuth client secret).
- Redirect URI in Notion dashboard must match: `{NEXT_PUBLIC_APP_URL}/api/notion/callback`.
- Run the SQL above in Supabase so the app can store the Notion token per user.

Ref: [Notion API – Authorization](https://developers.notion.com/guides/get-started/authorization), [Working with page content](https://developers.notion.com/guides/data-apis/working-with-page-content).
