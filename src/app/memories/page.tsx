"use client";

import { useState, useEffect } from "react";
import type { Memory } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { MemoryCard } from "@/components/memory-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Partial<Memory>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedMemories = localStorage.getItem("memories");
    if (storedMemories) {
      setMemories(JSON.parse(storedMemories).sort((a: Memory, b: Memory) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const saveMemoriesToLocalStorage = (updatedMemories: Memory[]) => {
    localStorage.setItem("memories", JSON.stringify(updatedMemories));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMemory(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic validation for placeholder (can be expanded for actual uploads)
    if (e.target.value.startsWith("https://placehold.co/")) {
       setCurrentMemory(prev => ({ ...prev, photoUrl: e.target.value }));
    } else if (e.target.value === "") {
       setCurrentMemory(prev => ({ ...prev, photoUrl: undefined }));
    } else {
      // For now, allow any URL for flexibility, but in real app, validate or use upload service
      setCurrentMemory(prev => ({ ...prev, photoUrl: e.target.value }));
    }
  };


  const handleSubmit = () => {
    if (!currentMemory.title || !currentMemory.date || !currentMemory.description) {
      toast({ title: "Error", description: "Please fill in title, date, and description.", variant: "destructive" });
      return;
    }

    let updatedMemories;
    if (isEditing && currentMemory.id) {
      updatedMemories = memories.map(mem => mem.id === currentMemory.id ? { ...mem, ...currentMemory } as Memory : mem);
      toast({ title: "Success", description: "Memory updated successfully!" });
    } else {
      const newMemory: Memory = {
        id: Date.now().toString(),
        ...currentMemory,
        photoUrl: currentMemory.photoUrl || `https://placehold.co/600x400.png` // Default placeholder
      } as Memory;
      updatedMemories = [newMemory, ...memories];
      toast({ title: "Success", description: "Memory added successfully!" });
    }
    
    updatedMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMemories(updatedMemories);
    saveMemoriesToLocalStorage(updatedMemories);
    setIsDialogOpen(false);
    setCurrentMemory({});
    setIsEditing(false);
  };

  const openAddDialog = () => {
    setCurrentMemory({ date: new Date().toISOString().split('T')[0] }); // Default to today's date
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (memory: Memory) => {
    setCurrentMemory(memory);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      const updatedMemories = memories.filter(mem => mem.id !== id);
      setMemories(updatedMemories);
      saveMemoriesToLocalStorage(updatedMemories);
      toast({ title: "Success", description: "Memory deleted." });
    }
  };
  

  return (
    <PageContainer title="Our Cherished Memories">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={openAddDialog} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Memory
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {isEditing ? "Edit Memory" : "Add New Memory"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 font-body">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-foreground/80">Title</Label>
              <Input id="title" name="title" value={currentMemory.title || ""} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-foreground/80">Date</Label>
              <Input id="date" name="date" type="date" value={currentMemory.date || ""} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-foreground/80">Description</Label>
              <Textarea id="description" name="description" value={currentMemory.description || ""} onChange={handleInputChange} className="col-span-3 min-h-[100px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photoUrl" className="text-right text-foreground/80">Photo URL</Label>
              <Input id="photoUrl" name="photoUrl" placeholder="https://placehold.co/600x400.png" value={currentMemory.photoUrl || ""} onChange={handlePhotoUrlChange} className="col-span-3" />
            </div>
             <p className="col-span-4 text-xs text-muted-foreground text-center">Use <ImageIcon className="inline h-3 w-3" /> <a href="https://placehold.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">placehold.co</a> for image placeholders.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body">Save Memory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {memories.length === 0 ? (
        <DecorativeBorder className="text-center">
            <p className="font-body text-lg text-foreground/70 p-8">No memories added yet. Start by adding your first cherished moment!</p>
        </DecorativeBorder>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} onEdit={openEditDialog} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
