export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio';

export type ExerciseType = 'strength' | 'bodyweight' | 'timed' | 'cardio';

export interface ExerciseDef {
  id: string;
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
  description: string;
  primaryMuscles: string[];
  instructions: string[];
}

// ── Active workout (client-side, pre-save) ──────────────────────────────────

export interface ActiveSet {
  id: string;
  reps?: number;
  weightLbs?: number;
  durationSeconds?: number;
  distanceMiles?: number;
}

export interface ActiveExercise {
  id: string;
  exerciseId: string;
  sets: ActiveSet[];
  notes?: string;
}

export interface ActiveWorkout {
  startTime: string; // ISO
  exercises: ActiveExercise[];
}

// ── API response types ───────────────────────────────────────────────────────

export interface WorkoutSetDB {
  id: string;
  setNumber: number;
  reps: number | null;
  weightLbs: number | null;
  durationSeconds: number | null;
  distanceMiles: number | null;
  isPR: boolean;
}

export interface WorkoutExerciseDB {
  id: string;
  exerciseId: string;
  order: number;
  notes: string | null;
  sets: WorkoutSetDB[];
}

export interface WorkoutDB {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  totalWeight: number;
  prsCount: number;
  notes: string | null;
  exercises: WorkoutExerciseDB[];
  createdAt: string;
}

export interface ExerciseStat {
  exerciseId: string;
  lastWorkedAt: string | null;
  maxWeightLbs: number | null;
  maxReps: number | null;
  maxDurationSeconds: number | null;
  totalSessions: number;
}

export interface ExerciseHistoryEntry {
  workoutId: string;
  workoutDate: string;
  sets: WorkoutSetDB[];
}
