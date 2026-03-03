import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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
