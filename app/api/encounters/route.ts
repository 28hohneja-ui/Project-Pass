import { NextRequest, NextResponse } from 'next/server';
import { Encounter, EncounterDisplay } from '@/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  setDoc, 
  query, 
  where, 
  getDocs,
  doc
} from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Get encounters for this user from Firestore
    const encounterQuery = query(
      collection(db, 'encounters'),
      where('userA', '==', userId),
    );
    
    const encounterDocsA = await getDocs(encounterQuery);
    
    const encounterQuery2 = query(
      collection(db, 'encounters'),
      where('userB', '==', userId),
    );
    
    const encounterDocsB = await getDocs(encounterQuery2);

    const uniqueEncounters = new Map<string, any>();
    
    encounterDocsA.forEach((doc) => {
      const encounter = doc.data() as Encounter;
      uniqueEncounters.set(encounter.encounterId, encounter);
    });
    
    encounterDocsB.forEach((doc) => {
      const encounter = doc.data() as Encounter;
      uniqueEncounters.set(encounter.encounterId, encounter);
    });

    // Transform to EncounterDisplay format with proper names and messages
    const displayEncounters = Array.from(uniqueEncounters.values()).map((encounter: Encounter) => ({
      encounterId: encounter.encounterId,
      name: encounter.exchange.nameSnapshot || 'Unknown',
      message: encounter.exchange.messageSnapshot || '',
      email: encounter.exchange.emailSnapshot || '',
      avatarUrl: encounter.exchange.avatarSnapshot || '',
      timestamp: encounter.timestamp,
      gift: encounter.exchange.gift || 'A nice memory',
      distance: encounter.distance || 0,
      isNew: !encounter.discovered,
    }));

    // Sort by timestamp descending
    displayEncounters.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      encounters: displayEncounters,
      count: displayEncounters.length,
    });
  } catch (error) {
    console.error('Encounters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const encounter: Encounter = await request.json();

    if (!encounter.encounterId) {
      return NextResponse.json(
        { error: 'Invalid encounter' },
        { status: 400 }
      );
    }

    // Store encounter in Firestore
    const encounterRef = doc(collection(db, 'encounters'), encounter.encounterId);
    await setDoc(encounterRef, encounter);

    return NextResponse.json({
      success: true,
      encounterId: encounter.encounterId,
    });
  } catch (error) {
    console.error('Encounters POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
