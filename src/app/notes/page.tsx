
"use client";

import { useState, useEffect } from "react";
import type { LoveNote } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { LoveNoteCard } from "@/components/love-note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";

export default function LoveNotesPage() {
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<LoveNote>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const notesCollectionRef = collection(db, "love_notes");

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const q = query(notesCollectionRef, orderBy("date", "desc"));
      const data = await getDocs(q);
      const fetchedNotes = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as LoveNote));
      setNotes(fetchedNotes);
    } catch (error: any) {
      console.error("Error fetching notes from Firestore:", error);
      toast({ title: "Error", description: "Could not fetch notes.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentNote(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentNote.content) {
      toast({ title: "Error", description: "Note content cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const noteDataToSave = {
      title: currentNote.title || null, // Store as null if empty
      content: currentNote.content!,
      date: Timestamp.now(), // Always use current time for new/updated notes
    };

    try {
      if (isEditing && currentNote.id) {
        const noteDoc = doc(db, "love_notes", currentNote.id);
        await updateDoc(noteDoc, noteDataToSave);
        toast({ title: "Success", description: "Love note updated!" });
      } else {
        await addDoc(notesCollectionRef, noteDataToSave);
        toast({ title: "Success", description: "Love note saved!" });
      }
      fetchNotes(); // Refresh list
      resetFormAndDialog();
    } catch (error: any) {
      console.error("Error saving note to Firestore:", error);
      toast({ title: "Database Error", description: error.message || "Could not save note.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFormAndDialog = () => {
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

  const handleDelete = async (id: string) => {
     if (confirm("Are you sure you want to delete this note from the database?")) {
      setIsLoading(true);
      try {
        const noteDoc = doc(db, "love_notes", id);
        await deleteDoc(noteDoc);
        toast({ title: "Success", description: "Love note deleted." });
        fetchNotes(); // Refresh list
      } catch (error: any) {
        console.error("Error deleting note from Firestore:", error);
        toast({ title: "Database Error", description: error.message || "Could not delete note.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <PageContainer title="Our Love Notes">
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) resetFormAndDialog();
        setIsDialogOpen(isOpen);
      }}>
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
               <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && notes.length === 0 && (
         <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && notes.length === 0 ? (
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
