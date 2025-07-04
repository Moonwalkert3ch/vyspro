import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/src/generated/prisma';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const storage = new Storage();
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const formData = await req.formData();
  const listingId = formData.get('listingId');
  if (typeof listingId !== 'string')
    return new NextResponse('Missing listingId', { status: 400 });

  // Verify the listing belongs to this user
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { users: true },
  });
  if (!listing || listing.users.clerk_id !== userId)
    return new NextResponse('Forbidden', { status: 403 });

  const files = formData.getAll('images') as File[];
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueName = `${uuidv4()}-${file.name}`;
    const tmpPath = path.join(os.tmpdir(), uniqueName);
    fs.writeFileSync(tmpPath, buffer);

    await bucket.upload(tmpPath, {
      destination: `uploads/${uniqueName}`,
      metadata: { contentType: file.type, cacheControl: 'public, max-age=31536000' },
    });
    fs.unlinkSync(tmpPath);

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${uniqueName}`;
    uploadedUrls.push(publicUrl);

    // Link to DB
    await prisma.listingImage.create({
      data: { listing_id: listingId, image_url: publicUrl },
    });
  }

  return NextResponse.json({ imageUrls: uploadedUrls });
}
