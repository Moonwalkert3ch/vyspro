'use client'

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Suspense } from 'react';
import { GLTFLoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';

function GlassesModel() {
  const gltf = useLoader(GLTFLoader, '/assets/models/3d-glasses.gltf');
  return <primitive object={gltf.scene} scale={2.5} />;
}

export default function GlassesCanvas() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.8}>
          <GlassesModel />
        </Stage>
        <OrbitControls enableZoom={false} />
      </Suspense>
    </Canvas>
  );
}
