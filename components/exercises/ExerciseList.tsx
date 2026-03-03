'use client';

import { useEffect, useState, useMemo } from 'react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { Badge } from '@/components/ui/Badge';
import { EXERCISES, CATEGORIES } from '@/lib/exercises';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ExerciseStat, ExerciseCategory } from '@/lib/types';
import { Search, ChevronRight, ListCollapse } from 'lucide-react';

export function ExerciseList() {
  const [stats, setStats] = useState<ExerciseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');

  useEffect(() => {
    fetch('/api/exercises/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statMap = useMemo(
    () => new Map(stats.map((s) => [s.exerciseId, s])),
    [stats]
  );

  const sorted = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesCategory = activeCategory === 'all' || ex.category === activeCategory;
      const matchesSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const sa = statMap.get(a.id);
      const sb = statMap.get(b.id);
      if (sa?.lastWorkedAt && sb?.lastWorkedAt) {
        return new Date(sb.lastWorkedAt).getTime() - new Date(sa.lastWorkedAt).getTime();
      }
      if (sa?.lastWorkedAt) return -1;
      if (sb?.lastWorkedAt) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [stats, search, activeCategory, statMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3 pb-28">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Exercises</h2>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              activeCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ExerciseCategory)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                activeCategory === cat.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <ListCollapse size={32} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No exercises found</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {sorted.map((ex) => {
            const stat = statMap.get(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {ex.name}
                    </span>
                    <Badge variant="category" category={ex.category}>
                      {ex.category.charAt(0).toUpperCase() + ex.category.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {stat?.lastWorkedAt ? (
                        <>Last: {timeAgo(stat.lastWorkedAt)}</>
                      ) : (
                        'Never logged'
                      )}
                    </span>
                    {stat?.totalSessions != null && stat.totalSessions > 0 && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {stat.totalSessions} session{stat.totalSessions !== 1 ? 's' : ''}
                      </span>
                    )}
                    {stat?.maxWeightLbs != null && (
                      <span className="text-xs text-violet-500 dark:text-violet-400 font-medium">
                        PR: {stat.maxWeightLbs} lbs
                      </span>
                    )}
                    {stat?.maxReps != null && stat.maxWeightLbs == null && (
                      <span className="text-xs text-violet-500 dark:text-violet-400 font-medium">
                        PR: {stat.maxReps} reps
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-zinc-300 dark:text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0"
                />
              </button>
            );
          })}
        </div>
      </div>

      <ExerciseDetailModal
        exerciseId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
