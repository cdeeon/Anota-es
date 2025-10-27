'use client';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { generateTitleAction } from '@/lib/actions';
import type { TimelineHydrated, NoteHydrated } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react';

interface AddNoteDialogProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  timelines: TimelineHydrated[];
  onNoteAdded: (note: Omit<NoteHydrated, 'id' | 'createdAt'>) => void;
}

const noteFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório.'),
  content: z.string().min(1, 'Conteúdo é obrigatório.'),
  lineId: z.string({ required_error: 'Selecione uma linha do tempo.' }),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export default function AddNoteDialog({ isOpen, setOpen, timelines, onNoteAdded }: AddNoteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isGeneratingTitle, startTitleGeneration] = useTransition();
  const { toast } = useToast();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
      lineId: timelines[0]?.id || ''
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: '',
        content: '',
        lineId: timelines.length > 0 ? timelines[0].id : ''
      });
    }
  }, [isOpen, form, timelines]);
  
  const onSubmit = (data: NoteFormValues) => {
    onNoteAdded({
      title: data.title,
      content: data.content,
      lineId: data.lineId,
    });
    setOpen(false);
    toast({ title: 'Sucesso!', description: 'Sua anotação foi salva.' });
  };

  const handleGenerateTitle = () => {
    const content = form.getValues('content');
    if (!content.trim()) {
      toast({ title: 'Atenção', description: 'Escreva algum conteúdo para gerar um título.', variant: 'default' });
      return;
    }
    startTitleGeneration(async () => {
      const result = await generateTitleAction(content);
      if (result.title) {
        form.setValue('title', result.title, { shouldValidate: true });
        toast({ title: 'Título gerado!', description: 'Um título foi sugerido pela IA.' });
      } else {
        toast({ title: 'Erro!', description: result.error || 'Não foi possível gerar um título.', variant: 'destructive' });
      }
    });
  };

  const insertMedia = (type: 'image' | 'video' | 'link') => {
    let html = '';
    switch(type) {
        case 'image':
            const imageUrl = prompt('Digite a URL da imagem:');
            if (imageUrl) html = `<img src="${imageUrl}" alt="Imagem">`;
            break;
        case 'video':
            const videoUrl = prompt('Digite a URL do vídeo (YouTube/Vimeo):');
            if (videoUrl) {
                const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
                const match = videoUrl.match(youtubeRegex);
                if (match && match[1]) {
                    html = `<iframe width="100%" style="aspect-ratio: 16/9;" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen></iframe>`;
                } else {
                    html = `<video src="${videoUrl}" controls style="width: 100%;"></video>`;
                }
            }
            break;
        case 'link':
            const linkUrl = prompt('Digite a URL:');
            const linkText = prompt('Digite o texto do link (opcional):');
            if (linkUrl) html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
            break;
    }
    if (html) {
        const currentContent = form.getValues('content');
        form.setValue('content', (currentContent ? currentContent + '\n\n' : '') + html, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Anotação</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linha do Tempo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma linha do tempo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timelines.map(timeline => (
                        <SelectItem key={timeline.id} value={timeline.id}>
                          Linha {timeline.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Título da sua anotação..." {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleGenerateTitle} disabled={isGeneratingTitle} aria-label="Gerar Título com IA">
                        {isGeneratingTitle ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                   <div className="flex items-center gap-1 rounded-md border bg-transparent p-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMedia('image')}><ImageIcon className="mr-2 h-4 w-4"/> Imagem</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMedia('video')}><Video className="mr-2 h-4 w-4"/> Vídeo</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMedia('link')}><LinkIcon className="mr-2 h-4 w-4"/> Link</Button>
                   </div>
                  <FormControl>
                    <Textarea placeholder="Escreva sua anotação aqui. Você pode adicionar imagens, vídeos e links." className="min-h-[150px] resize-y" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Anotação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
