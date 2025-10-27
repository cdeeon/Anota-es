'use client';
import React from 'react';
import Link from 'next/link';
import { Folder, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { NoteHydrated } from '@/lib/types';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface SidebarProps {
  drafts: NoteHydrated[];
}

export default function Sidebar({ drafts }: SidebarProps) {
  return (
    <SidebarPrimitive>
      <SidebarContent>
        <SidebarHeader>
          <h2 className="text-xl font-semibold">ChronoFlow</h2>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/projects" passHref>
                        <SidebarMenuButton>
                            <Folder />
                            <span>Meus Projetos</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel>Rascunhos</SidebarGroupLabel>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <SidebarMenu>
              {drafts.length > 0 ? (
                drafts.map(draft => (
                  <SidebarMenuItem key={draft.id}>
                    <SidebarMenuButton variant="outline" size="lg" className="h-auto">
                        <div className="flex flex-col items-start text-left w-full gap-1">
                            <span className="font-medium text-sm text-sidebar-foreground/90 truncate w-full">{draft.title || 'Rascunho sem título'}</span>
                            <span className="text-xs text-sidebar-foreground/60">
                                {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                        </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="text-center text-sm text-sidebar-foreground/60 p-4">
                  <FileText className="mx-auto mb-2 h-6 w-6" />
                  Nenhum rascunho salvo.
                </div>
              )}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroup>
        
        <SidebarSeparator />
        <SidebarFooter>
            <p className="text-xs text-sidebar-foreground/50">© 2024 ChronoFlow</p>
        </SidebarFooter>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
