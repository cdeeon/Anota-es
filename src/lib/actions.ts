'use server';

import { db } from '@/lib/firebase';
import { generateNoteTitle } from '@/ai/flows/generate-note-title';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, getDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Note, Timeline, TimelineHydrated, NoteHydrated } from './types';


export async function addTimelineAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const timelinesCollection = collection(db, 'timelines');
    const q = query(timelinesCollection, orderBy('number', 'desc'));
    const querySnapshot = await getDocs(q);
    const lastTimelineDoc = querySnapshot.docs[0];
    const lastTimeline = lastTimelineDoc?.data();
    const newNumber = lastTimeline ? lastTimeline.number + 1 : 1;

    const newTimelineData = {
      number: newNumber,
      createdAt: serverTimestamp(),
    };

    await addDoc(timelinesCollection, newTimelineData);
    
    revalidatePath('/');
    return { success: true };
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
    draftId: z.string().optional(),
});

export async function addNoteAction(formData: FormData) {
    const validatedFields = noteSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        lineId: formData.get('lineId'),
        draftId: formData.get('draftId'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, content, lineId, draftId } = validatedFields.data;

    try {
        let noteId = draftId;
        if (draftId) {
            // If it's a draft, update it to published
            const noteRef = doc(db, 'notes', draftId);
            await updateDoc(noteRef, {
                title,
                content,
                lineId,
                status: 'published',
                createdAt: serverTimestamp(), // Update timestamp to reflect publish time
            });
        } else {
            // Otherwise, create a new note
            const docRef = await addDoc(collection(db, 'notes'), {
                title,
                content,
                lineId,
                status: 'published',
                createdAt: serverTimestamp(),
            });
            noteId = docRef.id;
        }
        
        revalidatePath('/');
        
        // We get the note to return to the client for optimistic updates
        const newDoc = await getDoc(doc(db, 'notes', noteId!));
        const data = newDoc.data() as Note;
        const createdAt = data.createdAt as Timestamp;

        const newNote: NoteHydrated = {
            id: newDoc.id,
            title,
            content,
            lineId,
            status: 'published',
            createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
        };
        
        return { success: true, newNote };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error adding note:', errorMessage);
        return { success: false, error: 'Failed to add note. Check Firebase configuration and permissions.' };
    }
}

const draftSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  lineId: z.string(),
  draftId: z.string().optional(),
});

export async function saveNoteDraftAction(formData: FormData): Promise<{ success: boolean; draftId?: string; error?: string }> {
  const validatedFields = draftSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    lineId: formData.get('lineId'),
    draftId: formData.get('draftId'),
  });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid data' };
  }

  const { title, content, lineId, draftId } = validatedFields.data;

  try {
    if (draftId) {
      // Update existing draft
      const draftRef = doc(db, 'notes', draftId);
      await updateDoc(draftRef, {
        title,
        content,
        lineId,
      });
      return { success: true, draftId };
    } else {
      // Create new draft
      const docRef = await addDoc(collection(db, 'notes'), {
        title: title || 'Rascunho sem título',
        content,
        lineId,
        status: 'draft',
        createdAt: serverTimestamp(),
      });
      return { success: true, draftId: docRef.id };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error saving draft:', errorMessage);
    return { success: false, error: 'Failed to save draft.' };
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
