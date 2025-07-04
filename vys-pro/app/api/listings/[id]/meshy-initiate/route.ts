// app/api/listings/[id]/meshy-initiate/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  // Verify listing belongs to this user and gather images
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true, users: true },
  });
  if (!listing || listing.users.clerk_id !== userId) {
    return new NextResponse('Not found or forbidden', { status: 404 });
  }
  const imageUrls = listing.images.map((img) => img.image_url);

  // Call Meshy API
  const meshyRes = await fetch(
    'https://api.meshy.ai/openapi/v1/multi-image-to-3d',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_urls: imageUrls,
        should_texture: true,
        topology: 'quad',
        target_polycount: 10000,
      }),
    }
  );
  if (!meshyRes.ok) {
    const err = await meshyRes.text();
    return NextResponse.json(
      { error: `Meshy API: ${err}` },
      { status: meshyRes.status }
    );
  }
  const { result: jobId } = (await meshyRes.json()) as { result: string };

  // Persist a new ListingModel record
  const model = await prisma.listingModel.create({
    data: {
      listing_id: listingId,
      meshy_job_id: jobId,
      model_status: 'PENDING',
      model_url: '' // will fill in later
    },
  });

  return NextResponse.json({ modelId: model.id, jobId });
}
