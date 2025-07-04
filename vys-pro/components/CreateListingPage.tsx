// app/create-listing/page.tsx
'use client';

import { ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth, RedirectToSignIn } from '@clerk/nextjs';
import BottomNavBar from '@/components/BottomNavBar';
import FooterPage from '@/components/FooterPage';

export default function CreateListingPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  // 1) Wait for Clerk to initialize
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        Loading…
      </div>
    );
  }
  // 2) Redirect to sign-in if not authenticated
  if (!userId) {
    return <RedirectToSignIn redirectUrl="/create-listing" />;
  }

  // Auth is good, render the form
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'ship'>('pickup');
  const [loading, setLoading] = useState(false);

  async function startImageFlow() {
    setLoading(true);
    try {
      // 1) initiate draft on the server
      const res = await fetch('/api/listings/initiate', { method: 'POST' });
      if (!res.ok) throw new Error('Could not initiate listing');
      const { listingId } = await res.json();

      // 2) store the draft ID
      sessionStorage.setItem('listingId', listingId);

      // 3) immediately update the draft with your form values
      const details = {
        title: itemName,
        description: itemDescription,
        price: parseFloat(price) || 0,
        is_available: isAvailable,
        delivery_method: deliveryMethod.toUpperCase(),
      };
      const upd = await fetch(`/api/listings/${listingId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (!upd.ok) throw new Error('Could not save listing details');

      // 4) save those same details for your next steps (optional)
      sessionStorage.setItem('listingDetails', JSON.stringify(details));

      // 5) move on to image upload
      router.push('/upload-image');
    } catch (err) {
      console.error(err);
      alert('Failed to start listing. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="min-h-screen w-full bg-indigo-950 text-[#A1C9FF] flex flex-col items-center px-4 pb-32">
        {/* Header */}
        <div className="w-full flex items-center justify-between py-4 max-w-screen-md">
          <button onClick={() => router.back()}>
            <ArrowLeft className="text-[#A1C9FF] h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 -ml-6">CREATE LISTING</h1>
        </div>

        {/* Image Capture Section */}
        <div className="w-full max-w-md flex flex-col gap-4 mb-6">
          <button
            onClick={startImageFlow}
            disabled={loading}
            className="bg-white w-full aspect-square flex items-center justify-center rounded-md hover:brightness-95 transition"
          >
            <Camera className="h-10 w-10 text-black mb-2" />
            <span className="text-black font-medium">Capture Images/Video</span>
          </button>

          <button
            onClick={startImageFlow}
            disabled={loading}
            aria-label="Add more images"
            className="w-20 h-20 flex items-center justify-center bg-white text-black shadow hover:brightness-95 transition"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>

        {/* Form */}
        <div className="w-full max-w-md space-y-4 mb-6">
          {/* Delivery Method */}
          <label className="block text-lg font-bold text-[#A1C9FF]">Delivery Method:</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="delivery"
                value="pickup"
                checked={deliveryMethod === 'pickup'}
                onChange={() => setDeliveryMethod('pickup')}
                className="form-radio"
              />
              <span className="text-sm">Pick up only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="delivery"
                value="ship"
                checked={deliveryMethod === 'ship'}
                onChange={() => setDeliveryMethod('ship')}
                className="form-radio"
              />
              <span className="text-sm">Ship only</span>
            </label>
          </div>

          {/* Price & Availability */}
          <h3 className="text-lg font-bold">Price</h3>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-36 px-4 py-3 rounded-md text-black"
            />
            <label className="flex items-center gap-2">
              <span className="text-sm">Available</span>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={() => setIsAvailable((v) => !v)}
                className="form-checkbox"
              />
            </label>
          </div>

          {/* Name with AI */}
          <h3 className="text-lg font-bold">Product Name</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              className="flex-1 px-4 py-3 rounded-md text-black"
            />
            <a
              href="/create-generate-name"
              className="bg-gradient-to-r from-red-500 to-blue-500 text-white text-xs px-3 py-2 rounded-md flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Generate
            </a>
          </div>

          {/* Description with AI */}
          <h3 className="text-lg font-bold">Product Description</h3>
          <div className="relative">
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              placeholder="Enter item description"
              className={`w-full px-4 py-3 rounded-md text-black resize-none transition ${
                isDescriptionFocused ? 'h-48' : 'h-24'
              }`}
            />
            <a
              href="/create-generate-description"
              className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-blue-500 text-white text-xs px-2 py-1 rounded-md flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI
            </a>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <button
            onClick={startImageFlow}
            disabled={loading}
            className="bg-[#052958] hover:bg-indigo-950 text-[#A1C9FF] font-semibold py-2 px-6 rounded-full transition"
          >
            {loading ? 'Starting…' : 'Next'}
          </button>
        </div>
      </main>

      <FooterPage />
      <BottomNavBar />
    </>
  );
}
