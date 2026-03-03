import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';
import type { ExerciseCategory } from '@/lib/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'category';
  category?: ExerciseCategory;
}

const categoryColors: Record<ExerciseCategory, string> = {
  chest: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  back: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  shoulders: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  arms: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  legs: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  core: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  cardio: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

export function Badge({ className, variant = 'default', category, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    primary: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    category: category ? categoryColors[category] : '',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
