'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { addTimelineAction, addNoteAction } from '@/lib/actions';
import type { TimelineHydrated, NoteHydrated } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import AddNoteDialog from './AddNoteDialog';
import TimelineLane from './TimelineLane';
import { useToast } from "@/hooks/use-toast";

interface ChronoFlowAppProps {
  initialTimelines: TimelineHydrated[];
  initialNotes: NoteHydrated[];
}

export default function ChronoFlowApp({ initialTimelines, initialNotes }: ChronoFlowAppProps) {
  const [isAddingTimeline, startTimelineTransition] = useTransition();
  const [isAddingNote, startNoteTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [timelines, setTimelines] = useState<TimelineHydrated[]>(initialTimelines);
  const [notes, setNotes] = useState<NoteHydrated[]>(initialNotes);
  
  useEffect(() => {
    setTimelines(initialTimelines);
  }, [initialTimelines]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);


  const handleAddTimeline = () => {
    startTimelineTransition(async () => {
      const nextNumber = timelines.length > 0 ? Math.max(...timelines.map(t => t.number)) + 1 : 1;
      
      const optimisticId = `optimistic-timeline-${Date.now()}`;
      const optimisticTimeline: TimelineHydrated = {
        id: optimisticId,
        number: nextNumber,
        createdAt: new Date().toISOString(),
      };
      
      setTimelines(currentTimelines => [...currentTimelines, optimisticTimeline].sort((a, b) => a.number - b.number));

      const result = await addTimelineAction();

      if (result?.success && result.newTimeline) {
         setTimelines(currentTimelines => 
            currentTimelines.map(t => t.id === optimisticId ? result.newTimeline! : t)
         );
         toast({ title: 'Sucesso!', description: 'Nova linha adicionada.' });
      } else {
        setTimelines(currentTimelines => currentTimelines.filter(t => t.id !== optimisticId));
        toast({
          title: "Erro",
          description: result.error || "Falha ao adicionar linha.",
          variant: "destructive",
        });
      }
    });
  };

  const handleOpenDialog = () => {
    if (timelines.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos uma linha do tempo primeiro!",
        variant: "default",
      });
      return;
    }
    setDialogOpen(true);
  };
  
  const handleNoteAdded = (noteData: Omit<NoteHydrated, 'id' | 'createdAt'>) => {
    startNoteTransition(async () => {
      const optimisticId = `optimistic-note-${Date.now()}`;
      const optimisticNote: NoteHydrated = {
        id: optimisticId,
        createdAt: new Date().toISOString(),
        ...noteData,
      };
      
      setNotes(currentNotes => [...currentNotes, optimisticNote]);

      const formData = new FormData();
      formData.append('title', noteData.title);
      formData.append('content', noteData.content);
      formData.append('lineId', noteData.lineId);

      const result = await addNoteAction(formData);

      if (result.success && result.newNote) {
        setNotes(currentNotes =>
          currentNotes.map(n => (n.id === optimisticId ? result.newNote! : n))
        );
         toast({ title: 'Sucesso!', description: 'Sua anotação foi salva.' });
      } else {
        setNotes(currentNotes => currentNotes.filter(n => n.id !== optimisticId));
        const errorMsg = result.errors ? Object.values(result.errors).join(', ') : result.error;
        toast({ title: 'Erro!', description: errorMsg || 'Falha ao salvar a anotação.', variant: 'destructive' });
      }
    });
  };


  return (
    <>
      <div className="flex justify-center gap-4 mb-10">
        <Button onClick={handleAddTimeline} disabled={isAddingTimeline} className="shadow-lg" size="lg">
          {isAddingTimeline ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Nova Linha
        </Button>
        <Button onClick={handleOpenDialog} variant="secondary" className="shadow-lg" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Anotação
        </Button>
      </div>

      <main className="bg-card/60 dark:bg-card/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl min-h-[60vh]">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {timelines.length > 0 ? (
            timelines.map(timeline => (
              <TimelineLane
                key={timeline.id}
                timeline={timeline}
                notes={notes.filter(note => note.lineId === timeline.id)}
              />
            ))
          ) : (
            <div className="w-full text-center flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg mb-2">Bem-vindo ao ChronoFlow!</p>
              <p>Clique em &quot;+ Nova Linha&quot; para começar a organizar suas ideias.</p>
            </div>
          )}
        </div>
      </main>

      <AddNoteDialog
        isOpen={isDialogOpen}
        setOpen={setDialogOpen}
        timelines={timelines}
        onNoteAdded={handleNoteAdded}
        isSaving={isAddingNote}
      />
    </>
  );
}
