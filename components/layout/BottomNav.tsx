'use client';

import { cn } from '@/lib/utils';
import { Dumbbell, History, ListCollapse } from 'lucide-react';

const tabs = [
  { id: 'log', label: 'Log', icon: Dumbbell },
  { id: 'history', label: 'History', icon: History },
  { id: 'exercises', label: 'Exercises', icon: ListCollapse },
] as const;

type Tab = (typeof tabs)[number]['id'];

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="max-w-2xl mx-auto px-2 flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-3 transition-all duration-200',
                isActive
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(isActive && 'scale-110 transition-transform')}
              />
              <span className={cn('text-xs', isActive ? 'font-semibold' : 'font-medium')}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export type { Tab };
