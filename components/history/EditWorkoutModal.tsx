'use client';

import { useEffect, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ActiveExercise } from '@/components/workout/ActiveExercise';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { EXERCISE_MAP } from '@/lib/exercises';
import { generateId } from '@/lib/utils';
import type { WorkoutDB, ActiveExercise as ActiveExerciseType, ActiveSet } from '@/lib/types';
import { Plus } from 'lucide-react';

interface EditWorkoutModalProps {
  workout: WorkoutDB | null;
  onClose: () => void;
  onSaved: () => void;
}

function dbToActive(workout: WorkoutDB): ActiveExerciseType[] {
  return workout.exercises.map((ex) => ({
    id: generateId(),
    exerciseId: ex.exerciseId,
    notes: ex.notes ?? undefined,
    sets: ex.sets.map((s) => ({
      id: generateId(),
      reps: s.reps ?? undefined,
      weightLbs: s.weightLbs ?? undefined,
      durationSeconds: s.durationSeconds ?? undefined,
      distanceMiles: s.distanceMiles ?? undefined,
    } satisfies ActiveSet)),
  }));
}

export function EditWorkoutModal({ workout, onClose, onSaved }: EditWorkoutModalProps) {
  const [exercises, setExercises] = useState<ActiveExerciseType[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workout) setExercises(dbToActive(workout));
  }, [workout]);

  const addExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => [
      ...prev,
      { id: generateId(), exerciseId, sets: [{ id: generateId() }] },
    ]);
    setShowSelector(false);
  }, []);

  const updateExercise = useCallback((id: string, updated: ActiveExerciseType) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const removeExercise = useCallback((id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleSave = async () => {
    if (!workout) return;
    setSaving(true);

    const body = {
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        notes: ex.notes,
        sets: ex.sets
          .filter((s) => {
            const def = EXERCISE_MAP.get(ex.exerciseId);
            if (!def) return false;
            if (def.type === 'strength') return s.reps != null || s.weightLbs != null;
            if (def.type === 'bodyweight') return s.reps != null;
            if (def.type === 'timed') return s.durationSeconds != null;
            if (def.type === 'cardio') return s.durationSeconds != null || s.distanceMiles != null;
            return false;
          })
          .map((s) => ({
            reps: s.reps,
            weightLbs: s.weightLbs,
            durationSeconds: s.durationSeconds,
            distanceMiles: s.distanceMiles,
          })),
      })).filter((ex) => ex.sets.length > 0),
    };

    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal isOpen={!!workout} onClose={onClose} title="Edit Workout" size="lg">
        <div className="px-5 pb-5 flex flex-col gap-3">
          {exercises.map((ex) => {
            const def = EXERCISE_MAP.get(ex.exerciseId);
            if (!def) return null;
            return (
              <ActiveExercise
                key={ex.id}
                exercise={ex}
                def={def}
                onUpdate={(updated) => updateExercise(ex.id, updated)}
                onRemove={() => removeExercise(ex.id)}
              />
            );
          })}

          <button
            onClick={() => setShowSelector(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:border-violet-300 hover:text-violet-500 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-all"
          >
            <Plus size={14} />
            Add Exercise
          </button>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <ExerciseSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={addExercise}
        alreadyAdded={exercises.map((e) => e.exerciseId)}
      />
    </>
  );
}
