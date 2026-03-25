import { NextRequest, NextResponse } from 'next/server';
import { Encounter } from '@/types';
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

    const userEncounters: Encounter[] = [];
    
    encounterDocsA.forEach((doc) => {
      userEncounters.push(doc.data() as Encounter);
    });
    
    encounterDocsB.forEach((doc) => {
      userEncounters.push(doc.data() as Encounter);
    });

    // Sort by timestamp descending
    userEncounters.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      encounters: userEncounters,
      count: userEncounters.length,
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
