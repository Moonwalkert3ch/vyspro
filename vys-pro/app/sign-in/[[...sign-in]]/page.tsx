// import { SignIn } from '@clerk/nextjs';

// export default function Page() {
//   return (
//     <div className="flex min-h-screen items-center justify-center">
//         <SignIn appearance={{
//           elements: {
//             card: "sign-in-card-head bg p-6 rounded-xl shadow-xl",
//           },
//         }} />
//     </div>
//   );
// }
'use client'

import React from 'react';
import Link from 'next/link';
import * as Clerk from '@clerk/elements/common';
import dynamic from 'next/dynamic';
import * as SignIn from '@clerk/elements/sign-in';
import { useFirebaseBridge } from '@/hooks/useFirebaseBridge'


const GlassesCanvas = dynamic(() => import('@/components/GlassesCanvasPage'), { ssr: false });

export default function SignInPage() {
  // This component uses dynamic import to load the 3D model canvas
  // to ensure it only renders on the client side, avoiding SSR issues with Three.js.
  // The GlassesCanvas component is dynamically imported to prevent server-side rendering issues with Three.js.
  // The dynamic import is set to not render on the server side (ssr: false) to avoid issues with Three.js.
  // The GlassesCanvas component is dynamically imported to prevent server-side rendering issues with Three.js.
  useFirebaseBridge()

    return (
    <div className="flex justify-center items-center py-8 px-4 min-h-screen bg-gradient-to-b from-[#4D0002] to-[#00204B]">
      <div className="sign-in-card-head p-4 rounded-xl shadow-xl w-full max-w-md">     
        
        <SignIn.Root>
          {/* Step 1: Enter email */}
          <SignIn.Step name="start">
            {/* 3D Model Canvas */}
            <div className="w-full max-w-md h-[120px] overflow-hidden mb">

              <GlassesCanvas />
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-200 mb-4">LOGIN</h1>
              <div className="flex flex-col items-center gap-4">
                <Clerk.Field name="identifier" className="w-full max-w-xs">
                  <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">Email</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                  <Clerk.FieldError className="text-sm text-red-500" />
                </Clerk.Field>
                <SignIn.Action submit className="bg-purple-600 hover:bg-purple-700 text-gray-200 font-normal py-1 px-4 rounded-full transition duration-200">Continue</SignIn.Action>
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                  <div className="text-gray-300">sign in with</div>
                  <Clerk.Connection
                    name="google"
                    className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                  </Clerk.Connection>
  
                  <Clerk.Connection
                    name="microsoft"
                    className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                  </Clerk.Connection>
  
                  <Clerk.Connection
                    name="facebook"
                    className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                  </Clerk.Connection>
                </div>
              </div>
              <div className="mt-2 text-sm text-center text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                  SIGN-UP
                </Link>
              </div>
          </SignIn.Step>

          {/* Step 2: Either email code or password */}
          <SignIn.Step name="verifications">
            <SignIn.Strategy name="email_code">
              <div className="flex flex-col items-center text-gray-200 gap-4">
                <h1 className="font-Outfit font-extrabold text-gray-200 text-xl text-center mb-2">Check your email</h1>
                <p className="text-center text-sm">We sent a code to <SignIn.SafeIdentifier />.</p>

                <Clerk.Field name="code">
                  <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">Email code:</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                  <Clerk.FieldError className="text-sm text-red-500" />
                </Clerk.Field>

                <SignIn.Action submit className="bg-purple-700 hover:bg-purple-800 text-gray-200 font-normal py-1 px-4 rounded-full transition duration-200">Continue</SignIn.Action>
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                    <div className="text-gray-300">sign in with</div>
                    <Clerk.Connection
                      name="google"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="microsoft"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="facebook"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                      SIGN-UP
                    </Link>
                  </div>
              </div>
            </SignIn.Strategy>

            <SignIn.Strategy name="password">
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-center text-gray-200 mb-4">Enter your password</h1>

                <div className="flex flex-col items-center gap-4">
                <Clerk.Field name="password" className="w-full max-w-xs">
                  <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">Password</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                  <Clerk.FieldError className="text-sm text-red-500" />
                </Clerk.Field>

                <SignIn.Action submit className="bg-purple-600 hover:bg-purple-700 text-gray-200 font-normal py-1 px-4 mb-6 rounded-full transition duration-200">Sign In</SignIn.Action>
                <SignIn.Action navigate="forgot-password" className="text-sm text-purple-600 text-center underline">Forgot password?</SignIn.Action>
                
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                    <div className="text-gray-300">sign in with</div>
                    <Clerk.Connection
                      name="google"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="microsoft"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="facebook"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                      SIGN-UP
                    </Link>
                  </div>
                
                </div>
              </div>
            </SignIn.Strategy>

            <SignIn.Strategy name="reset_password_email_code">
              <div className="flex flex-col text-gray-200 items-center gap-4">
                <h1 className="text-xl font-bold text-center mb-2">Check your email</h1>
                <p className="text-center text-sm">We sent a code to <SignIn.SafeIdentifier />.</p>

                <Clerk.Field name="code">
                  <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">Email code:</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                  <Clerk.FieldError className="text-sm text-red-500" />
                </Clerk.Field>

                <SignIn.Action submit className="bg-purple-700 hover:bg-purple-800 text-gray-200 font-normal py-1 px-4 rounded-full transition duration-200">Continue</SignIn.Action>
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                    <div className="text-gray-300">sign in with</div>
                    <Clerk.Connection
                      name="google"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="microsoft"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="facebook"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                      SIGN-UP
                    </Link>
                  </div>
              
              </div>
            </SignIn.Strategy>
          </SignIn.Step>

          {/* Step 3: Forgot password */}
          <SignIn.Step name="forgot-password">
            <div className="flex flex-col text-gray-200 gap-4">
              <h1 className="text-xl font-bold text-center mb-1">Forgot your password?</h1>

              <SignIn.SupportedStrategy name="reset_password_email_code">
                <div className="bg-purple-700 hover:bg-purple-800 text-gray-200 font-normal w-sm py-1 px-4 rounded-full transition duration-200">
                  Reset password
                </div>
              </SignIn.SupportedStrategy>

              <SignIn.Action navigate="previous">
                <div className="bg-purple-700 hover:bg-purple-800 text-gray-200 font-normal py-1 px-4 rounded-full transition duration-200">
                  Go back
                </div>
              </SignIn.Action>
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                    <div className="text-gray-300">sign in with</div>
                    <Clerk.Connection
                      name="google"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="microsoft"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="facebook"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                      SIGN-UP
                    </Link>
                  </div>
            
            </div>
          </SignIn.Step>

          {/* Step 4: Reset password */}
          <SignIn.Step name="reset-password">
            <div className="flex flex-col gap-4">
              <h1 className="text-xl font-bold text-center text-gray-200 mb-2">Reset your password</h1>

              <Clerk.Field name="password">
                <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">New password</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                <Clerk.FieldError className="text-sm text-red-500" />
              </Clerk.Field>

              <Clerk.Field name="confirmPassword">
                <Clerk.Label className="font-Outfit font-extrabold text-gray-200 pl-2 mb-2">Confirm password</Clerk.Label>
                  <Clerk.Input className="w-full rounded-full text-black bg-blue-200 p-3" />
                <Clerk.FieldError className="text-sm text-red-500" />
              </Clerk.Field>
                  <div className="flex items-center justify-center font-bold text-xl mt-2">
                    <div className="text-gray-300">sign in with</div>
                    <Clerk.Connection
                      name="google"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="microsoft"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
    
                    <Clerk.Connection
                      name="facebook"
                      className="flex text-blue-400 font-medium hover:underline ml-2">
                        <Clerk.Icon className="w-6 h-6 self-center" />
                    </Clerk.Connection>
                  </div>
                  <div className="mt-2 text-sm text-center text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="text-purple-600 font-outfit font-extrabold hover:underline">
                      SIGN-UP
                    </Link>
                  </div>

              <SignIn.Action submit className="bg-purple-700 hover:bg-purple-800 text-gray-200 font-normal py-1 px-4 rounded-full transition duration-200 self-center">Reset password</SignIn.Action>
            </div>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  )
}