import React from 'react';

export default function Header() {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl md:text-5xl font-light text-foreground mb-2 font-headline tracking-tight">
        ChronoFlow
      </h1>
      <p className="text-lg text-muted-foreground font-body">
        Organize suas ideias em linhas do tempo
      </p>
    </header>
  );
}
