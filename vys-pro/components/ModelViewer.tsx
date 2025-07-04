// components/ModelViewer.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export default function ModelViewer({ url }: { url: string }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { progress } = useProgress();
  const loaderRef = useRef<GLTFLoader | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Proxy through our API to avoid CORS
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Failed to fetch model');
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);

        loaderRef.current = new GLTFLoader();
        interface GLTF {
          scene: THREE.Group;
          scenes: THREE.Group[];
          cameras: THREE.Camera[];
          animations: THREE.AnimationClip[];
          asset: any;
          parser: any;
          userData: any;
        }

        interface ProgressEvent {
          lengthComputable: boolean;
          loaded: number;
          total: number;
        }

        loaderRef.current.load(
          objUrl,
          (gltf: GLTF) => {
            if (isMounted) {
              gltf.scene.scale.set(0.5, 0.5, 0.5);
              setModel(gltf.scene);
              setLoading(false);
            }
            URL.revokeObjectURL(objUrl);
          },
          undefined,
          (e: ErrorEvent | Error) => {
            if (isMounted) {
              console.error(e);
              setError('Failed to load 3D model');
              setLoading(false);
            }
            URL.revokeObjectURL(objUrl);
          }
        );
      } catch (e) {
        if (isMounted) {
          console.error(e);
          setError('Failed to load 3D model');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
      loaderRef.current?.manager?.handlers.clear?.();
    };
  }, [url]);

  const Inner = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
      if (ref.current) ref.current.rotation.y += 0.005;
    });
    return model ? <primitive ref={ref} object={model} /> : null;
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-80 z-10">
          <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-gray-600">Loading {Math.round(progress)}%</p>
        </div>
      )}
      <Canvas
        camera={{ position: [1, 1, 2], fov: 75, near: 0.1, far: 1000 }}
        onCreated={({ gl }) => gl.setClearColor('#f3f4f6')}
      >
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Suspense fallback={null}>
          <Inner />
          <OrbitControls minDistance={0.5} maxDistance={5} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
