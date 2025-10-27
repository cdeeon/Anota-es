'use client';
import React from 'react';
import { FileText, Folder } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { NoteHydrated } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import Link from 'next/link';

interface SidebarProps {
  drafts: NoteHydrated[];
}

export default function Sidebar({ drafts }: SidebarProps) {
  return (
    <div className="flex flex-col h-full text-foreground pt-12">
        <div className='px-4 mb-4'>
            <h2 className="text-xl font-semibold">ChronoFlow</h2>
            <p className='text-sm text-muted-foreground'>Seus projetos e rascunhos.</p>
        </div>
        <Separator />
        <div className="p-4">
            <Link href="/projects" passHref>
                <Button variant="ghost" className="w-full justify-start gap-2">
                    <Folder />
                    <span>Meus Projetos</span>
                </Button>
            </Link>
        </div>
        <Separator />
        
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">Rascunhos</h3>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {drafts.length > 0 ? (
                drafts.map(draft => (
                  <Button 
                    key={draft.id} 
                    variant="outline"
                    className="h-auto w-full justify-start items-start flex-col text-left"
                    // Adicionar onClick para abrir o rascunho no futuro
                  >
                      <div className="font-medium text-sm truncate w-full">{draft.title || 'Rascunho sem título'}</div>
                      <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true, locale: ptBR })}
                      </div>
                  </Button>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                  <FileText className="mx-auto mb-2 h-6 w-6" />
                  Nenhum rascunho salvo.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <Separator />
        <div className="p-4 text-xs text-muted-foreground">
            <p>© 2024 ChronoFlow</p>
        </div>
    </div>
  );
}