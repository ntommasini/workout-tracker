'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ExerciseSelector } from './ExerciseSelector';
import { ActiveExercise } from './ActiveExercise';
import { EXERCISE_MAP } from '@/lib/exercises';
import { generateId, formatDuration, formatWeight } from '@/lib/utils';
import type { ActiveWorkout, ActiveExercise as ActiveExerciseType } from '@/lib/types';
import {
  Plus,
  CheckCircle2,
  Clock,
  Dumbbell,
  Trophy,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SESSION_KEY = 'gainlog_active_workout';

interface WorkoutSummary {
  duration: string;
  exerciseCount: number;
  totalWeight: number;
  prsCount: number;
}

interface NewWorkoutProps {
  onWorkoutSaved?: () => void;
}

export function NewWorkout({ onWorkoutSaved }: NewWorkoutProps) {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: ActiveWorkout = JSON.parse(stored);
        setActiveWorkout(parsed);
        setElapsed(Math.floor((Date.now() - new Date(parsed.startTime).getTime()) / 1000));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to sessionStorage
  useEffect(() => {
    if (activeWorkout) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(activeWorkout));
    }
  }, [activeWorkout]);

  // Timer
  useEffect(() => {
    if (activeWorkout) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(activeWorkout.startTime).getTime()) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeWorkout?.startTime]);

  const startWorkout = () => {
    const workout: ActiveWorkout = {
      startTime: new Date().toISOString(),
      exercises: [],
    };
    setActiveWorkout(workout);
    setElapsed(0);
  };

  const discardWorkout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setActiveWorkout(null);
    setElapsed(0);
    setSummary(null);
  };

  const addExercise = useCallback((exerciseId: string) => {
    const newExercise: ActiveExerciseType = {
      id: generateId(),
      exerciseId,
      sets: [{ id: generateId() }],
    };
    setActiveWorkout((prev) =>
      prev ? { ...prev, exercises: [...prev.exercises, newExercise] } : prev
    );
    setShowSelector(false);
  }, []);

  const updateExercise = useCallback((id: string, updated: ActiveExerciseType) => {
    setActiveWorkout((prev) =>
      prev
        ? { ...prev, exercises: prev.exercises.map((e) => (e.id === id ? updated : e)) }
        : prev
    );
  }, []);

  const removeExercise = useCallback((id: string) => {
    setActiveWorkout((prev) =>
      prev ? { ...prev, exercises: prev.exercises.filter((e) => e.id !== id) } : prev
    );
  }, []);

  const finishWorkout = async () => {
    if (!activeWorkout) return;

    const endTime = new Date().toISOString();
    setIsSaving(true);

    try {
      const body = {
        startTime: activeWorkout.startTime,
        endTime,
        exercises: activeWorkout.exercises.map((ex) => ({
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

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        const durationSecs = Math.round(
          (new Date(endTime).getTime() - new Date(activeWorkout.startTime).getTime()) / 1000
        );

        setSummary({
          duration: formatDuration(durationSecs),
          exerciseCount: saved.exercises.length,
          totalWeight: saved.totalWeight,
          prsCount: saved.prsCount,
        });

        sessionStorage.removeItem(SESSION_KEY);
        setActiveWorkout(null);
        onWorkoutSaved?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Summary screen ────────────────────────────────────────────────────────
  if (summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            Workout Complete!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">Great work. Here&apos;s your summary:</p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <StatCard icon={Clock} label="Duration" value={summary.duration} color="blue" />
          <StatCard icon={Dumbbell} label="Exercises" value={summary.exerciseCount.toString()} color="purple" />
          <StatCard
            icon={Dumbbell}
            label="Total Weight"
            value={summary.totalWeight > 0 ? formatWeight(summary.totalWeight) : '—'}
            color="orange"
          />
          <StatCard
            icon={Trophy}
            label="PRs Set"
            value={summary.prsCount.toString()}
            color="yellow"
          />
        </div>

        <Button onClick={() => setSummary(null)} size="lg" className="w-full max-w-sm">
          Back to Home
        </Button>
      </div>
    );
  }

  // ── No active workout ─────────────────────────────────────────────────────
  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={36} className="text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Ready to train?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Start a workout to begin logging your sets.
          </p>
        </div>
        <Button onClick={startWorkout} size="lg" className="w-full max-w-xs py-4 text-base">
          <Plus size={20} />
          Start Workout
        </Button>
      </div>
    );
  }

  // ── Active workout ────────────────────────────────────────────────────────
  return (
    <>
      {/* Sticky workout header */}
      <div className="sticky top-14 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                In Progress
              </span>
              <span className="font-bold text-lg text-zinc-900 dark:text-white tabular-nums">
                {formatDuration(elapsed)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={discardWorkout}
              className="text-zinc-400 dark:text-zinc-500"
            >
              <X size={16} />
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={finishWorkout}
              isLoading={isSaving}
              disabled={activeWorkout.exercises.length === 0}
            >
              <CheckCircle2 size={16} />
              Finish
            </Button>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3 pb-32">
        {activeWorkout.exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Plus size={24} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Add your first exercise to get started
            </p>
          </div>
        )}

        {activeWorkout.exercises.map((ex) => {
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

        <Button
          variant="outline"
          className="w-full py-3 border-dashed"
          onClick={() => setShowSelector(true)}
        >
          <Plus size={18} />
          Add Exercise
        </Button>
      </div>

      <ExerciseSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={addExercise}
        alreadyAdded={activeWorkout.exercises.map((e) => e.exerciseId)}
      />
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'orange' | 'yellow';
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="text-center">
        <div className="font-bold text-zinc-900 dark:text-white">{value}</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">{label}</div>
      </div>
    </div>
  );
}
