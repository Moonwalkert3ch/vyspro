'use client';

import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';

interface Props {
  imageFile: File;
  onCancel: () => void;
  onComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropModal({ imageFile, onCancel, onComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const onCropComplete = useCallback(
    (_croppedArea: CroppedArea, areaPixels: CroppedArea) => {
      setCroppedAreaPixels(areaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const imageDataUrl = URL.createObjectURL(imageFile);
    const img = await createImage(imageDataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const { width, height, x, y } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    canvas.toBlob(blob => {
      if (blob) onComplete(blob);
    }, imageFile.type);
  }, [croppedAreaPixels, imageFile, onComplete]);

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden w-80 h-96 flex flex-col">
        {/* Crop area */}
        <div className="relative flex-1">
          <Cropper
            image={URL.createObjectURL(imageFile)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        {/* Controls */}
        <div className="flex justify-end gap-2 p-2 bg-gray-100">
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={showCroppedImage}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
  });
}
