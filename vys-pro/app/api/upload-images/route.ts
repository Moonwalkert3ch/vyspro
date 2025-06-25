import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Storage } = require('@google-cloud/storage');

// Initialize GCP Storage Client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(process.cwd(), 'gcp-key.json'), // This resolves the key file path
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a temporary file
      const tempFilePath = path.join(os.tmpdir(), file.name);
      fs.writeFileSync(tempFilePath, buffer);

      // Upload to GCP bucket
      await bucket.upload(tempFilePath, {
        destination: `uploads/${file.name}`,
        metadata: {
          contentType: file.type,
        },
      });

      // Clean up local temp file
      fs.unlinkSync(tempFilePath);
    }

    return NextResponse.json({ message: 'Files uploaded successfully.' });
 } catch (error: unknown) {
  let errorMessage = 'Failed to upload images.';
  if (error instanceof Error) {
    errorMessage = error.message;
    console.error('Upload Error:', error.message, error);
  } else {
    console.error('Upload Error:', error);
  }
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}

}
