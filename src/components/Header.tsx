import React from 'react';
import Link from 'next/link';
import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="relative text-center mb-10">
      <div className="absolute top-0 left-0">
        <Link href="/projects" passHref>
          <Button variant="ghost" size="icon" aria-label="Projetos">
            <Folder />
          </Button>
        </Link>
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
