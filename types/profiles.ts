// /app/types/profiles.ts
export interface Profile {
    user_id: string; // uuid as string
    created_at?: string; // timestamp with timezone
    updated_at?: string; // timestamp with timezone
    username?: string;
    avatar_url?: string;
  }