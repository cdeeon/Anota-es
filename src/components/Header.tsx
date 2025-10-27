import React from 'react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header className="relative text-center mb-10">
      <div className="absolute top-0 left-0">
         <SidebarTrigger />
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
