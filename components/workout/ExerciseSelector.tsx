'use client';

import { useState, useMemo } from 'react';
import { EXERCISES, CATEGORIES } from '@/lib/exercises';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExerciseCategory } from '@/lib/types';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
  alreadyAdded: string[];
}

export function ExerciseSelector({ isOpen, onClose, onSelect, alreadyAdded }: ExerciseSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesCategory = activeCategory === 'all' || ex.category === activeCategory;
      const matchesSearch =
        !search || ex.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleSelect = (exerciseId: string) => {
    if (!alreadyAdded.includes(exerciseId)) {
      onSelect(exerciseId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise" size="lg">
      <div className="px-5 pb-5 flex flex-col gap-4">
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
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
              No exercises found
            </p>
          )}
          {filtered.map((ex) => {
            const isAdded = alreadyAdded.includes(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex.id)}
                disabled={isAdded}
                className={cn(
                  'flex items-center justify-between py-3 text-left transition-all',
                  isAdded
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl px-2 -mx-2 cursor-pointer'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {ex.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="category" category={ex.category}>
                      {ex.category.charAt(0).toUpperCase() + ex.category.slice(1)}
                    </Badge>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">
                      {ex.type === 'bodyweight' ? 'Bodyweight' : ex.type === 'timed' ? 'Timed' : ex.type === 'cardio' ? 'Cardio' : 'Strength'}
                    </span>
                  </div>
                </div>
                {isAdded ? (
                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Plus size={14} className="text-violet-600 dark:text-violet-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button variant="outline" onClick={onClose} className="mt-2">
          Done
        </Button>
      </div>
    </Modal>
  );
}
