// src/app/api/listings/initiate/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  let userId: string;

  // Development bypass: skip Clerk auth in development
  if (process.env.NODE_ENV === 'development') {
    if (process.env.DEV_CLERK_ID) {
      userId = process.env.DEV_CLERK_ID;
    } else {
      const testUser = await prisma.user.findFirst();
      if (!testUser) {
        return NextResponse.json({ error: 'No test user found in development.' }, { status: 500 });
      }
      userId = testUser.clerk_id;
    }
  } else {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = authUserId;
  }

  // Ensure the user exists in our database
  const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
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
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ listingId: draft.id });
}

export async function GET() {
  return NextResponse.json({ message: 'Initiate route is ready' });
}