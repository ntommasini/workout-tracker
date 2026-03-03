'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EXERCISE_MAP } from '@/lib/exercises';
import { formatDateTime, formatWorkoutDuration, formatWeight } from '@/lib/utils';
import type { WorkoutDB } from '@/lib/types';
import { Clock, Dumbbell, Trophy, Calendar, Star } from 'lucide-react';

interface WorkoutDetailModalProps {
  workoutId: string | null;
  onClose: () => void;
}

export function WorkoutDetailModal({ workoutId, onClose }: WorkoutDetailModalProps) {
  const [workout, setWorkout] = useState<WorkoutDB | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workoutId) return;
    setLoading(true);
    fetch(`/api/workouts/${workoutId}`)
      .then((r) => r.json())
      .then((data) => {
        setWorkout(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workoutId]);

  return (
    <Modal isOpen={!!workoutId} onClose={onClose} title="Workout Details" size="lg">
      <div className="px-5 pb-5">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <span className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && workout && (
          <div className="flex flex-col gap-5">
            {/* Meta */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar size={14} />
              {formatDateTime(workout.startTime)}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                <Clock size={18} className="text-blue-500 mx-auto mb-1" />
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  {formatWorkoutDuration(workout.startTime, workout.endTime)}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">Duration</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                <Dumbbell size={18} className="text-orange-500 mx-auto mb-1" />
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  {workout.totalWeight > 0 ? formatWeight(workout.totalWeight) : '—'}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">Volume</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                <Trophy size={18} className="text-yellow-500 mx-auto mb-1" />
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  {workout.prsCount}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">PRs</div>
              </div>
            </div>

            {/* Exercises */}
            <div className="flex flex-col gap-4">
              {workout.exercises.map((ex) => {
                const def = EXERCISE_MAP.get(ex.exerciseId);
                return (
                  <div
                    key={ex.id}
                    className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden"
                  >
                    {/* Exercise header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {def?.name ?? ex.exerciseId}
                        </div>
                        {def && (
                          <Badge variant="category" category={def.category} className="mt-0.5">
                            {def.category.charAt(0).toUpperCase() + def.category.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Sets */}
                    <div className="px-4 py-3 flex flex-col gap-1.5">
                      {ex.sets.map((set) => {
                        const type = def?.type;
                        return (
                          <div
                            key={set.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 text-center">
                              {set.setNumber}
                            </span>
                            {set.isPR && (
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                <Star size={11} fill="currentColor" />
                                PR
                              </span>
                            )}
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {type === 'strength' && (
                                <>
                                  {set.reps != null ? `${set.reps} reps` : '—'}
                                  {set.weightLbs != null ? ` × ${set.weightLbs} lbs` : ''}
                                </>
                              )}
                              {type === 'bodyweight' && (
                                <>{set.reps != null ? `${set.reps} reps` : '—'}</>
                              )}
                              {type === 'timed' && (
                                <>{set.durationSeconds != null ? `${set.durationSeconds}s` : '—'}</>
                              )}
                              {type === 'cardio' && (
                                <>
                                  {set.durationSeconds != null
                                    ? `${Math.round(set.durationSeconds / 60)} min`
                                    : '—'}
                                  {set.distanceMiles != null ? ` · ${set.distanceMiles} mi` : ''}
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
