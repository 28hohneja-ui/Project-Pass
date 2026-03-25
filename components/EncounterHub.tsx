'use client';

import { useEffect, useState } from 'react';
import { UserProfile, EncounterDisplay } from '@/types';
import { getCurrentLocation, watchLocation } from '@/lib/location';
import PresenceService from '@/lib/presence';
import Encounters from './Encounters';

interface EncounterHubProps {
  userProfile: UserProfile;
}

export default function EncounterHub({ userProfile }: EncounterHubProps) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [encounters, setEncounters] = useState<EncounterDisplay[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [presenceService, setPresenceService] = useState<PresenceService | null>(
    null
  );

  // Initialize presence service
  useEffect(() => {
    const service = new PresenceService(userProfile);
    setPresenceService(service);

    return () => {
      service.stop();
    };
  }, [userProfile]);

  // Load encounters from Firestore
  useEffect(() => {
    const loadEncounters = async () => {
      try {
        const response = await fetch(`/api/encounters?userId=${userProfile.userId}`);
        if (response.ok) {
          const data = await response.json();
          setEncounters(data.encounters || []);
        }
      } catch (error) {
        console.error('Failed to load encounters:', error);
      }
    };

    loadEncounters();
    // Reload encounters every 30 seconds
    const interval = setInterval(loadEncounters, 30000);

    return () => clearInterval(interval);
  }, [userProfile.userId]);

  // Request location permission
  const handleEnableLocation = async () => {
    try {
      // Show message that permission prompt is coming
      alert('A permission prompt will appear. Please tap "Allow" to share your location with Streetpass.');
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setLocationGranted(true);
      setIsActive(true);

      if (presenceService) {
        presenceService.startPresence(location);
      }

      // Watch for location changes
      watchLocation(
        (newLocation) => {
          setCurrentLocation(newLocation);
          presenceService?.sendPresence(newLocation);
        },
        (error) => {
          console.error('Location watch error:', error);
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable location';
      console.error('Location error:', error);
      alert(errorMessage);
    }
  };

  const handleDisableLocation = () => {
    setIsActive(false);
    setLocationGranted(false);
    presenceService?.stop();
  };

  return (
    <div className="min-h-screen bg-netpass-light">
      {/* Header */}
      <header className="bg-white border-b-2 border-netpass-accent sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-netpass-primary">
                Streetpass
              </h1>
              <span
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-netpass-dark">{userProfile.name}</p>
              <p className="text-netpass-dark">
                {currentLocation
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(
                      4
                    )}`
                  : 'Location disabled'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!locationGranted ? (
          // Welcome Screen
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-netpass-accent mb-8">
            <h2 className="text-3xl font-bold mb-4 text-netpass-primary">
              Welcome, {userProfile.name}!
            </h2>
            <p className="text-netpass-dark mb-8 max-w-2xl mx-auto">
              Streetpass works by detecting when you pass near other players. Enable location
              services to start discovering people around you.
            </p>

            <p className="text-netpass-dark mb-8 bg-netpass-light p-6 rounded border-l-4 border-netpass-secondary">
              <span className="font-semibold">How it works:</span> Your location is sent
              periodically to our server. When another player is within ~100 meters and your
              timestamps overlap, you create a memorable encounter.
            </p>

            <button
              onClick={handleEnableLocation}
              className="px-8 py-3 bg-netpass-primary hover:bg-netpass-dark text-white font-bold text-lg transition-all rounded border-2 border-netpass-dark"
            >
              Enable Location Services
            </button>

            <p className="text-xs text-netpass-dark mt-6">
              Your location data is only used for proximity matching. We do not store your
              movement history.
            </p>
          </div>
        ) : (
          <>
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-netpass-accent">
                <h3 className="text-xs font-bold text-netpass-dark uppercase mb-2">Status</h3>
                <p className="text-2xl font-bold text-netpass-secondary">Active</p>
                <p className="text-xs text-netpass-dark mt-2">
                  Searching for nearby encounters
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-netpass-accent">
                <h3 className="text-xs font-bold text-netpass-dark uppercase mb-2">Encounters</h3>
                <p className="text-2xl font-bold text-netpass-secondary">{encounters.length}</p>
                <p className="text-xs text-netpass-dark mt-2">
                  People you have met today
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-netpass-accent">
                <h3 className="text-xs font-bold text-netpass-dark uppercase mb-2">Location</h3>
                <p className="text-sm font-mono text-netpass-primary">
                  {currentLocation
                    ? `${currentLocation.lat.toFixed(2)}`
                    : 'Acquiring...'}
                </p>
                <p className="text-xs text-netpass-dark mt-2">
                  Updated every 60 seconds
                </p>
              </div>
            </div>

            {/* Encounters Section */}
            <Encounters encounters={encounters} />

            {/* Location Toggle */}
            <div className="mt-8 text-center">
              <button
                onClick={handleDisableLocation}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold transition-all rounded border-2 border-gray-500"
              >
                Disable Location
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
