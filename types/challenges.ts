// /app/types/challenges.ts
export interface Challenge {
    challenge_id: string; // uuid as string
    start_date: string; // timestamp without timezone
    end_date: string; // timestamp without timezone
    entry_fee: number;
    created_at?: string;
    updated_at?: string;
    status?: string;
    name: string;
    description?: string;
  }