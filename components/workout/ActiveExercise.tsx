'use client';

import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, generateId } from '@/lib/utils';
import type { ExerciseDef, ActiveExercise as ActiveExerciseType, ActiveSet } from '@/lib/types';

interface ActiveExerciseProps {
  exercise: ActiveExerciseType;
  def: ExerciseDef;
  onUpdate: (updated: ActiveExerciseType) => void;
  onRemove: () => void;
}

export function ActiveExercise({ exercise, def, onUpdate, onRemove }: ActiveExerciseProps) {
  const [collapsed, setCollapsed] = useState(false);

  const updateSet = (setId: string, field: keyof ActiveSet, value: number | undefined) => {
    const updated = exercise.sets.map((s) =>
      s.id === setId ? { ...s, [field]: value } : s
    );
    onUpdate({ ...exercise, sets: updated });
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ActiveSet = {
      id: generateId(),
      ...(lastSet ? {
        reps: lastSet.reps,
        weightLbs: lastSet.weightLbs,
        durationSeconds: lastSet.durationSeconds,
        distanceMiles: lastSet.distanceMiles,
      } : {}),
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const removeSet = (setId: string) => {
    if (exercise.sets.length <= 1) {
      onRemove();
      return;
    }
    onUpdate({ ...exercise, sets: exercise.sets.filter((s) => s.id !== setId) });
  };

  const isStrength = def.type === 'strength';
  const isBodyweight = def.type === 'bodyweight';
  const isTimed = def.type === 'timed';
  const isCardio = def.type === 'cardio';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <button
          className="flex items-center gap-2 flex-1 text-left"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">{def.name}</span>
            <Badge variant="category" category={def.category}>
              {def.category.charAt(0).toUpperCase() + def.category.slice(1)}
            </Badge>
          </div>
          <div className="ml-auto mr-2 text-zinc-400 dark:text-zinc-500">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 flex flex-col gap-3">
          {/* Column headers */}
          <div className="grid text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide"
            style={{
              gridTemplateColumns: isStrength
                ? '2rem 1fr 1fr 2rem'
                : isBodyweight
                ? '2rem 1fr 2rem'
                : isTimed
                ? '2rem 1fr 2rem'
                : '2rem 1fr 1fr 2rem', // cardio
            }}
          >
            <span>Set</span>
            {isStrength && <><span>Reps</span><span>Weight (lbs)</span></>}
            {isBodyweight && <span>Reps</span>}
            {isTimed && <span>Duration (s)</span>}
            {isCardio && <><span>Duration (min)</span><span>Distance (mi)</span></>}
            <span />
          </div>

          {/* Sets */}
          {exercise.sets.map((set, idx) => (
            <div
              key={set.id}
              className="grid items-center gap-2"
              style={{
                gridTemplateColumns: isStrength
                  ? '2rem 1fr 1fr 2rem'
                  : isBodyweight
                  ? '2rem 1fr 2rem'
                  : isTimed
                  ? '2rem 1fr 2rem'
                  : '2rem 1fr 1fr 2rem',
              }}
            >
              {/* Set number */}
              <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 text-center">
                {idx + 1}
              </span>

              {isStrength && (
                <>
                  <NumberInput
                    value={set.reps}
                    onChange={(v) => updateSet(set.id, 'reps', v)}
                    placeholder="0"
                    min={0}
                  />
                  <NumberInput
                    value={set.weightLbs}
                    onChange={(v) => updateSet(set.id, 'weightLbs', v)}
                    placeholder="0"
                    step={2.5}
                    min={0}
                  />
                </>
              )}

              {isBodyweight && (
                <NumberInput
                  value={set.reps}
                  onChange={(v) => updateSet(set.id, 'reps', v)}
                  placeholder="0"
                  min={0}
                />
              )}

              {isTimed && (
                <NumberInput
                  value={set.durationSeconds}
                  onChange={(v) => updateSet(set.id, 'durationSeconds', v)}
                  placeholder="0"
                  min={0}
                />
              )}

              {isCardio && (
                <>
                  <NumberInput
                    value={set.durationSeconds != null ? Math.round(set.durationSeconds / 60) : undefined}
                    onChange={(v) => updateSet(set.id, 'durationSeconds', v != null ? v * 60 : undefined)}
                    placeholder="0"
                    min={0}
                  />
                  <NumberInput
                    value={set.distanceMiles}
                    onChange={(v) => updateSet(set.id, 'distanceMiles', v)}
                    placeholder="0.0"
                    step={0.1}
                    min={0}
                  />
                </>
              )}

              {/* Remove set */}
              <button
                onClick={() => removeSet(set.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}

          {/* Add set */}
          <button
            onClick={addSet}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:border-violet-300 hover:text-violet-500 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-all"
          >
            <Plus size={14} />
            Add Set
          </button>
        </div>
      )}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  step = 1,
  min = 0,
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
        onChange(v);
      }}
      placeholder={placeholder}
      step={step}
      min={min}
      className={cn(
        'w-full text-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-sm font-semibold text-zinc-900 dark:text-white',
        'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all',
        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
      )}
    />
  );
}
