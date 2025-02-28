// /app/types/participants.ts
export interface Participant {
    participant_id: string; // uuid as string
    challenge_id?: string; // uuid as string
    user_id?: string; // uuid as string
    joined_at?: string; // timestamp without timezone
    status?: string;
  }