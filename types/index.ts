// User and Avatar types
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  message: string;
  avatarUrl: string; // Base64 or storage URL of 300x300 avatar
  location?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  createdAt: number;
  updatedAt: number;
}

// Location and presence types
export interface PresencePacket {
  userId: string;
  timestamp: number;
  lat: number;
  lng: number;
  data: {
    avatarUrl: string;
    message: string;
    name: string;
    email: string;
  };
}

export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

// Encounter types
export interface Encounter {
  encounterId: string;
  userA: string;
  userB: string;
  timestamp: number;
  exchange: {
    gift: string;
    avatarSnapshot: string;
    nameSnapshot: string;
    messageSnapshot: string;
    emailSnapshot: string;
  };
  distance?: number;
  discovered: boolean;
}

export interface EncounterDisplay {
  encounterId: string;
  name: string;
  message: string;
  email: string;
  avatarUrl: string;
  timestamp: number;
  gift?: string;
  distance?: number;
  isNew: boolean;
}
