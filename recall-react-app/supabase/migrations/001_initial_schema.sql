-- YouTube Knowledge Manager - Initial Database Schema
-- This migration creates all necessary tables, RLS policies, indexes, and triggers

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Profiles table - User information synced from Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    youtube_access_token TEXT, -- Encrypted YouTube OAuth token
    youtube_refresh_token TEXT, -- Encrypted YouTube refresh token
    youtube_connected_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Folders table - Organize videos into folders
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position_index INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name) -- Prevent duplicate folder names per user
);

-- Videos table - Saved YouTube videos
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    channel_thumbnail TEXT,
    thumbnail_url TEXT NOT NULL,
    duration TEXT,
    notes TEXT,
    liked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, youtube_id) -- Prevent duplicate videos per user
);

-- Tags table - Reusable tags for organizing videos
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1', -- Default indigo color
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name) -- Prevent duplicate tag names per user
);

-- Video Tags junction table - Many-to-many relationship
CREATE TABLE IF NOT EXISTS public.video_tags (
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (video_id, tag_id)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Folders indexes
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_position ON public.folders(user_id, position_index);

-- Videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_folder_id ON public.videos(folder_id);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id_user ON public.videos(youtube_id, user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_folder ON public.videos(user_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_videos_liked_at ON public.videos(liked_at DESC);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- Video Tags indexes
CREATE INDEX IF NOT EXISTS idx_video_tags_video_id ON public.video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON public.video_tags(tag_id);

-- ============================================================================
-- CREATE FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default "Inbox" folder when a new profile is created
CREATE OR REPLACE FUNCTION create_default_folder_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.folders (user_id, name, position_index, is_default)
    VALUES (NEW.id, 'Inbox', 0, TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on folders
DROP TRIGGER IF EXISTS trigger_folders_updated_at ON public.folders;
CREATE TRIGGER trigger_folders_updated_at
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on videos
DROP TRIGGER IF EXISTS trigger_videos_updated_at ON public.videos;
CREATE TRIGGER trigger_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create default Inbox folder when profile is created
DROP TRIGGER IF EXISTS trigger_create_default_folder ON public.profiles;
CREATE TRIGGER trigger_create_default_folder
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_folder_for_user();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view their own folders"
    ON public.folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
    ON public.folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON public.folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON public.folders FOR DELETE
    USING (auth.uid() = user_id);

-- Videos policies
CREATE POLICY "Users can view their own videos"
    ON public.videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
    ON public.videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
    ON public.videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
    ON public.videos FOR DELETE
    USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view their own tags"
    ON public.tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
    ON public.tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON public.tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON public.tags FOR DELETE
    USING (auth.uid() = user_id);

-- Video Tags policies (users can manage video_tags for their own videos)
CREATE POLICY "Users can view video tags for their videos"
    ON public.video_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.videos
            WHERE videos.id = video_tags.video_id
            AND videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert video tags for their videos"
    ON public.video_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.videos
            WHERE videos.id = video_tags.video_id
            AND videos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete video tags for their videos"
    ON public.video_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.videos
            WHERE videos.id = video_tags.video_id
            AND videos.user_id = auth.uid()
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.folders TO authenticated;
GRANT ALL ON public.videos TO authenticated;
GRANT ALL ON public.tags TO authenticated;
GRANT ALL ON public.video_tags TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration creates:
-- ✅ 5 tables (profiles, folders, videos, tags, video_tags)
-- ✅ Performance indexes
-- ✅ Auto-update triggers for timestamps
-- ✅ Auto-create default "Inbox" folder trigger
-- ✅ Row Level Security policies for all tables
-- ✅ Proper foreign key relationships and cascading deletes
