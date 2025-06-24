import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST() {
  try {
    // Use public placeholder images (different angles of the same object)
    const imageUrls = [
      'https://storage.googleapis.com/vyspro_images/turtle_1.JPG',
      'https://storage.googleapis.com/vyspro_images/turtle_2.JPG',
      'https://storage.googleapis.com/vyspro_images/turtle_3.JPG',
      'https://storage.googleapis.com/vyspro_images/turtle_4.JPG'
      ];

    // Create Meshy task
    const meshyResponse = await fetch(
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

    if (!meshyResponse.ok) {
      const error = await meshyResponse.text();
      return NextResponse.json(
        { error: `Meshy API: ${error}` },
        { status: meshyResponse.status }
      );
    }

    const { result: taskId } = await meshyResponse.json() as { result: string };
    return NextResponse.json({ taskId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
