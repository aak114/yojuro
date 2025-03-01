// types.ts

// Profiles
export interface Profile {
    user_id: string;
    created_at: string;
    updated_at: string;
    username: string;
    avatar_url: string;
  }
  
  // Exercises
  export interface Exercise {
    exercise_id: string;
    name: string;
  }
  
  // Workouts
  export interface Workout {
    workout_id: string;
    reps: number;
    duration: number;
    created_at: string;
    updated_at: string;
    exercise_type: string;
    sequence_id: string;
    workout_order: number;
    pause_duration: number;
  }
  
  // Sequences
  export interface Sequence {
    sequence_id: string;
    program_id: string;
    created_at: string;
    updated_at: string;
    sequence_dates: string[];  // Array of dates in string format
  }
  
  // Programs
  export interface Program {
    program_id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }
  
  // Challenges
  export interface Challenge {
    challenge_id: string;
    start_date: string;
    end_date: string;
    entry_fee: number;
    created_at: string;
    updated_at: string;
    status: string;
    name: string;
    description: string;
    program_id: string;
  }
  
  // Participants
  export interface Participant {
    participant_id: string;
    challenge_id: string;
    user_id: string;
    joined_at: string;
    status: string;
  }
  
  // Submissions
  export interface Submission {
    submission_id: string;
    sequence_id: string;
    user_id: string;
    date: string;
    completed: boolean;
    reps_completed: number;
    duration_taken: number;
    created_at: string;
    updated_at: string;
    proof_url: string;
  }
  