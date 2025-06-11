
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
import DecorativeBorder from "@/components/decorative-border";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

const SUPABASE_GALLERY_BUCKET = "gallery-photos"; // Define your bucket name

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("date_added", { ascending: false });

      if (error) {
        throw error;
      }
      if (data) {
        setPhotos(data as Photo[]);
      }
    } catch (error: any) {
      console.error("Error fetching photos from Supabase DB:", error);
      toast({
        title: "Error Fetching Photos",
        description: error.message || "Could not load photos from the database.",
        variant: "destructive",
      });
      setPhotos([]);
    } finally {
      setIsLoading(false);
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

    const uploadPromises = selectedFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName; // Simplified file path (no 'public/' prefix)

      try {
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_GALLERY_BUCKET)
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Supabase Storage upload error for ${file.name}:`, uploadError);
          toast({
              title: `Storage Upload Failed: ${file.name}`,
              description: `Error: ${uploadError.message}. Please check bucket permissions and RLS policies on storage.objects.`,
              variant: "destructive",
          });
          return null;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from(SUPABASE_GALLERY_BUCKET)
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
            console.error(`Failed to get public URL for ${filePath}`);
            toast({
                title: `URL Retrieval Error: ${file.name}`,
                description: "Could not get public URL after upload. The file might not be accessible or storage policies might be too restrictive.",
                variant: "destructive",
            });
            return null;
        }
        
        return {
          url: urlData.publicUrl,
          caption: newPhotoCaption,
          data_ai_hint: "uploaded image",
          file_path: filePath, // Store the path for potential deletion
        };
      } catch (error: any) { // Catch any other unexpected error during this file's processing
        console.error(`Unexpected error processing ${file.name}:`, error);
        toast({ title: `Processing Error: ${file.name}`, description: error.message || "An unexpected error occurred.", variant: "destructive" });
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfullyUploadedPhotosData = results.filter(data => data !== null) as { url: string; caption: string; data_ai_hint: string, file_path: string }[];

      if (successfullyUploadedPhotosData.length === 0 && selectedFiles.length > 0) {
        toast({ title: "No Photos Uploaded", description: "Could not process and upload any of the selected files. Check previous error messages for details.", variant: "default" });
        setIsLoading(false);
        return;
      }

      if (successfullyUploadedPhotosData.length > 0) {
        const photosToInsert = successfullyUploadedPhotosData.map(pData => ({
          url: pData.url,
          caption: pData.caption,
          data_ai_hint: pData.data_ai_hint,
          file_path: pData.file_path,
        }));

        const { data: insertedPhotos, error: dbError } = await supabase
          .from("gallery_photos")
          .insert(photosToInsert)
          .select();

        if (dbError) {
          console.error("Supabase DB insert error:", dbError);
          toast({
              title: "Database Save Failed",
              description: `Could not save photo metadata to database. Error: ${dbError.message}. Please check table RLS policies.`,
              variant: "destructive",
          });
          // Note: Successfully uploaded files to storage are not deleted here if DB insert fails.
          // This could be added as a cleanup step if necessary.
          setIsLoading(false); // Ensure loading state is reset
          return; // Exit if DB insert fails
        }

        if (insertedPhotos) {
          setPhotos(prevPhotos => [...(insertedPhotos as Photo[]), ...prevPhotos].sort((a,b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()));
          toast({ title: "Success", description: `${insertedPhotos.length} photo(s) uploaded and saved to database!` });
          setIsDialogOpen(false);
        }
      }
    } catch (error: any) { // Catch for Promise.all or other unexpected errors in this block
      console.error("Error in photo addition process (outer try-catch):", error);
      toast({
        title: "Photo Addition Process Error",
        description: error.message || "An unexpected error occurred while finalizing photo additions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedFiles([]);
      setNewPhotoCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!photo.id || !photo.file_path) {
        toast({title: "Error", description: "Photo information is incomplete for deletion.", variant: "destructive"});
        return;
    }
    if (confirm("Are you sure you want to delete this photo? This will remove it from storage and the database.")) {
      setIsLoading(true);
      try {
        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from(SUPABASE_GALLERY_BUCKET)
          .remove([photo.file_path]);

        if (storageError) {
          console.error("Error deleting photo from Supabase Storage:", storageError);
          toast({
            title: "Storage Deletion Warning",
            description: `Could not delete file from storage: ${storageError.message}. Attempting to remove from database.`,
            variant: "default"
          });
        }

        // 2. Delete from Supabase Database
        const { error: dbError } = await supabase
          .from("gallery_photos")
          .delete()
          .match({ id: photo.id });

        if (dbError) {
          throw dbError;
        }

        setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photo.id));
        toast({ title: "Success", description: "Photo removed from gallery, storage, and database." });
      } catch (error: any) {
        console.error("Error deleting photo:", error);
        toast({
          title: "Deletion Error",
          description: error.message || "Could not delete photo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <PageContainer title="Our Photo Gallery">
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

      {isLoading && photos.length === 0 && (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && photos.length === 0 ? (
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
              data-ai-hint={photo['data_ai_hint'] || "gallery image"}
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
              onClick={() => handleDeletePhoto(photo)}
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

