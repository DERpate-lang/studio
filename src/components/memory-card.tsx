import type { Memory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { CalendarDays, Edit3, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { format, parseISO } from "date-fns";

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-primary/20 bg-background/70">
      {memory.photoUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={memory.photoUrl}
            alt={memory.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="couple memory"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{memory.title}</CardTitle>
        <div className="flex items-center text-sm text-foreground/70 font-body">
          <CalendarDays className="mr-2 h-4 w-4 text-accent" />
          {format(parseISO(memory.date), "MMMM d, yyyy")}
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-body text-foreground/90 leading-relaxed">{memory.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/30 p-4">
        <Button variant="ghost" size="sm" onClick={() => onEdit(memory)} className="text-primary hover:text-accent">
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(memory.id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
