'use server';

import { db } from '@/lib/firebase';
import { generateNoteTitle } from '@/ai/flows/generate-note-title';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function addTimelineAction() {
  try {
    const timelinesCollection = collection(db, 'timelines');
    const q = query(timelinesCollection, orderBy('number', 'desc'));
    const querySnapshot = await getDocs(q);
    const lastTimeline = querySnapshot.docs[0]?.data();
    const newNumber = lastTimeline ? lastTimeline.number + 1 : 1;

    await addDoc(timelinesCollection, {
      number: newNumber,
      createdAt: serverTimestamp(),
    });
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
        await addDoc(collection(db, 'notes'), {
            title,
            content,
            lineId,
            createdAt: serverTimestamp(),
        });
        revalidatePath('/');
        return { success: true };
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
