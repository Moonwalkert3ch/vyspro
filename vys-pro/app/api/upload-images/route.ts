import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(process.cwd(), 'gcp-key.json'),
});
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uniqueName = `${uuidv4()}-${file.name}`;
      const tempFilePath = path.join(os.tmpdir(), uniqueName);
      fs.writeFileSync(tempFilePath, buffer);

      await bucket.upload(tempFilePath, {
        destination: `uploads/${uniqueName}`,
        metadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000',
        },
        public: true,
      });

      fs.unlinkSync(tempFilePath);

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${uniqueName}`;
      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({ imageUrls: uploadedUrls });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images.' }, { status: 500 });
  }
}
