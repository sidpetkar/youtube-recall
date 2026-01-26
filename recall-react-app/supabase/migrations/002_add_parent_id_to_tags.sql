-- Migration: Add parent_id to tags table for hierarchical tag support
-- This allows tags to have parent-child relationships (e.g., Music -> Punjabi, Indie, Rap)

-- Add parent_id column to tags table
ALTER TABLE public.tags 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.tags(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON public.tags(parent_id);

-- Create index for querying tags by user and parent
CREATE INDEX IF NOT EXISTS idx_tags_user_parent ON public.tags(user_id, parent_id);

-- Add comment for documentation
COMMENT ON COLUMN public.tags.parent_id IS 'Reference to parent tag for hierarchical organization. NULL means it is a top-level tag.';
