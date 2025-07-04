// app/3d-model/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ModelViewer from '@/components/ModelViewer';
import BottomNavBar from '@/components/BottomNavBar';

type MeshyStatus = {
  status: 'PENDING' | 'IN_PROGRESS' | 'RENDERING' | 'COMPLETED' | 'SUCCEEDED' | 'ERROR';
  progress?: number;
  model_urls?: string[] | Record<string, string>;
  thumbnail_url?: string;
  error?: string;
};

export default function ThreeDModelPage() {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [meshStatus, setMeshStatus] = useState<MeshyStatus | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('listingId');
    if (!id) {
      router.push('/create-listing');
      return;
    }
    setListingId(id);

    (async () => {
      const res = await fetch(`/api/listings/${id}/meshy-initiate`, { method: 'POST' });
      if (!res.ok) {
        console.error(await res.text());
        setMeshStatus({ status: 'ERROR', error: 'Initiation failed' });
        return;
      }
      const { modelId } = await res.json();
      setModelId(modelId);
      poll(id, modelId);
    })();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [router]);

  const poll = async (lid: string, mid: string) => {
    const res = await fetch(`/api/listings/${lid}/models/${mid}/status`);
    const data: MeshyStatus = await res.json();
    setMeshStatus(data);

    // continue polling while still in progress
    if (
      data.status === 'PENDING' ||
      data.status === 'IN_PROGRESS' ||
      data.status === 'RENDERING'
    ) {
      pollRef.current = setTimeout(() => poll(lid, mid), 5000);
    }
  };

  const isDone =
    meshStatus?.status === 'COMPLETED' || meshStatus?.status === 'SUCCEEDED';

  const glbUrl = (() => {
    if (!meshStatus?.model_urls) return null;

    if (!Array.isArray(meshStatus.model_urls)) {
      const obj = meshStatus.model_urls as Record<string, string>;
      if (obj.glb) return obj.glb;
      const vals = Object.values(obj);
      return vals[0] ?? null;
    }
    return meshStatus.model_urls[0] ?? null;
  })();

  console.log('▶️ meshStatus.model_urls:', meshStatus?.model_urls);
  console.log('▶️ chosen glbUrl:', glbUrl);

  return (
    <>
      <main className="min-h-screen w-full bg-indigo-950 text-[#A1C9FF] flex flex-col p-4 pb-32 items-center">
        <div className="w-full max-w-screen-md flex justify-center py-4">
          <h1 className="text-2xl font-bold">3D MODEL</h1>
        </div>

        {(!meshStatus ||
          meshStatus.status === 'PENDING' ||
          meshStatus.status === 'IN_PROGRESS' ||
          meshStatus.status === 'RENDERING') ? (
          <div className="flex flex-col items-center mt-16">
            <RotateCw className="animate-spin h-16 w-16 text-white" />
            <p className="mt-4 text-lg">
              {meshStatus?.progress != null
                ? `Rendering: ${Math.round(meshStatus.progress)}%`
                : 'Initializing...'}
            </p>
          </div>
        ) : meshStatus.status === 'ERROR' ? (
          <div className="flex flex-col items-center mt-16">
            <XCircle className="h-16 w-16 text-red-400" />
            <p className="mt-4 text-lg text-red-300">{meshStatus.error}</p>
          </div>
        ) : (
          <div className="w-full max-w-md h-[500px] mt-6">
            {glbUrl ? (
              <ModelViewer url={glbUrl} />
            ) : (
              <p className="text-center text-white">No .glb URL found</p>
            )}
          </div>
        )}

        <div className="mt-10 flex justify-center gap-10 w-full max-w-md">
          <button
            onClick={() => router.push('/edit-listing')}
            disabled={!isDone}
            className="flex flex-col items-center"
          >
            <CheckCircle
              className={`h-8 w-8 ${isDone ? 'text-green-400' : 'text-gray-600'}`}
            />
            <span className="text-sm mt-1">Accept</span>
          </button>
          <button
            onClick={() => {
              setMeshStatus(null);
              if (listingId && modelId) poll(listingId, modelId);
            }}
            className="flex flex-col items-center"
          >
            <RotateCw className="h-8 w-8 text-yellow-400" />
            <span className="text-sm mt-1">Retry</span>
          </button>
          <button
            onClick={() => router.push('/create-listing')}
            className="flex flex-col items-center"
          >
            <XCircle className="h-8 w-8 text-red-400" />
            <span className="text-sm mt-1">Cancel</span>
          </button>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
