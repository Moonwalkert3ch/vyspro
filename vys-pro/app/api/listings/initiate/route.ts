import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the user exists in our database
  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Create a draft listing
  const draft = await prisma.listing.create({
    data: {
      user_id: user.id,
      title: '',
      description: '',
      price: 0,
      status: 'draft',
    },
  });

  return NextResponse.json({ listingId: draft.id });
}
export async function GET() {
  return NextResponse.json({ message: 'Initiate route is ready' });
}
