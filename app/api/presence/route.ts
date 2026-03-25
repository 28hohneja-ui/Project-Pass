import { NextRequest, NextResponse } from 'next/server';
import { PresencePacket, Encounter } from '@/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  setDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  doc
} from 'firebase/firestore';

// Helper: Haversine distance
function calculateDistance(
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

// Check for proximity matches
async function checkMatches(packet: PresencePacket): Promise<Encounter[]> {
  const newEncounters: Encounter[] = [];
  const MAX_DISTANCE = 100; // meters
  const MAX_TIME_WINDOW = 600000; // 10 minutes

  try {
    // Get all recent presence packets from other users
    const tenMinutesAgo = Date.now() - MAX_TIME_WINDOW;
    const presenceQuery = query(
      collection(db, 'presence'),
      where('timestamp', '>=', tenMinutesAgo)
    );
    
    const presenceDocs = await getDocs(presenceQuery);
    
    presenceDocs.forEach((doc) => {
      const otherPacket = doc.data() as PresencePacket;
      
      if (otherPacket.userId === packet.userId) return;

      const distance = calculateDistance(
        packet.lat,
        packet.lng,
        otherPacket.lat,
        otherPacket.lng
      );
      const timeDiff = Math.abs(packet.timestamp - otherPacket.timestamp);

      // Check if proximity match
      if (distance < MAX_DISTANCE && timeDiff < MAX_TIME_WINDOW) {
        // Create encounter
        const encounterId = `${packet.userId}_${otherPacket.userId}_${Date.now()}`;
        const encounter: Encounter = {
          encounterId,
          userA: packet.userId,
          userB: otherPacket.userId,
          timestamp: Date.now(),
          exchange: {
            gift: 'A nice memory',
            avatarSnapshot: otherPacket.data.avatarUrl,
            nameSnapshot: otherPacket.data.name,
            messageSnapshot: otherPacket.data.message,
            emailSnapshot: otherPacket.data.email,
          },
          distance,
          discovered: false,
        };

        newEncounters.push(encounter);
      }
    });
  } catch (error) {
    console.error('Error checking matches:', error);
  }

  return newEncounters;
}

export async function POST(request: NextRequest) {
  try {
    const packet: PresencePacket = await request.json();

    // Validate packet
    if (!packet.userId || !packet.lat || !packet.lng) {
      return NextResponse.json(
        { error: 'Invalid packet' },
        { status: 400 }
      );
    }

    // Store presence in Firestore
    const presenceRef = doc(collection(db, 'presence'), packet.userId);
    await setDoc(presenceRef, {
      ...packet,
      expiry: Timestamp.fromMillis(Date.now() + 900000), // 15 minutes
    });

    // Check for matches
    const matches = await checkMatches(packet);

    // Store new encounters
    for (const encounter of matches) {
      const encounterRef = doc(collection(db, 'encounters'), encounter.encounterId);
      await setDoc(encounterRef, encounter);
    }

    // Get active presence count
    const tenMinutesAgo = Date.now() - 600000;
    const activeQuery = query(
      collection(db, 'presence'),
      where('timestamp', '>=', tenMinutesAgo)
    );
    const activeDocs = await getDocs(activeQuery);

    return NextResponse.json({
      success: true,
      messageCount: activeDocs.size,
      newEncounters: matches,
    });
  } catch (error) {
    console.error('Presence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tenMinutesAgo = Date.now() - 600000;
    const presenceQuery = query(
      collection(db, 'presence'),
      where('timestamp', '>=', tenMinutesAgo)
    );
    
    const presenceDocs = await getDocs(presenceQuery);

    return NextResponse.json({
      activeCount: presenceDocs.size,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Presence GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
