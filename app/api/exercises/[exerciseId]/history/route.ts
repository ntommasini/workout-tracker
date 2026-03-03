import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type WorkoutExerciseWithDetails = Prisma.WorkoutExerciseGetPayload<{
  include: {
    workout: { select: { id: true; startTime: true } };
    sets: true;
  };
}>;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { exerciseId } = await params;

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: {
      exerciseId,
      workout: { userId: session.user.id },
    },
    include: {
      workout: { select: { id: true, startTime: true } },
      sets: { orderBy: { setNumber: 'asc' } },
    },
    orderBy: { workout: { startTime: 'desc' } },
  });

  const history = workoutExercises.map((we: WorkoutExerciseWithDetails) => ({
    workoutId: we.workout.id,
    workoutDate: we.workout.startTime.toISOString(),
    sets: we.sets,
  }));

  return NextResponse.json(history);
}
