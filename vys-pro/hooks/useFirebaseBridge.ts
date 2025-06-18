'use client'

import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { getDatabase, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const firebaseAuth = getAuth(app)
const realtimeDB = getDatabase(app)

export function useFirebaseBridge() {
  const { isSignedIn, getToken, userId } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const signIntoFirebase = async () => {
      if (!isSignedIn || !userId || !user) return

      try {
        const token = await getToken({ template: 'integration_firebase' })
        if (!token) {
          console.warn('No Firebase token from Clerk')
          return
        }

        // ✅ Sign into Firebase Auth with Clerk token
        await signInWithCustomToken(firebaseAuth, token)
        console.log('✅ Signed in to Firebase')

        // ✅ Sync user info to Realtime Database
        await set(ref(realtimeDB, `users/${userId}`), {
          id: userId,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: new Date().toISOString(),
        })

        console.log('✅ Synced user to Realtime Database')
      } catch (err) {
        console.error('❌ Firebase sign-in or sync failed:', err)
      }
    }

    signIntoFirebase()
  }, [isSignedIn, getToken, userId, user])
}

// This hook bridges Clerk authentication with Firebase
// by signing the user into Firebase using a custom token provided by Clerk.
// It ensures that Firebase is initialized only once and listens for changes in the Clerk authentication state.
