'use client';

import { useRef, useState } from 'react';
import { Camera, Plus, ArrowLeft, X } from 'lucide-react';
import BottomNavBar from './BottomNavBar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageCropModal from '@/components/ImageCropModal';

export default function UploadImagePage() {
  const router = useRouter();
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const index = images.findIndex(img => img === null);
    if (index !== -1) {
      setPendingFile(file);
      setCropIndex(index);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const onCancelCrop = () => {
    setPendingFile(null);
    setCropIndex(null);
  };

  const onCompleteCrop = (blob: Blob) => {
    if (pendingFile && cropIndex !== null) {
      const croppedFile = new File([blob], pendingFile.name, { type: pendingFile.type });
      const newImages = [...images];
      newImages[cropIndex] = croppedFile;
      setImages(newImages);
    }
    setPendingFile(null);
    setCropIndex(null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    images.forEach(img => img && formData.append('images', img));
    try {
      const res = await fetch('/api/upload-images', { method: 'POST', body: formData });
      if (!res.ok) { console.error('Upload failed'); return; }
      const { imageUrls } = await res.json();
      sessionStorage.setItem('uploadedImageUrls', JSON.stringify(imageUrls));
      router.push('/3d-model');
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };

  return (
    <>
      <main className="min-h-screen w-full bg-indigo-950 text-[#A1C9FF] flex flex-col p-4 pb-32 items-center">
        <div className="relative w-full max-w-screen-md flex items-center justify-center h-12 mt-4 mb-6">
          <button onClick={() => router.back()} className="absolute left-0">
            <ArrowLeft className="text-[#A1C9FF] h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-center">UPLOAD IMAGES</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md justify-center">
          <div onClick={() => fileInputRef.current?.click()} className="bg-white aspect-square flex items-center justify-center rounded-md cursor-pointer">
            <Camera className="h-8 w-8 text-black" />
          </div>
          {images.map((img, i) => (
            <div key={i} className="bg-white aspect-square relative flex items-center justify-center rounded-md">
              {img ? (
                <>
                  <Image src={URL.createObjectURL(img)} alt={`Uploaded ${i}`} className="object-cover w-full h-full rounded-md" width={200} height={200} />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                    <X className="w-4 h-4 text-black" />
                  </button>
                </>
              ) : (
                <Plus className="h-6 w-6 text-black" />
              )}
            </div>
          ))}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />

        <div className="flex justify-center mt-10 mb-10">
          <button onClick={handleSubmit} className="bg-[#052958] hover:bg-indigo-900 text-[#A1C9FF] font-semibold py-2 px-6 rounded-full transition duration-200 w-40">
            Submit
          </button>
        </div>
      </main>
      <BottomNavBar />
      {pendingFile && cropIndex !== null && (
        <ImageCropModal imageFile={pendingFile} onCancel={onCancelCrop} onComplete={onCompleteCrop} />
      )}
    </>
  );
}
