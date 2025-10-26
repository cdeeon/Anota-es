import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Timeline, Note, TimelineHydrated, NoteHydrated } from '@/lib/types';
import Header from '@/components/Header';
import ChronoFlowApp from '@/components/ChronoFlowApp';

async function getTimelines(): Promise<TimelineHydrated[]> {
  try {
    const timelinesCollection = collection(db, 'timelines');
    const q = query(timelinesCollection, orderBy('number', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data() as Timeline;
      const createdAt = data.createdAt as Timestamp;
      return {
        ...data,
        id: doc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch timelines:", error);
    return [];
  }
}

async function getNotes(): Promise<NoteHydrated[]> {
  try {
    const notesCollection = collection(db, 'notes');
    const q = query(notesCollection, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data() as Note;
      const createdAt = data.createdAt as Timestamp;
      return {
        ...data,
        id: doc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return [];
  }
}

export default async function Home() {
  const timelines = await getTimelines();
  const notes = await getNotes();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-4 py-8">
            <Header />
            <ChronoFlowApp initialTimelines={timelines} initialNotes={notes} />
        </div>
    </div>
  );
}
