// src/app/api/listings/initiate/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // 1) Enforce Clerk auth
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  // 2) See if we already have this user in our DB
  let user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });

  // 3) If not, pull from Clerk API and create
  if (!user) {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (!clerkRes.ok) {
      console.error('Clerk lookup failed', await clerkRes.text());
      return new NextResponse('Failed to sync user', { status: 500 });
    }
    const clerkUser = await clerkRes.json();
    user = await prisma.user.create({
      data: {
        clerk_id: userId,
        email: clerkUser.email_addresses[0].email_address,
      },
    });
  }

  // 4) Create the draft listing tied to that user
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
