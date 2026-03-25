import { UserProfile, PresencePacket } from '@/types';

class PresenceService {
  private userProfile: UserProfile;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
  }

  startPresence(location: { lat: number; lng: number }) {
    if (this.isRunning) return;

    this.isRunning = true;
    // Send initial presence
    this.sendPresence(location);

    // Send presence every 60 seconds
    this.intervalId = setInterval(() => {
      this.sendPresence(location);
    }, 60000);
  }

  async sendPresence(location: { lat: number; lng: number }) {
    try {
      const packet: PresencePacket = {
        userId: this.userProfile.userId,
        timestamp: Date.now(),
        lat: location.lat,
        lng: location.lng,
        data: {
          avatarUrl: this.userProfile.avatarUrl,
          message: this.userProfile.message,
          name: this.userProfile.name,
          email: this.userProfile.email,
        },
      };

      // Send to API
      const response = await fetch('/api/presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packet),
      });

      if (!response.ok) {
        console.error('Failed to send presence:', response.statusText);
      }

      // Store location locally
      const history = localStorage.getItem('streetpass_location_history')
        ? JSON.parse(localStorage.getItem('streetpass_location_history')!)
        : [];
      history.push({ lat: location.lat, lng: location.lng, timestamp: Date.now() });
      if (history.length > 100) history.shift();
      localStorage.setItem('streetpass_location_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error sending presence:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

export default PresenceService;
