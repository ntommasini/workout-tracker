'use client';

import { useEffect, useState } from 'react';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { Badge } from '@/components/ui/Badge';
import { EXERCISE_MAP } from '@/lib/exercises';
import {
  formatDateTime,
  formatWorkoutDuration,
  formatWeight,
} from '@/lib/utils';
import type { WorkoutDB } from '@/lib/types';
import { Clock, Dumbbell, Trophy, Flame, ChevronRight, History, Star } from 'lucide-react';

interface WorkoutHistoryProps {
  refreshKey?: number;
}

export function WorkoutHistory({ refreshKey = 0 }: WorkoutHistoryProps) {
  const [workouts, setWorkouts] = useState<WorkoutDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [internalKey, setInternalKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('/api/workouts')
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, internalKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <History size={28} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <div>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">No workouts yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
            Log your first workout to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3 pb-28">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Workout History
        </h2>
        {workouts.map((workout) => {
          const exerciseNames = workout.exercises
            .slice(0, 3)
            .map((ex) => EXERCISE_MAP.get(ex.exerciseId)?.name ?? ex.exerciseId);
          const moreCount = workout.exercises.length - 3;

          return (
            <button
              key={workout.id}
              onClick={() => setSelectedId(workout.id)}
              className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all group"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white text-sm">
                    {formatDateTime(workout.startTime)}
                  </div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-zinc-300 dark:text-zinc-600 group-hover:text-violet-400 transition-colors mt-0.5"
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Clock size={13} className="text-blue-400" />
                  {formatWorkoutDuration(workout.startTime, workout.endTime)}
                </span>
                {workout.totalWeight > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <Dumbbell size={13} className="text-orange-400" />
                    {formatWeight(workout.totalWeight)}
                  </span>
                )}
                {workout.prsCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    {workout.prsCount} PR{workout.prsCount !== 1 ? 's' : ''}
                  </span>
                )}
                {workout.estimatedCalories != null && workout.estimatedCalories > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <Flame size={13} className="text-red-400" />
                    ~{workout.estimatedCalories} kcal
                  </span>
                )}
              </div>

              {/* Exercise chips */}
              <div className="flex flex-wrap gap-1.5">
                {exerciseNames.map((name) => (
                  <span
                    key={name}
                    className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                  >
                    {name}
                  </span>
                ))}
                {moreCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
                    +{moreCount} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <WorkoutDetailModal
        workoutId={selectedId}
        onClose={() => setSelectedId(null)}
        onWorkoutUpdated={() => setInternalKey((k) => k + 1)}
      />
    </>
  );
}
