"use client";

import { useState, useEffect } from "react";
import type { Photo } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Image as ImageIcon, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MusicPlayer } from "@/components/music-player";
import DecorativeBorder from "@/components/decorative-border";
import { Card, CardContent } from "@/components/ui/card";

const initialPhotos: Photo[] = [
  { id: "1", url: "https://placehold.co/600x400.png", caption: "Our first vacation", dateAdded: new Date().toISOString(), "data-ai-hint": "couple vacation" },
  { id: "2", url: "https://placehold.co/400x600.png", caption: "Celebrating your birthday", dateAdded: new Date().toISOString(), "data-ai-hint": "birthday celebration" },
  { id: "3", url: "https://placehold.co/600x450.png", caption: "Cozy evening at home", dateAdded: new Date().toISOString(), "data-ai-hint": "cozy home" },
  { id: "4", url: "https://placehold.co/450x600.png", caption: "Adventure in the mountains", dateAdded: new Date().toISOString(), "data-ai-hint": "mountain adventure" },
  { id: "5", url: "https://placehold.co/600x400.png", caption: "Anniversary dinner", dateAdded: new Date().toISOString(), "data-ai-hint": "anniversary dinner" },
  { id: "6", url: "https://placehold.co/600x600.png", caption: "Silly faces", dateAdded: new Date().toISOString(), "data-ai-hint": "silly couple" },
];


export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedPhotos = localStorage.getItem("galleryPhotos");
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    } else {
      setPhotos(initialPhotos); // Load initial photos if none in local storage
      localStorage.setItem("galleryPhotos", JSON.stringify(initialPhotos));
    }
  }, []);

  const savePhotosToLocalStorage = (updatedPhotos: Photo[]) => {
    localStorage.setItem("galleryPhotos", JSON.stringify(updatedPhotos));
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl) {
      toast({ title: "Error", description: "Photo URL cannot be empty.", variant: "destructive" });
      return;
    }
    // Basic URL validation or use placeholder
    const photoToAdd: Photo = {
      id: Date.now().toString(),
      url: newPhotoUrl.startsWith("https://placehold.co/") ? newPhotoUrl : `https://placehold.co/600x400.png`,
      caption: newPhotoCaption,
      dateAdded: new Date().toISOString(),
      "data-ai-hint": "custom image"
    };
    const updatedPhotos = [photoToAdd, ...photos];
    setPhotos(updatedPhotos);
    savePhotosToLocalStorage(updatedPhotos);
    toast({ title: "Success", description: "Photo added to gallery!" });
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setIsDialogOpen(false);
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      setPhotos(updatedPhotos);
      savePhotosToLocalStorage(updatedPhotos);
      toast({ title: "Success", description: "Photo removed from gallery." });
    }
  };


  return (
    <PageContainer title="Our Photo Gallery">
      <div className="mb-8">
        <MusicPlayer />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Photo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Add Photo to Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 font-body">
            <div className="space-y-1">
              <Label htmlFor="photoUrl" className="text-foreground/80">Photo URL</Label>
              <Input id="photoUrl" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
              <p className="text-xs text-muted-foreground">Use <ImageIcon className="inline h-3 w-3" /> <a href="https://placehold.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">placehold.co</a> for placeholders.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="caption" className="text-foreground/80">Caption (Optional)</Label>
              <Input id="caption" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddPhoto} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body">Add Photo</Button>
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
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={(photo as any)['data-ai-hint'] || "gallery image"}
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
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
      )}
    </PageContainer>
  );
}
