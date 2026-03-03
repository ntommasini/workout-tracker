import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EXERCISES } from '@/lib/exercises';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the most recent workout date for each exercise
  const exerciseHistory = await prisma.workoutExercise.groupBy({
    by: ['exerciseId'],
    where: { workout: { userId: session.user.id } },
    _count: { id: true },
  });

  // Get max values per exercise
  const maxValues = await Promise.all(
    exerciseHistory.map(async (eh) => {
      const maxWeight = await prisma.workoutSet.aggregate({
        where: {
          workoutExercise: {
            exerciseId: eh.exerciseId,
            workout: { userId: session.user.id },
          },
        },
        _max: { weightLbs: true, reps: true, durationSeconds: true },
      });

      const lastWorkout = await prisma.workoutExercise.findFirst({
        where: {
          exerciseId: eh.exerciseId,
          workout: { userId: session.user.id },
        },
        include: { workout: { select: { startTime: true } } },
        orderBy: { workout: { startTime: 'desc' } },
      });

      return {
        exerciseId: eh.exerciseId,
        lastWorkedAt: lastWorkout?.workout.startTime.toISOString() ?? null,
        maxWeightLbs: maxWeight._max.weightLbs ?? null,
        maxReps: maxWeight._max.reps ?? null,
        maxDurationSeconds: maxWeight._max.durationSeconds ?? null,
        totalSessions: eh._count.id,
      };
    })
  );

  // Build a map for quick lookup
  const statsMap = new Map(maxValues.map((s) => [s.exerciseId, s]));

  // Return all exercises with stats, sorted by lastWorkedAt desc then alphabetically
  const result = EXERCISES.map((ex) => ({
    ...statsMap.get(ex.id),
    exerciseId: ex.id,
    lastWorkedAt: statsMap.get(ex.id)?.lastWorkedAt ?? null,
    maxWeightLbs: statsMap.get(ex.id)?.maxWeightLbs ?? null,
    maxReps: statsMap.get(ex.id)?.maxReps ?? null,
    maxDurationSeconds: statsMap.get(ex.id)?.maxDurationSeconds ?? null,
    totalSessions: statsMap.get(ex.id)?.totalSessions ?? 0,
  })).sort((a, b) => {
    if (a.lastWorkedAt && b.lastWorkedAt) {
      return new Date(b.lastWorkedAt).getTime() - new Date(a.lastWorkedAt).getTime();
    }
    if (a.lastWorkedAt) return -1;
    if (b.lastWorkedAt) return 1;
    return 0;
  });

  return NextResponse.json(result);
}
