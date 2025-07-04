import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url', { status: 400 });
  }

  // Fetch the remote resource server-side
  const res = await fetch(url);
  if (!res.ok) {
    return new NextResponse(`Upstream error ${res.status}`, { status: res.status });
  }
  const buffer = await res.arrayBuffer();

  // Return as generic binary—GLTFLoader will handle it
  return new NextResponse(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}
