import React from 'react';
import type { TimelineHydrated, NoteHydrated } from '@/lib/types';
import NoteCard from './NoteCard';
import { ScrollArea } from './ui/scroll-area';

interface TimelineLaneProps {
  timeline: TimelineHydrated;
  notes: NoteHydrated[];
}

export default function TimelineLane({ timeline, notes }: TimelineLaneProps) {
  return (
    <div className="flex-shrink-0 w-80 relative group snap-start">
        <div className="flex items-center gap-4 mb-6 relative">
            <div className="absolute top-10 left-[18px] bottom-[-100vh] w-0.5 bg-gradient-to-b from-primary/30 via-accent/30 to-primary/30 group-hover:from-primary/60 group-hover:via-accent/60 transition-colors duration-300"></div>
            <div className="relative z-10 size-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-lg shadow-md">
                {timeline.number}
            </div>
            <h2 className="font-headline text-xl font-medium text-foreground/80">Linha {timeline.number}</h2>
        </div>
        
        <div className="pl-12 space-y-4">
            {notes.length > 0 ? (
                notes.map(note => (
                    <NoteCard key={note.id} note={note} />
                ))
            ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                    <p>Nenhuma anotação nesta linha.</p>
                </div>
            )}
        </div>
    </div>
  );
}
