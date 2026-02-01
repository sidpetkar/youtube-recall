// Supabase Database type (auto-generated or manual)
// This type represents the database schema for type-safe queries

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          youtube_access_token: string | null
          youtube_refresh_token: string | null
          youtube_connected_at: string | null
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          youtube_access_token?: string | null
          youtube_refresh_token?: string | null
          youtube_connected_at?: string | null
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          youtube_access_token?: string | null
          youtube_refresh_token?: string | null
          youtube_connected_at?: string | null
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          position_index: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          position_index?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          position_index?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          youtube_id: string
          title: string
          channel_name: string
          channel_thumbnail: string | null
          thumbnail_url: string
          duration: string | null
          notes: string | null
          liked_at: string | null
          resume_at_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          youtube_id: string
          title: string
          channel_name: string
          channel_thumbnail?: string | null
          thumbnail_url: string
          duration?: string | null
          notes?: string | null
          liked_at?: string | null
          resume_at_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          youtube_id?: string
          title?: string
          channel_name?: string
          channel_thumbnail?: string | null
          thumbnail_url?: string
          duration?: string | null
          notes?: string | null
          liked_at?: string | null
          resume_at_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          parent_id?: string | null
          created_at?: string
        }
      }
      video_tags: {
        Row: {
          video_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          video_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          video_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
