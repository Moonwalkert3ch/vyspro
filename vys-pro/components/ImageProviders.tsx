// src/components/ImageProviders.tsx
'use client';
import { ImageProvider } from '../context/ImageContext';

export function ImageProviders({ children }: { children: React.ReactNode }) {
  return <ImageProvider>{children}</ImageProvider>;
}
