'use client';

import WebcamCapture from '@/components/WebcamCapture';
import { useImageContext } from '@/context/ImageContext';
import { useState, useRef, useCallback } from 'react';
import { Camera, Plus, ArrowLeft } from 'lucide-react';
import BottomNavBar from './BottomNavBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadImagePage() {
  const router = useRouter();
  const { imgs, setImgs } = useImageContext();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleCapture = (img: string) => {
    setImgs(prev => {
      const next = [...prev];
      if (activeIndex !== null) next[activeIndex] = img;
      return next;
    });
    setActiveIndex(null);
  };

  return (
    <>
      <main className="min-h-screen w-full bg-indigo-950 text-[#A1C9FF] flex flex-col p-4 pb-32 items-center">
        {/* Header */}
        <div className="relative w-full max-w-screen-md flex items-center justify-center h-12 mt-4 mb-6">
          {/* Left Arrow */}
          <button
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="text-[#A1C9FF] h-6 w-6" />
          </button>

          {/* Centered Title */}
          <h1 className="text-2xl font-bold text-center">UPLOAD IMAGES</h1>
        </div>

        {/* Image Upload Grid */}
        {/* <div className="grid grid-cols-3 gap-4 w-full max-w-md justify-center"> */}
          {/* First Image Slot with Camera Icon */}
          {/* <div className="bg-white aspect-square flex items-center justify-center rounded-md">
            <Camera className="h-8 w-8 text-black" />
          </div> */}

          {/* 5 More Slots with Plus Icons */}
          {/* {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white aspect-square flex items-center justify-center rounded-md">
              <Plus className="h-6 w-6 text-black" />
            </div>
          ))} */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
            {imgs.map((src, i) => (
            <div
              key={i}
              className="aspect-square bg-white rounded-md flex items-center justify-center cursor-pointer"
              onClick={() => setActiveIndex(i)}
            >
              {src ? <img src={src} alt={`Slot ${i+1}`} className="object-cover w-full h-full" />
                   : <Camera className="w-8 h-8 text-black" />}
            </div>
            ))}
          </div>

        {/* Webcam Capture Modal */}
        {activeIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md">
              {/* <button onClick={capture} className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded">
                Capture
              </button> */}
              <WebcamCapture onCapture={handleCapture} />
              <button onClick={() => setActiveIndex(null)} className="mt-2 ml-2 text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-10 flex justify-center w-full">
          {/* <Link href="/3d-model"> */}
          {/* <button className="bg-[#052958] hover:bg-indigo-900 text-[#A1C9FF] outline font-semibold py-2 px-6 rounded-full transition duration-200 w-40"> */}
          <button
            type="button"
            className="bg-[#052958] hover:bg-indigo-900 text-[#A1C9FF] outline font-semibold py-2 px-6 rounded-full transition duration-200 w-40"
            onClick={() => {
              setActiveIndex(null);
              router.push('/3d-model');
            }}
          >
            Submit
          </button>
          {/* </Link> */}
        </div>
      </main>

      <BottomNavBar />
    </>
  );
}

// Compare this snippet from vys-app/src/components/3DModelPage.tsx: