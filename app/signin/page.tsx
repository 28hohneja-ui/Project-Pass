'use client';

import { useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect to home
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect to home after successful sign-in
      router.push('/');
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-netpass-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-netpass-primary mb-4">
            Streetpass
          </h1>
          <p className="text-lg text-netpass-dark mb-2">
            Discover people nearby
          </p>
          <p className="text-sm text-gray-600">
            A location-based social app inspired by Nintendo Streetpass
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-netpass-accent">
          <h2 className="text-2xl font-bold text-netpass-primary mb-6 text-center">
            Get Started
          </h2>

          <div className="space-y-4 mb-8">
            <p className="text-sm text-netpass-dark text-center">
              Sign in with your Google account to start discovering people around you.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-netpass-accent hover:bg-netpass-light text-netpass-dark font-semibold rounded-lg transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t-2 border-netpass-accent"></div>
            <span className="px-4 text-xs text-gray-600">or continue as guest</span>
            <div className="flex-grow border-t-2 border-netpass-accent"></div>
          </div>

          <button
            onClick={() => {
              // Create anonymous profile
              localStorage.setItem('streetpass_guest_mode', 'true');
              router.push('/');
            }}
            className="w-full px-6 py-4 bg-netpass-light hover:bg-netpass-accent text-netpass-dark font-semibold rounded-lg transition-all border-2 border-netpass-accent"
          >
            Continue as Guest
          </button>
        </div>

        {/* Info section */}
        <div className="mt-12 space-y-4 text-sm text-netpass-dark">
          <div className="bg-white rounded-lg p-4 border-l-4 border-netpass-secondary">
            <h3 className="font-semibold mb-2">How it works</h3>
            <p className="text-xs">
              Enable location services and walk around. When you pass near another player, you both exchange avatars and messages.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-netpass-primary">
            <h3 className="font-semibold mb-2">Privacy</h3>
            <p className="text-xs">
              Your location is only used for proximity matching. We do not store location history or share your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
