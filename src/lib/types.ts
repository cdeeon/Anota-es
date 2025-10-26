import type { Timestamp } from 'firebase/firestore';

export interface Timeline {
  id: string;
  number: number;
  createdAt: Timestamp;
}

export interface Note {
  id: string;
  lineId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
}

// For client-side usage, where Timestamps are serialized
export interface TimelineHydrated extends Omit<Timeline, 'createdAt' | 'id'> {
  id: string;
  createdAt: string;
}

export interface NoteHydrated extends Omit<Note, 'createdAt' | 'id'> {
  id: string;
  createdAt: string;
}
