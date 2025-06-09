"use client";

import { useState, useEffect } from "react";
import type { LoveNote } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { LoveNoteCard } from "@/components/love-note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";

export default function LoveNotesPage() {
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<LoveNote>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedNotes = localStorage.getItem("loveNotes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes).sort((a: LoveNote, b: LoveNote) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const saveNotesToLocalStorage = (updatedNotes: LoveNote[]) => {
    localStorage.setItem("loveNotes", JSON.stringify(updatedNotes));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentNote(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!currentNote.content) {
      toast({ title: "Error", description: "Note content cannot be empty.", variant: "destructive" });
      return;
    }

    let updatedNotes;
    const now = new Date().toISOString();

    if (isEditing && currentNote.id) {
      updatedNotes = notes.map(n => n.id === currentNote.id ? { ...n, ...currentNote, date: now } as LoveNote : n);
      toast({ title: "Success", description: "Love note updated!" });
    } else {
      const newNote: LoveNote = {
        id: Date.now().toString(),
        date: now,
        title: currentNote.title || undefined,
        content: currentNote.content,
      };
      updatedNotes = [newNote, ...notes];
      toast({ title: "Success", description: "Love note saved!" });
    }
    
    updatedNotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
    setIsDialogOpen(false);
    setCurrentNote({});
    setIsEditing(false);
  };

  const openAddDialog = () => {
    setCurrentNote({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (note: LoveNote) => {
    setCurrentNote(note);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
     if (confirm("Are you sure you want to delete this note?")) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      saveNotesToLocalStorage(updatedNotes);
      toast({ title: "Success", description: "Love note deleted." });
    }
  };

  return (
    <PageContainer title="Our Love Notes">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={openAddDialog} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body">
            <PlusCircle className="mr-2 h-5 w-5" /> Write New Note
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {isEditing ? "Edit Note" : "Write New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 font-body">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-foreground/80">Title (Optional)</Label>
              <Input id="title" name="title" value={currentNote.title || ""} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right text-foreground/80">Content</Label>
              <Textarea id="content" name="content" value={currentNote.content || ""} onChange={handleInputChange} className="col-span-3 min-h-[150px]" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
               <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body">Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notes.length === 0 ? (
        <DecorativeBorder className="text-center">
            <p className="font-body text-lg text-foreground/70 p-8">No love notes yet. Write your first message to your beloved!</p>
        </DecorativeBorder>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <LoveNoteCard key={note.id} note={note} onEdit={openEditDialog} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
