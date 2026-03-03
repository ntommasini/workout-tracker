'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EXERCISE_MAP } from '@/lib/exercises';
import { formatDate, formatWeight } from '@/lib/utils';
import type { ExerciseHistoryEntry } from '@/lib/types';
import { Trophy, Calendar, Dumbbell, Star, BookOpen, ListChecks, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Records {
  maxWeightLbs: number | null;
  maxReps: number | null;
  maxDurationSeconds: number | null;
  maxDistanceMiles: number | null;
  bestWeightDate: string | null;
  bestRepsDate: string | null;
}

type DetailTab = 'description' | 'history' | 'records';

interface ExerciseDetailModalProps {
  exerciseId: string | null;
  onClose: () => void;
}

export function ExerciseDetailModal({ exerciseId, onClose }: ExerciseDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>('description');
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [records, setRecords] = useState<Records | null>(null);
  const [loading, setLoading] = useState(false);

  const def = exerciseId ? EXERCISE_MAP.get(exerciseId) : null;

  useEffect(() => {
    if (!exerciseId) return;
    setTab('description');
    setLoading(true);

    Promise.all([
      fetch(`/api/exercises/${exerciseId}/history`).then((r) => r.json()),
      fetch(`/api/exercises/${exerciseId}/records`).then((r) => r.json()),
    ]).then(([hist, rec]) => {
      setHistory(Array.isArray(hist) ? hist : []);
      setRecords(rec);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [exerciseId]);

  if (!def) return null;

  const tabs: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: 'description', label: 'Description', icon: BookOpen },
    { id: 'history', label: 'History', icon: ListChecks },
    { id: 'records', label: 'Records', icon: Medal },
  ];

  return (
    <Modal isOpen={!!exerciseId} onClose={onClose} size="lg">
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <Badge variant="category" category={def.category} className="mb-2">
            {def.category.charAt(0).toUpperCase() + def.category.slice(1)}
          </Badge>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{def.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
            {def.type === 'bodyweight' ? 'Bodyweight' : def.type === 'timed' ? 'Timed' : def.type === 'cardio' ? 'Cardio' : 'Strength'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  tab === t.id
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && tab === 'description' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  About
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {def.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Primary Muscles
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {def.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  How to Perform
                </h3>
                <ol className="flex flex-col gap-2">
                  {def.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {!loading && tab === 'history' && (
            <div className="flex flex-col gap-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    No history yet. Log this exercise in a workout.
                  </p>
                </div>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.workoutId}
                    className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(entry.workoutDate)}
                    </div>
                    <div className="px-4 py-3 flex flex-col gap-1.5">
                      {entry.sets.map((set) => (
                        <div key={set.id} className="flex items-center gap-3 text-sm">
                          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 text-center">
                            {set.setNumber}
                          </span>
                          {set.isPR && (
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                              <Star size={10} fill="currentColor" />
                              PR
                            </span>
                          )}
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {def.type === 'strength' && (
                              <>
                                {set.reps != null ? `${set.reps} reps` : '—'}
                                {set.weightLbs != null ? ` × ${set.weightLbs} lbs` : ''}
                              </>
                            )}
                            {def.type === 'bodyweight' && (
                              <>{set.reps != null ? `${set.reps} reps` : '—'}</>
                            )}
                            {def.type === 'timed' && (
                              <>{set.durationSeconds != null ? `${set.durationSeconds}s` : '—'}</>
                            )}
                            {def.type === 'cardio' && (
                              <>
                                {set.durationSeconds != null
                                  ? `${Math.round(set.durationSeconds / 60)} min`
                                  : '—'}
                                {set.distanceMiles != null ? ` · ${set.distanceMiles} mi` : ''}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && tab === 'records' && (
            <div className="flex flex-col gap-4">
              {!records ||
              (records.maxWeightLbs == null &&
                records.maxReps == null &&
                records.maxDurationSeconds == null &&
                records.maxDistanceMiles == null) ? (
                <div className="text-center py-8">
                  <Trophy size={32} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    No records yet. Start logging to track your PRs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {records.maxWeightLbs != null && (
                    <RecordCard
                      icon={Dumbbell}
                      label="Max Weight"
                      value={`${records.maxWeightLbs} lbs`}
                      date={records.bestWeightDate}
                      color="orange"
                    />
                  )}
                  {records.maxReps != null && (
                    <RecordCard
                      icon={Star}
                      label="Max Reps"
                      value={`${records.maxReps} reps`}
                      date={records.bestRepsDate}
                      color="blue"
                    />
                  )}
                  {records.maxDurationSeconds != null && (
                    <RecordCard
                      icon={Trophy}
                      label="Longest Hold"
                      value={`${records.maxDurationSeconds}s`}
                      date={null}
                      color="purple"
                    />
                  )}
                  {records.maxDistanceMiles != null && (
                    <RecordCard
                      icon={Trophy}
                      label="Max Distance"
                      value={`${records.maxDistanceMiles} mi`}
                      date={null}
                      color="green"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function RecordCard({
  icon: Icon,
  label,
  value,
  date,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  date: string | null;
  color: 'orange' | 'blue' | 'purple' | 'green';
}) {
  const colors = {
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colors[color])}>
        <Icon size={18} />
      </div>
      <div>
        <div className="font-bold text-zinc-900 dark:text-white">{value}</div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">{label}</div>
        {date && (
          <div className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">{formatDate(date)}</div>
        )}
      </div>
    </div>
  );
}
