'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav, type Tab } from '@/components/layout/BottomNav';
import { NewWorkout } from '@/components/workout/NewWorkout';
import { WorkoutHistory } from '@/components/history/WorkoutHistory';
import { ExerciseList } from '@/components/exercises/ExerciseList';

export default function HomePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('log');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleWorkoutSaved = () => {
    setHistoryRefreshKey((k) => k + 1);
    // Brief delay so user sees the summary first, then auto-switches to history
    setTimeout(() => setActiveTab('history'), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar userName={session?.user?.name} onLogoClick={() => setActiveTab('log')} />

      <main className="max-w-2xl mx-auto">
        {/* Log Tab */}
        <div className={activeTab === 'log' ? 'block' : 'hidden'}>
          <NewWorkout onWorkoutSaved={handleWorkoutSaved} />
        </div>

        {/* History Tab */}
        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <WorkoutHistory refreshKey={historyRefreshKey} />
        </div>

        {/* Exercises Tab */}
        <div className={activeTab === 'exercises' ? 'block' : 'hidden'}>
          <ExerciseList refreshKey={historyRefreshKey} />
        </div>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
