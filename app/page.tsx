'use client';

import { useEffect, useState } from 'react';
import { getUserProfile, generateUserId, saveUserId } from '@/lib/storage';
import { UserProfile } from '@/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CharacterCreator from '@/components/CharacterCreator';
import EncounterHub from '@/components/EncounterHub';

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    // Check Firebase authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated
        setAuthUser(user);

        // Try to load profile from Firestore
        try {
          const profileRef = doc(db, 'users', user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const profile = profileSnap.data() as UserProfile;
            setUserProfile(profile);
          } else {
            // Profile doesn't exist yet, user needs to create it
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Failed to load profile from Firestore:', error);
          // Fall back to localStorage
          const localProfile = getUserProfile();
          if (localProfile) {
            setUserProfile(localProfile);
          }
        }
      } else {
        // User is not authenticated
        setAuthUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">StreetPass</h1>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Show character creator if no profile
  if (!userProfile || !authUser) {
    const handleProfileCreated = async (profile: {
      name: string;
      message: string;
      avatarUrl: string;
    }) => {
      if (!authUser) {
        alert('You must be signed in to create a profile');
        return;
      }

      try {
        const userProfile: UserProfile = {
          userId: authUser.uid,
          email: authUser.email || '',
          name: profile.name,
          message: profile.message,
          avatarUrl: profile.avatarUrl,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Save to Firestore
        await setDoc(doc(db, 'users', authUser.uid), userProfile);

        // Also save to localStorage for offline access
        localStorage.setItem('streetpass_profile', JSON.stringify(userProfile));

        setUserProfile(userProfile);
      } catch (error) {
        console.error('Failed to save profile:', error);
        alert('Failed to save profile. Please try again.');
      }
    };

    // If authenticated but no profile, show character creator
    if (authUser) {
      return <CharacterCreator onProfileCreated={handleProfileCreated} />;
    }

    // If not authenticated, show login screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-netpass-light to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-netpass-primary mb-4">StreetPass</h1>
          <p className="text-netpass-dark text-lg mb-8">Sign in to get started</p>
          <button
            onClick={() => {
              // Redirect to sign-in page
              window.location.href = '/signin';
            }}
            className="px-8 py-3 bg-netpass-primary hover:bg-netpass-dark text-white font-bold rounded-lg border-2 border-netpass-dark transition-all"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  // Show encounter hub if profile exists
  return <EncounterHub userProfile={userProfile} />;
}
