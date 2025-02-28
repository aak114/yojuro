// /app/types/submissions.ts
export interface Submission {
    submission_id: string; // uuid as string
    workout_id?: string; // uuid as string
    user_id?: string; // uuid as string
    date?: string; // timestamp without timezone
    completed?: boolean;
    reps_completed?: number;
    duration_taken?: number;
    created_at?: string;
    updated_at?: string;
    proof_url?: string;
  }