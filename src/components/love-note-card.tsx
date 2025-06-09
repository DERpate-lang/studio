import type { LoveNote } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, CalendarHeart } from "lucide-react";
import { format, parseISO } from "date-fns";

interface LoveNoteCardProps {
  note: LoveNote;
  onEdit: (note: LoveNote) => void;
  onDelete: (id: string) => void;
}

export function LoveNoteCard({ note, onEdit, onDelete }: LoveNoteCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-primary/20 bg-background/70 flex flex-col h-full">
      <CardHeader>
        {note.title && <CardTitle className="font-headline text-2xl text-primary">{note.title}</CardTitle>}
        <div className="flex items-center text-sm text-foreground/70 font-body">
          <CalendarHeart className="mr-2 h-4 w-4 text-accent" />
          {format(parseISO(note.date), "MMMM d, yyyy 'at' h:mm a")}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-body text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/30 p-4 mt-auto">
        <Button variant="ghost" size="sm" onClick={() => onEdit(note)} className="text-primary hover:text-accent">
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(note.id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
