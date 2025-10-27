'use server';

import { db } from '@/lib/firebase';
import { generateNoteTitle } from '@/ai/flows/generate-note-title';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, getDoc, doc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Note, Timeline, TimelineHydrated, NoteHydrated } from './types';


export async function addTimelineAction() {
  try {
    const timelinesCollection = collection(db, 'timelines');
    const q = query(timelinesCollection, orderBy('number', 'desc'));
    const querySnapshot = await getDocs(q);
    const lastTimeline = querySnapshot.docs[0]?.data();
    const newNumber = lastTimeline ? lastTimeline.number + 1 : 1;

    const docRef = await addDoc(timelinesCollection, {
      number: newNumber,
      createdAt: serverTimestamp(),
    });
    
    // To avoid waiting for serverTimestamp, we fetch the doc again.
    // In a real app, you might get this from a client-side listener for better UX.
    const newDoc = await getDoc(docRef);
    const data = newDoc.data() as Timeline;
    const createdAt = data.createdAt as Timestamp;
    
    const newTimeline: TimelineHydrated = {
        ...data,
        id: newDoc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    revalidatePath('/');
    return { success: true, newTimeline };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error adding timeline:', errorMessage);
    return { success: false, error: 'Failed to add timeline. Check Firebase configuration and permissions.' };
  }
}

const noteSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    content: z.string().min(1, 'Content is required.'),
    lineId: z.string().min(1, 'Timeline selection is required.'),
});

export async function addNoteAction(formData: FormData) {
    const validatedFields = noteSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        lineId: formData.get('lineId'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, content, lineId } = validatedFields.data;

    try {
        const docRef = await addDoc(collection(db, 'notes'), {
            title,
            content,
            lineId,
            createdAt: serverTimestamp(),
        });

        const newNote: NoteHydrated = {
            id: docRef.id,
            title,
            content,
            lineId,
            createdAt: new Date().toISOString(), // Use client-side timestamp for optimistic response
        };

        revalidatePath('/');
        return { success: true, newNote };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error adding note:', errorMessage);
        return { success: false, error: 'Failed to add note. Check Firebase configuration and permissions.' };
    }
}

export async function generateTitleAction(content: string) {
    if (!content.trim()) {
        return { error: 'Content is empty.' };
    }
    try {
        const result = await generateNoteTitle({ content });
        return { title: result.title };
    } catch (error) {
        console.error('Error generating title:', error);
        return { error: 'Failed to generate title.' };
    }
}
