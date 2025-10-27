import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Header() {

  return (
    <header className="relative text-center mb-10">
       <div className="absolute top-0 left-0">
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir rascunhos</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-sm">
                 {/* O conteúdo da sidebar será renderizado pela página principal */}
            </SheetContent>
          </Sheet>
       </div>

      <h1 className="text-4xl md:text-5xl font-light text-foreground mb-2 font-headline tracking-tight">
        <Link href="/">ChronoFlow</Link>
      </h1>
      <p className="text-lg text-muted-foreground font-body">
        Organize suas ideias em linhas do tempo
      </p>
    </header>
  );
}