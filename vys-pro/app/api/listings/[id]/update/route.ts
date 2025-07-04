// app/api/listings/[id]/update/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 1. await the params promise
  const { id: listingId } = await context.params;

 // 2. parse the JSON body
  const { title, description, price, is_available, delivery_method } = await req.json();

  // 3. Load your user
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
  });
  if (!user) return new NextResponse('User not found', { status: 404 });

  // 4. Ownership check + update
  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { title, description, price, is_available, delivery_method },
  });

  return NextResponse.json(updated);
}
