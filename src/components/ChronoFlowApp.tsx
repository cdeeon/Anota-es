'use client';

import React, { useState, useTransition } from 'react';
import { addTimelineAction } from '@/lib/actions';
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
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddTimeline = () => {
    startTransition(async () => {
      const result = await addTimelineAction();
      if (result?.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleOpenDialog = () => {
    if (initialTimelines.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos uma linha do tempo primeiro!",
        variant: "default",
      });
      return;
    }
    setDialogOpen(true);
  };
  
  return (
    <>
      <div className="flex justify-center gap-4 mb-10">
        <Button onClick={handleAddTimeline} disabled={isPending} className="shadow-lg" size="lg">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Nova Linha
        </Button>
        <Button onClick={handleOpenDialog} variant="secondary" className="shadow-lg" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Anotação
        </Button>
      </div>

      <main className="bg-card/60 dark:bg-card/30 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl min-h-[60vh]">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {initialTimelines.length > 0 ? (
            initialTimelines.map(timeline => (
              <TimelineLane
                key={timeline.id}
                timeline={timeline}
                notes={initialNotes.filter(note => note.lineId === timeline.id)}
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
        timelines={initialTimelines}
      />
    </>
  );
}
