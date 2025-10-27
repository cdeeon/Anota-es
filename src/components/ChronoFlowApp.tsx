'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { addTimelineAction, addNoteAction } from '@/lib/actions';
import type { TimelineHydrated, NoteHydrated } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import AddNoteDialog from './AddNoteDialog';
import TimelineLane from './TimelineLane';
import { useToast } from "@/hooks/use-toast";
import Sidebar from './Sidebar';

interface ChronoFlowAppProps {
  initialTimelines: TimelineHydrated[];
  initialNotes: NoteHydrated[];
  initialDrafts: NoteHydrated[];
}

export default function ChronoFlowApp({ initialTimelines, initialNotes, initialDrafts }: ChronoFlowAppProps) {
  const [isAddingTimeline, startTimelineTransition] = useTransition();
  const [isAddingNote, startNoteTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [timelines, setTimelines] = useState<TimelineHydrated[]>(initialTimelines);
  const [notes, setNotes] = useState<NoteHydrated[]>(initialNotes);
  const [drafts, setDrafts] = useState<NoteHydrated[]>(initialDrafts);
  
  useEffect(() => {
    setTimelines(initialTimelines);
  }, [initialTimelines]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setDrafts(initialDrafts);
  }, [initialDrafts]);


  const handleAddTimeline = () => {
    startTimelineTransition(async () => {
      const result = await addTimelineAction();
      if (result?.success) {
         toast({ title: 'Sucesso!', description: 'Nova linha adicionada.' });
      } else {
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
  
  const handleNoteAdded = (formData: FormData) => {
    startNoteTransition(async () => {
      setDialogOpen(false);
      const result = await addNoteAction(formData);

      if (result.success) {
         toast({ title: 'Sucesso!', description: 'Sua anotação foi salva.' });
      } else {
        const errorMsg = result.errors ? Object.values(result.errors).join(', ') : result.error;
        toast({ title: 'Erro!', description: errorMsg || 'Falha ao salvar a anotação.', variant: 'destructive' });
      }
    });
  };

  return (
    <main>
        <Sidebar drafts={drafts} />
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

        <div className="bg-card/60 dark:bg-card/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl min-h-[60vh]">
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
        </div>

        <AddNoteDialog
          isOpen={isDialogOpen}
          setOpen={setDialogOpen}
          timelines={timelines}
          onNoteAdded={handleNoteAdded}
          isSaving={isAddingNote}
        />
    </main>
  );
}