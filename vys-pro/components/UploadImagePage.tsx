'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, Plus, ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageCropModal from '@/components/ImageCropModal';
import BottomNavBar from './BottomNavBar';

export default function UploadImagePage() {
  const router = useRouter();

  // listingId: undefined = loading, null = not found, string = actual ID
  const [listingId, setListingId] = useState<string | null | undefined>(undefined);

  // Image & crop state
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load listingId once
  useEffect(() => {
    const id = sessionStorage.getItem('listingId');
    setListingId(id);  // will be string or null
  }, []);

  // 1) Still loading?
  if (listingId === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        Loading…
      </div>
    );
  }

  // 2) No draft in progress
  if (listingId === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-950 text-white">
        <p className="mb-4">No listing in progress. Please start from Create Listing.</p>
        <button
          onClick={() => router.push('/create-listing')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Create Listing
        </button>
      </div>
    );
  }

  // Handlers
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const idx = images.findIndex((img) => img === null);
    if (idx !== -1) {
      setPendingFile(file);
      setCropIndex(idx);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const arr = [...prev];
      arr[idx] = null;
      return arr;
    });
  };

  const onCancelCrop = () => {
    setPendingFile(null);
    setCropIndex(null);
  };

  const onCompleteCrop = (blob: Blob) => {
    if (pendingFile && cropIndex !== null) {
      const croppedFile = new File([blob], pendingFile.name, { type: pendingFile.type });
      setImages((prev) => {
        const arr = [...prev];
        arr[cropIndex] = croppedFile;
        return arr;
      });
    }
    setPendingFile(null);
    setCropIndex(null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('listingId', listingId);
    images.forEach((img) => img && formData.append('images', img));

    try {
      const res = await fetch('/api/upload-images', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { imageUrls } = await res.json();
      sessionStorage.setItem('uploadedImageUrls', JSON.stringify(imageUrls));
      console.log('Images uploaded successfully');
      router.push('/3d-model');
    } catch (err) {
      console.error(err);
      alert('Failed to upload images. Please try again.');
    }
  };

  return (
    <>
      <main className="min-h-screen bg-indigo-950 text-[#A1C9FF] p-4 pb-32 flex flex-col items-center">
        <div className="w-full max-w-md flex items-center justify-center py-4 relative">
          <button onClick={() => router.back()} className="absolute left-0">
            <ArrowLeft className="h-6 w-6 text-[#A1C9FF]" />
          </button>
          <h1 className="text-2xl font-bold">UPLOAD IMAGES</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white aspect-square rounded-md flex items-center justify-center cursor-pointer"
          >
            <Camera className="h-8 w-8 text-black" />
          </div>
          {images.map((img, i) => (
            <div key={i} className="bg-white aspect-square rounded-md relative">
              {img ? (
                <>
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`Uploaded ${i}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full rounded-md"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-black" />
                  </button>
                </>
              ) : (
                <Plus className="h-6 w-6 text-black m-auto" />
              )}
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageCapture}
        />

        <div className="mt-10">
          <button
            onClick={handleSubmit}
            className="bg-[#052958] hover:bg-indigo-900 text-[#A1C9FF] py-2 px-6 rounded-full transition"
            disabled={!images.some((i) => i !== null)}
          >
            Submit Images
          </button>
        </div>
      </main>

      <BottomNavBar />

      {pendingFile && cropIndex !== null && (
        <ImageCropModal
          imageFile={pendingFile}
          onCancel={onCancelCrop}
          onComplete={onCompleteCrop}
        />
      )}
    </>
  );
}
