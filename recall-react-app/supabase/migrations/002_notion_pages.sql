-- Notion pages: map user + YouTube video to a Notion page for notes
CREATE TABLE IF NOT EXISTS public.notion_pages (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    notion_page_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, youtube_video_id)
);

CREATE INDEX IF NOT EXISTS idx_notion_pages_user_id ON public.notion_pages(user_id);

-- RLS
ALTER TABLE public.notion_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notion_pages"
    ON public.notion_pages FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
