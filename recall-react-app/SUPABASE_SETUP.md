# Supabase Setup Instructions for YouTube Knowledge Manager

## Prerequisites
- A Google/Gmail account
- Node.js and npm installed
- Your existing Google Cloud OAuth credentials (already configured)

## Step 1: Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up or log in
2. Click **"New Project"**
3. Fill in the details:
   - **Organization**: Create new or select existing
   - **Project Name**: `youtube-knowledge-manager` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Start with Free tier
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** (gear icon in sidebar) → **API**
2. You'll find these credentials (copy them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Starts with `eyJ...` (safe to use in browser)
   - **service_role key**: Starts with `eyJ...` (keep secret, server-only!)

3. Add them to your `.env.local` file:

```env
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key

# Existing Google OAuth (keep these)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ **Status: COMPLETED** - Your credentials are already in `.env.local`

## Step 3: Configure Google OAuth Provider in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Toggle **"Enable Sign in with Google"** to ON
4. Fill in:
   - **Client ID (for OAuth)**: Your existing `GOOGLE_CLIENT_ID`
   - **Client Secret (for OAuth)**: Your existing `GOOGLE_CLIENT_SECRET`
5. Note the **Authorized Client IDs** field - leave it empty for now
6. Click **"Save"**

## Step 4: Configure Redirect URLs

1. Still in **Authentication** → **URL Configuration**
2. Add these **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback` (for development)
   - Your production URL when you deploy (e.g., `https://yourdomain.com/api/auth/callback`)
3. Set **Site URL** to `http://localhost:3000` (or your production URL)

## Step 5: Update Google Cloud Console

You need to add Supabase's redirect URL to your Google OAuth configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   - `https://mpltdhgnmdcincgvkcav.supabase.co/auth/v1/callback`
4. Keep your existing redirect URIs:
   - `http://localhost:3000/api/youtube/callback`
5. Click **"Save"**

## Step 6: Run Database Migration

Once the implementation is complete, you'll run a SQL migration in the Supabase dashboard:

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New query"**
3. Copy and paste the migration script from `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"** to execute the migration
5. Verify tables are created in **Table Editor**

The migration will create:
- `profiles` table (user information)
- `folders` table (organize videos)
- `videos` table (saved YouTube videos)
- `tags` table (reusable tags)
- `video_tags` table (many-to-many relationship)
- Row Level Security (RLS) policies for all tables
- Indexes for performance
- Triggers for auto-updating timestamps

## Verification Checklist

Before using the app, verify:

- [x] Supabase project is created and running
- [x] You have all three credentials (URL, anon key, service role key)
- [x] Credentials are added to `.env.local`
- [ ] Google OAuth provider is enabled in Supabase Auth
- [ ] Google Cloud Console has Supabase callback URL
- [ ] Redirect URLs are configured in Supabase
- [ ] SQL migration has been executed
- [ ] Tables are visible in Table Editor

## Need Help?

If you encounter issues:
- Check Supabase [documentation](https://supabase.com/docs)
- Verify all environment variables are correct
- Check the Supabase logs in the dashboard
- Ensure your Google OAuth credentials are valid

## Next Steps

1. Complete items 3-6 above in Supabase dashboard
2. Run the SQL migration (Step 6)
3. Start the development server: `npm run dev`
4. Test the authentication flow
5. Connect your YouTube account
6. Sync your liked videos

## Estimated Setup Time

- Supabase project creation: 2-3 minutes ✅
- Configuration (Steps 3-5): 5-10 minutes
- Running migration: 1-2 minutes

**Total: ~15 minutes**
