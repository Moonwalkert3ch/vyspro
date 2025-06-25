'use client';

import { useRef, useState } from 'react';
import { Camera, Plus, ArrowLeft, X } from 'lucide-react';
import BottomNavBar from './BottomNavBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function UploadImagePage() {
  const router = useRouter();
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const index = images.findIndex((img) => img === null);
    if (index !== -1) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  return (
    <>
      <main className="min-h-screen w-full bg-indigo-950 text-[#A1C9FF] flex flex-col p-4 pb-32 items-center">
        {/* Header */}
        <div className="relative w-full max-w-screen-md flex items-center justify-center h-12 mt-4 mb-6">
          <button onClick={() => router.back()} className="absolute left-0">
            <ArrowLeft className="text-[#A1C9FF] h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-center">UPLOAD IMAGES</h1>
        </div>

        {/* Image Upload Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md justify-center">
          {/* Camera button slot */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white aspect-square flex items-center justify-center rounded-md cursor-pointer"
          >
            <Camera className="h-8 w-8 text-black" />
          </div>

          {/* Display up to 4 uploaded images or plus icon */}
          {images.map((img, i) => (
            <div key={i} className="bg-white aspect-square relative flex items-center justify-center rounded-md">
              {img ? (
                <>
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`Uploaded ${i}`}
                    className="object-cover w-full h-full rounded-md"
                    width={200}
                    height={200}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-black" />
                  </button>
                </>
              ) : (
                <Plus className="h-6 w-6 text-black" />
              )}
            </div>
          ))}
        </div>

        {/* Hidden input for camera capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageCapture}
        />

        {/* Submit Button */}
        <div className="mt-10  mb-10flex justify-center w-full">
          <Link href="/3d-model">
            <button className="bg-[#052958] hover:bg-indigo-900 text-[#A1C9FF] outline font-semibold py-2 px-6 rounded-full transition duration-200 w-40">
              Submit
            </button>
          </Link>
        </div>
      </main>

      <BottomNavBar />
    </>
  );
}


// Compare this snippet from vys-app/src/components/3DModelPage.tsx: