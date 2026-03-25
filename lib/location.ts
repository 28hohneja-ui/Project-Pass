// Haversine formula for distance calculation
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const rad = Math.PI / 180;

  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c; // Distance in meters
}

// Get user's location
export async function getCurrentLocation(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    console.log('getCurrentLocation: Checking geolocation support...');
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      reject(new Error('Geolocation not supported on this device'));
      return;
    }

    console.log('getCurrentLocation: Calling navigator.geolocation.getCurrentPosition...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('getCurrentLocation: Position received', position);
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy,
        });
      },
      (error) => {
        console.error('getCurrentLocation: Error received', error.code, error.message);
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('Location permission denied. Please allow location access when the browser asks.'));
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error('Location unavailable. Please check your GPS settings.'));
        } else if (error.code === error.TIMEOUT) {
          reject(new Error('Location request timed out. Please try again.'));
        } else {
          reject(new Error(`Location error: ${error.message}`));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Watch user location (for continuous updates)
export function watchLocation(
  callback: (location: { lat: number; lng: number }) => void,
  errorCallback?: (error: any) => void
): number {
  if (!navigator.geolocation) {
    if (errorCallback) errorCallback(new Error('Geolocation not supported'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      callback({ lat: latitude, lng: longitude });
    },
    (error) => {
      if (errorCallback) errorCallback(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000,
    }
  );
}

// Check if two users match (proximity & time window)
export function isProximityMatch(
  lat1: number,
  lng1: number,
  timestamp1: number,
  lat2: number,
  lng2: number,
  timestamp2: number,
  maxDistance: number = 100, // meters
  maxTimeWindow: number = 600000 // 10 minutes
): boolean {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  const timeDiff = Math.abs(timestamp1 - timestamp2);

  return distance < maxDistance && timeDiff < maxTimeWindow;
}
