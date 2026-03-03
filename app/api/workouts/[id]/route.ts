import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EXERCISE_MAP } from '@/lib/exercises';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(workout);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { exercises } = await req.json();

  // Recalculate totals and PRs (compare against OTHER workouts, not this one)
  let totalWeight = 0;
  let prsCount = 0;

  const exerciseIds = [...new Set(exercises.map((e: { exerciseId: string }) => e.exerciseId))];
  const existingMaxes = await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      const maxWeight = await prisma.workoutSet.aggregate({
        where: {
          workoutExercise: {
            exerciseId: exerciseId as string,
            workout: { userId: session.user.id, NOT: { id } },
          },
        },
        _max: { weightLbs: true, reps: true, durationSeconds: true },
      });
      return { exerciseId, maxes: maxWeight._max };
    })
  );
  const maxMap = new Map(existingMaxes.map((e) => [e.exerciseId, e.maxes]));

  const exercisesWithPRs = exercises.map(
    (ex: { exerciseId: string; sets: { reps?: number; weightLbs?: number; durationSeconds?: number; distanceMiles?: number }[]; notes?: string }, idx: number) => {
      const def = EXERCISE_MAP.get(ex.exerciseId);
      const prevMaxes = maxMap.get(ex.exerciseId) ?? { weightLbs: null, reps: null, durationSeconds: null };

      let exerciseMaxWeight = prevMaxes.weightLbs ?? 0;
      let exerciseMaxReps = prevMaxes.reps ?? 0;
      let exerciseMaxDuration = prevMaxes.durationSeconds ?? 0;

      const setsWithPRs = ex.sets.map((set, setIdx) => {
        let isPR = false;
        if (def?.type === 'strength' && set.weightLbs != null) {
          totalWeight += (set.weightLbs ?? 0) * (set.reps ?? 1);
          if (set.weightLbs > exerciseMaxWeight) { isPR = true; exerciseMaxWeight = set.weightLbs; }
        } else if (def?.type === 'bodyweight' && set.reps != null) {
          if (set.reps > exerciseMaxReps) { isPR = true; exerciseMaxReps = set.reps; }
        } else if (def?.type === 'timed' && set.durationSeconds != null) {
          if (set.durationSeconds > exerciseMaxDuration) { isPR = true; exerciseMaxDuration = set.durationSeconds; }
        }
        if (isPR) prsCount++;
        return {
          setNumber: setIdx + 1,
          reps: set.reps ?? null,
          weightLbs: set.weightLbs ?? null,
          durationSeconds: set.durationSeconds ?? null,
          distanceMiles: set.distanceMiles ?? null,
          isPR,
        };
      });

      return { exerciseId: ex.exerciseId, order: idx, notes: ex.notes ?? null, sets: { create: setsWithPRs } };
    }
  );

  // Recalculate calories using original workout times
  const durationHours =
    (existing.endTime.getTime() - existing.startTime.getTime()) / 3_600_000;
  const cardioCount = exercises.filter(
    (e: { exerciseId: string }) => EXERCISE_MAP.get(e.exerciseId)?.type === 'cardio'
  ).length;
  const avgMET =
    exercises.length > 0
      ? (cardioCount * 7.0 + (exercises.length - cardioCount) * 3.5) / exercises.length
      : 3.5;
  const estimatedCalories = Math.round(avgMET * 70 * durationHours);

  // Replace all exercises/sets then update totals
  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });

  const updated = await prisma.workout.update({
    where: { id },
    data: {
      totalWeight,
      prsCount,
      estimatedCalories,
      exercises: { create: exercisesWithPRs },
    },
    include: {
      exercises: {
        include: { sets: { orderBy: { setNumber: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!workout) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.workout.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
