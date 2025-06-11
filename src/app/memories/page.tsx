
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
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { format, parseISO } from 'date-fns';

// Helper to convert Firestore Timestamp to ISO string date for date inputs
const formatTimestampForInput = (timestamp: Timestamp | string | undefined): string => {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  if (typeof timestamp === 'string') {
    // If it's already a string (e.g., from an input field), use it directly
    // or attempt to parse if it's an ISO string from a previous state
    try {
      return format(parseISO(timestamp), "yyyy-MM-dd");
    } catch {
      return new Date().toISOString().split('T')[0]; // fallback
    }
  }
  return format(timestamp.toDate(), "yyyy-MM-dd");
};


export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Partial<Memory>>({});
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const memoriesCollectionRef = collection(db, "memories");

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const q = query(memoriesCollectionRef, orderBy("date", "desc"));
      const data = await getDocs(q);
      const fetchedMemories = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Memory));
      setMemories(fetchedMemories);
    } catch (error: any) {
      console.error("Error fetching memories from Firestore:", error);
      toast({ title: "Error", description: "Could not fetch memories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMemory(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentMemory(prev => ({ ...prev, photoUrl: reader.result as string, "data-ai-hint": "uploaded memory image" }));
      };
      reader.readAsDataURL(file);
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

  const processSubmit = async (photoDataUrlForNewMemory?: string) => {
    if (!currentMemory.title || !currentMemory.date || !currentMemory.description) {
      toast({ title: "Error", description: "Please fill in title, date, and description.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Convert date string to Firestore Timestamp
    const dateAsTimestamp = Timestamp.fromDate(parseISO(currentMemory.date as string));

    const memoryDataToSave = {
      title: currentMemory.title!,
      date: dateAsTimestamp,
      description: currentMemory.description!,
      photoUrl: photoDataUrlForNewMemory || currentMemory.photoUrl || null, // Ensure it's null if undefined
      "data-ai-hint": (photoDataUrlForNewMemory || currentMemory.photoUrl) ? (currentMemory["data-ai-hint"] || "uploaded memory image") : null,
    };

    try {
      if (isEditing && currentMemory.id) {
        const memoryDoc = doc(db, "memories", currentMemory.id);
        await updateDoc(memoryDoc, memoryDataToSave);
        toast({ title: "Success", description: "Memory updated successfully!" });
      } else {
        await addDoc(memoriesCollectionRef, memoryDataToSave);
        toast({ title: "Success", description: "Memory added successfully!" });
      }
      fetchMemories(); // Refresh list
      resetFormAndDialog();
    } catch (error: any) {
        console.error("Error saving memory to Firestore:", error);
        toast({ title: "Database Error", description: error.message || "Could not save memory.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleSubmit = () => {
    setIsLoading(true);
    if (selectedPhotoFile && !currentMemory.photoUrl?.startsWith('data:')) { // Only re-read if a new file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        processSubmit(reader.result as string);
      };
      reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read photo file.", variant: "destructive" });
        setIsLoading(false);
      }
      reader.readAsDataURL(selectedPhotoFile);
    } else {
      // Use existing photoUrl (could be data URI from edit, or undefined)
      processSubmit(currentMemory.photoUrl);
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
    setCurrentMemory({ date: new Date().toISOString().split('T')[0] }); // Date string for input
    setSelectedPhotoFile(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (memory: Memory) => {
    setCurrentMemory({
        ...memory,
        date: formatTimestampForInput(memory.date), // Convert Timestamp to string for input
    });
    setSelectedPhotoFile(null); // Clear selected file, photoUrl is already on currentMemory
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this memory from the database?")) {
      setIsLoading(true);
      try {
        const memoryDoc = doc(db, "memories", id);
        await deleteDoc(memoryDoc);
        toast({ title: "Success", description: "Memory deleted." });
        fetchMemories(); // Refresh list
      } catch (error: any) {
        console.error("Error deleting memory from Firestore:", error);
        toast({ title: "Database Error", description: error.message || "Could not delete memory.", variant: "destructive" });
      } finally {
        setIsLoading(false);
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
              <Input id="date" name="date" type="date" value={currentMemory.date as string || ""} onChange={handleInputChange} className="col-span-3" />
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
                 {!currentMemory.photoUrl && selectedPhotoFile && (
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
      
      {isLoading && memories.length === 0 && (
         <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && memories.length === 0 ? (
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
