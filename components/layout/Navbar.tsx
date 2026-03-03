'use client';

import { ThemeToggle } from './ThemeToggle';
import { signOut } from 'next-auth/react';
import { LogOut, Dumbbell, User } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  userName?: string | null;
}

export function Navbar({ userName }: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white tracking-tight">
            GainLog
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <User size={13} className="text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-24 truncate">
                {userName ?? 'Account'}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
