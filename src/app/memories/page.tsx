
"use client";

import { useState, useEffect, useRef } from "react";
import type { Memory } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { MemoryCard } from "@/components/memory-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";
import Image from "next/image";

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Partial<Memory>>({});
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedMemories = localStorage.getItem("memories");
    if (storedMemories) {
      try {
        setMemories(JSON.parse(storedMemories).sort((a: Memory, b: Memory) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (e) {
        console.error("Error parsing memories from localStorage", e);
        // Optionally initialize with empty or default if parsing fails
        setMemories([]);
      }
    }
  }, []);

  const saveMemoriesToLocalStorage = (updatedMemories: Memory[]): boolean => {
    try {
      localStorage.setItem("memories", JSON.stringify(updatedMemories));
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014) {
        toast({
          title: "Storage Limit Reached",
          description: "Your browser's local storage is full. Please remove some memories with photos or try smaller images.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Saving Memories",
          description: "Could not save memories to local storage.",
          variant: "destructive",
        });
        console.error("Error saving memories to localStorage:", error);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMemory(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 5 * 1024 * 1024) { // Basic 5MB check
        toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive"});
        setSelectedPhotoFile(null);
        setCurrentMemory(prev => ({ ...prev, photoUrl: undefined, "data-ai-hint": undefined }));
        if (photoFileInputRef.current) photoFileInputRef.current.value = "";
        return;
      }
      setSelectedPhotoFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentMemory(prev => ({ ...prev, photoUrl: reader.result as string, "data-ai-hint": "uploaded memory image" }));
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setSelectedPhotoFile(null);
      setCurrentMemory(prev => ({ ...prev, photoUrl: undefined, "data-ai-hint": undefined }));
    }
  };

  const removeSelectedPhoto = () => {
    setSelectedPhotoFile(null);
    setCurrentMemory(prev => ({...prev, photoUrl: undefined, "data-ai-hint": undefined}));
    if (photoFileInputRef.current) {
        photoFileInputRef.current.value = "";
    }
  }

  const processSubmit = (photoDataUrlForNewMemory?: string) => {
    if (!currentMemory.title || !currentMemory.date || !currentMemory.description) {
      toast({ title: "Error", description: "Please fill in title, date, and description.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let updatedMemoriesList;
    
    if (isEditing && currentMemory.id) {
      updatedMemoriesList = memories.map(mem => 
        mem.id === currentMemory.id ? 
        { 
          ...mem, 
          ...currentMemory, 
          photoUrl: selectedPhotoFile ? photoDataUrlForNewMemory : currentMemory.photoUrl, // Use new if selected, else existing
          "data-ai-hint": (selectedPhotoFile ? photoDataUrlForNewMemory : currentMemory.photoUrl) ? (currentMemory["data-ai-hint"] || "uploaded memory image") : undefined,
        } as Memory 
        : mem
      );
    } else {
      const newMemory: Memory = {
        id: Date.now().toString(),
        title: currentMemory.title!,
        date: currentMemory.date!,
        description: currentMemory.description!,
        photoUrl: photoDataUrlForNewMemory, // This comes from selectedPhotoFile if it exists
        "data-ai-hint": photoDataUrlForNewMemory ? (currentMemory["data-ai-hint"] || "uploaded memory image") : undefined,
      };
      updatedMemoriesList = [newMemory, ...memories];
    }
    
    updatedMemoriesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (saveMemoriesToLocalStorage(updatedMemoriesList)) {
        setMemories(updatedMemoriesList);
        toast({ title: "Success", description: isEditing ? "Memory updated successfully!" : "Memory added successfully!" });
        resetFormAndDialog();
    }
    // If saving fails, the toast is shown by saveMemoriesToLocalStorage
    setIsLoading(false);
  }

  const handleSubmit = () => {
    setIsLoading(true);
    if (selectedPhotoFile) { // If a new file was selected (for add or edit)
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmit(reader.result as string);
      };
      reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read photo file.", variant: "destructive" });
        setIsLoading(false);
      }
      reader.readAsDataURL(selectedPhotoFile);
    } else { // No new file selected (could be editing existing text fields, or adding without photo)
      processSubmit(currentMemory.photoUrl); // Pass existing photoUrl (if any)
    }
  };

  const resetFormAndDialog = () => {
    setIsDialogOpen(false);
    setCurrentMemory({});
    setSelectedPhotoFile(null);
    setIsEditing(false);
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = "";
    }
  }

  const openAddDialog = () => {
    setCurrentMemory({ date: new Date().toISOString().split('T')[0] });
    setSelectedPhotoFile(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (memory: Memory) => {
    setCurrentMemory(memory); 
    setSelectedPhotoFile(null); 
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      const updatedMemories = memories.filter(mem => mem.id !== id);
      if(saveMemoriesToLocalStorage(updatedMemories)){
        setMemories(updatedMemories);
        toast({ title: "Success", description: "Memory deleted." });
      } else {
        setMemories(updatedMemories); // Keep UI consistent
         toast({ title: "Info", description: "Memory removed from view. Storage update may have failed.", variant: "default"});
      }
    }
  };
  

  return (
    <PageContainer title="Our Cherished Memories">
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) { 
          resetFormAndDialog();
        }
        setIsDialogOpen(isOpen);
      }}>
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="photoFile" className="text-right text-foreground/80 pt-2">Photo</Label>
              <div className="col-span-3 space-y-2">
                <Input id="photoFile" name="photoFile" type="file" accept="image/*" onChange={handlePhotoFileChange} ref={photoFileInputRef} className="col-span-3" />
                {currentMemory.photoUrl && (
                  <div className="relative group">
                    <Image src={currentMemory.photoUrl} alt="Preview" width={100} height={100} className="rounded-md aspect-square object-cover" unoptimized={currentMemory.photoUrl.startsWith('data:image')} />
                    <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6 text-destructive opacity-50 hover:opacity-100 group-hover:opacity-100" onClick={removeSelectedPhoto}>
                        <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                 {!currentMemory.photoUrl && selectedPhotoFile && ( // Preview for newly selected file before it's set in currentMemory.photoUrl
                   <Image src={URL.createObjectURL(selectedPhotoFile)} alt="Preview" width={100} height={100} className="rounded-md aspect-square object-cover" />
                 )}
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataAiHint" className="text-right text-foreground/80">AI Hint</Label>
                <Input 
                    id="dataAiHint" 
                    name="data-ai-hint" 
                    value={currentMemory["data-ai-hint"] || ""} 
                    onChange={handleInputChange} 
                    className="col-span-3" 
                    placeholder="e.g. couple beach (max 2 words)" 
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Memory
            </Button>
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
