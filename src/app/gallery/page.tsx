
"use client";

import { useState, useEffect, useRef } from "react";
import type { Photo } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MusicPlayer } from "@/components/music-player";
import DecorativeBorder from "@/components/decorative-border";
import { Card } from "@/components/ui/card";


const initialPhotos: Photo[] = [];


export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Added for client-side only rendering
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Set client flag on mount
    const storedPhotos = localStorage.getItem("galleryPhotos");
    if (storedPhotos) {
      try {
        setPhotos(JSON.parse(storedPhotos));
      } catch (e) {
        console.error("Error parsing photos from localStorage", e);
        setPhotos(initialPhotos); 
        localStorage.setItem("galleryPhotos", JSON.stringify(initialPhotos));
      }
    } else {
      setPhotos(initialPhotos);
      localStorage.setItem("galleryPhotos", JSON.stringify(initialPhotos));
    }
  }, []);

  const savePhotosToLocalStorage = (updatedPhotos: Photo[]): boolean => {
    try {
      localStorage.setItem("galleryPhotos", JSON.stringify(updatedPhotos));
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014) { 
        toast({
          title: "Storage Limit Reached",
          description: "Your browser's local storage is full. Please remove some photos or try smaller images.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Saving Photos",
          description: "Could not save photos to local storage.",
          variant: "destructive",
        });
        console.error("Error saving photos to localStorage:", error);
      }
      return false;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleAddPhoto = async () => {
    if (selectedFiles.length === 0) {
      toast({ title: "Error", description: "Please select image file(s).", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const newPhotosPromises = selectedFiles.map(file => {
      return new Promise<Photo | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: `${Date.now().toString()}-${file.name}-${Math.random().toString(36).substring(2, 7)}`,
            url: reader.result as string,
            caption: newPhotoCaption,
            dateAdded: new Date().toISOString(),
            "data-ai-hint": "uploaded image"
          });
        };
        reader.onerror = () => {
          toast({ title: "Error Reading File", description: `Failed to read ${file.name}.`, variant: "destructive" });
          resolve(null); 
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(newPhotosPromises);
      const successfullyReadPhotos = results.filter(photo => photo !== null) as Photo[];

      if (successfullyReadPhotos.length === 0 && selectedFiles.length > 0) {
        toast({ title: "No Photos Processed", description: "Could not process any of the selected files (check for errors above).", variant: "default" });
        setIsLoading(false);
        return;
      }
      
      if (successfullyReadPhotos.length > 0) {
        const potentialUpdatedPhotos = [...successfullyReadPhotos, ...photos];
        if (savePhotosToLocalStorage(potentialUpdatedPhotos)) {
          setPhotos(potentialUpdatedPhotos);
          toast({ title: "Success", description: `${successfullyReadPhotos.length} photo(s) added to gallery!` });
          setIsDialogOpen(false); 
        }
      }
    } catch (error) { 
      console.error("Error processing files batch:", error);
      toast({ title: "Batch Error", description: "An unexpected error occurred while processing photos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      if (savePhotosToLocalStorage(updatedPhotos)) {
        setPhotos(updatedPhotos);
        toast({ title: "Success", description: "Photo removed from gallery." });
      } else {
        setPhotos(updatedPhotos); 
        toast({ title: "Info", description: "Photo removed from view. Storage update may have failed if limit was hit.", variant: "default"});
      }
    }
  };


  return (
    <PageContainer title="Our Photo Gallery">
      <div className="mb-8">
        <MusicPlayer />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
          setSelectedFiles([]);
          setNewPhotoCaption("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body">
            {isClient && <PlusCircle className="mr-2 h-5 w-5" />}
            Add New Photo(s)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Add Photo(s) to Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 font-body">
            <div className="space-y-1">
              <Label htmlFor="photoFile" className="text-foreground/80">Photo File(s)</Label>
              <Input id="photoFile" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} multiple />
            </div>
            <div className="space-y-1">
              <Label htmlFor="caption" className="text-foreground/80">Caption (Optional, applies to all)</Label>
              <Input id="caption" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} />
            </div>
            {selectedFiles.length > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{selectedFiles.length} file(s) selected:</p>
                {selectedFiles.length === 1 && selectedFiles[0] && (
                  <>
                    <p className="truncate ml-2">- {selectedFiles[0].name}</p>
                    <Image src={URL.createObjectURL(selectedFiles[0])} alt="Preview" width={100} height={100} className="mt-2 rounded-md aspect-square object-cover" />
                  </>
                )}
                {selectedFiles.length > 1 && (
                  <ul className="list-disc pl-6 max-h-24 overflow-y-auto text-xs">
                    {selectedFiles.slice(0, 5).map(file => <li key={file.name} className="truncate">{file.name}</li>)}
                    {selectedFiles.length > 5 && <li>...and {selectedFiles.length - 5} more.</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddPhoto} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isLoading || selectedFiles.length === 0}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Photo(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {photos.length === 0 ? (
         <DecorativeBorder className="text-center">
            <p className="font-body text-lg text-foreground/70 p-8">Your gallery is empty. Add some photos to start your visual journey!</p>
        </DecorativeBorder>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="group relative overflow-hidden rounded-lg shadow-lg border border-primary/10 aspect-square transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-accent">
            <Image
              src={photo.url}
              alt={photo.caption || "Gallery image"}
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
              style={{ objectFit: "cover" }} 
              className="transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={(photo as any)['data-ai-hint'] || "gallery image"}
              unoptimized={photo.url.startsWith('data:image')} 
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-center">
                <p className="text-sm text-white font-body truncate">{photo.caption}</p>
              </div>
            )}
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
              onClick={() => handleDeletePhoto(photo.id)}
            >
              {isClient && <Trash2 className="h-4 w-4" />}
            </Button>
          </Card>
        ))}
      </div>
      )}
    </PageContainer>
  );
}
