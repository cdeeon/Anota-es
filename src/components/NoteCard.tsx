import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NoteHydrated } from '@/lib/types';

interface NoteCardProps {
  note: NoteHydrated;
}

export default function NoteCard({ note }: NoteCardProps) {
  const timeAgo = formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR });
  
  return (
    <article className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 will-change-transform">
      <Card className="bg-background/80 dark:bg-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{note.title}</CardTitle>
          <p className="text-xs text-muted-foreground pt-1">{timeAgo}</p>
        </CardHeader>
        <CardContent>
          <div 
              className="text-sm text-foreground/80 prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-a:text-primary content-area"
              dangerouslySetInnerHTML={{ __html: note.content }} 
          />
        </CardContent>
      </Card>
    </article>
  );
}
