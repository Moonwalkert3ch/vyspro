// app/api/listings/[id]/models/[modelId]/status/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; modelId: string }> }
) {
  const { id: listingId, modelId } = await context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  // Load the model record, ensure ownership
  const record = await prisma.listingModel.findUnique({
    where: { id: modelId },
    include: { listing: { include: { users: true } } },
  });
  if (
    !record ||
    record.listing.id !== listingId ||
    record.listing.users.clerk_id !== userId
  ) {
    return new NextResponse('Not found or forbidden', { status: 404 });
  }
  const jobId = record.meshy_job_id;
  if (!jobId) {
    return NextResponse.json(
      { error: 'No Mesy job ID found on this record' },
      { status: 400 }
    );
  }

  // Call Meshy status endpoint
  const statusRes = await fetch(
    `https://api.meshy.ai/v1/image-to-3d/${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
      },
    }
  );
  const data = await statusRes.json();

  if (!statusRes.ok) {
    return NextResponse.json(
      { error: data.message || 'Failed to check Meshy status' },
      { status: statusRes.status }
    );
  }

  // If completed, update our record
  if (data.status === 'COMPLETED') {
    // pick one of the model URLs (e.g. glTF)
    const url = Array.isArray(data.model_urls)
      ? data.model_urls[0]
      : data.model_urls.gltf || '';
    await prisma.listingModel.update({
      where: { id: modelId },
      data: { model_status: 'COMPLETED', model_url: url },
    });
  } else if (data.status === 'ERROR') {
    await prisma.listingModel.update({
      where: { id: modelId },
      data: { model_status: 'ERROR' },
    });
  }

  // Return full Meshy payload so frontend can show progress, etc.
  return NextResponse.json({
    status: data.status,
    progress: data.progress,
    model_urls: data.model_urls,
    texture_urls: data.texture_urls,
    thumbnail_url: data.thumbnail_url,
    error: data.task_error?.message || '',
  });
}
