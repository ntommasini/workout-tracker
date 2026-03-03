import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { exerciseId } = await params;

  const maxValues = await prisma.workoutSet.aggregate({
    where: {
      workoutExercise: {
        exerciseId,
        workout: { userId: session.user.id },
      },
    },
    _max: { weightLbs: true, reps: true, durationSeconds: true, distanceMiles: true },
  });

  // Find the set with the best weight (for the date)
  const bestWeightSet = maxValues._max.weightLbs
    ? await prisma.workoutSet.findFirst({
        where: {
          workoutExercise: {
            exerciseId,
            workout: { userId: session.user.id },
          },
          weightLbs: maxValues._max.weightLbs,
        },
        include: {
          workoutExercise: {
            include: { workout: { select: { startTime: true } } },
          },
        },
      })
    : null;

  const bestRepsSet = maxValues._max.reps
    ? await prisma.workoutSet.findFirst({
        where: {
          workoutExercise: {
            exerciseId,
            workout: { userId: session.user.id },
          },
          reps: maxValues._max.reps,
        },
        include: {
          workoutExercise: {
            include: { workout: { select: { startTime: true } } },
          },
        },
      })
    : null;

  return NextResponse.json({
    maxWeightLbs: maxValues._max.weightLbs,
    maxReps: maxValues._max.reps,
    maxDurationSeconds: maxValues._max.durationSeconds,
    maxDistanceMiles: maxValues._max.distanceMiles,
    bestWeightDate: bestWeightSet?.workoutExercise.workout.startTime.toISOString() ?? null,
    bestRepsDate: bestRepsSet?.workoutExercise.workout.startTime.toISOString() ?? null,
  });
}
