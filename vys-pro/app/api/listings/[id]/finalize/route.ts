import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const listingId = params.id;
  const body = await req.json();
  const { title, description, price, imageUrls, modelUrls } = body as {
    title: string;
    description?: string;
    price: number;
    imageUrls: string[];
    modelUrls: string[];
  };

  // Validate user and listing ownership
  const user = await prisma.user.findUnique({ where: { clerk_id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || existing.user_id !== user.id || existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Listing not found, not yours, or not in draft state' },
      { status: 404 }
    );
  }

  // Finalize the listing
  const finalized = await prisma.listing.update({
    where: { id: listingId },
    data: {
      title,
      description,
      price,
      status: 'active',
      images: {
        create: imageUrls.map((url) => ({ image_url: url })),
      },
      models: {
        create: modelUrls.map((url) => ({ model_url: url, status: 'pending' })),
      },
    },
    include: { images: true, models: true },
  });

  return NextResponse.json(finalized);
}
