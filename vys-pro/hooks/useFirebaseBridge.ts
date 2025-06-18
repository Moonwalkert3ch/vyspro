// hooks/useFirebaseBridge.ts
'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase app

const app = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(app)

export function useFirebaseBridge() {
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    const signIntoFirebase = async () => {
      if (!isSignedIn) return

      const token = await getToken({ template: 'integration_firebase' })
      if (!token) return console.warn('No token returned from Clerk')

      try {
        await signInWithCustomToken(firebaseAuth, token)
        console.log('✅ Signed into Firebase with Clerk token')
      } catch (err) {
        console.error('❌ Firebase sign-in failed', err)
      }
    }

    signIntoFirebase()
  }, [isSignedIn, getToken])
}
// This hook will automatically sign the user into Firebase
// when they are signed in with Clerk, using the custom token provided by Clerk.
// You can use this hook in your components to ensure Firebase is ready for use.
// Make sure to replace the firebaseConfig with your actual Firebase project configuration.