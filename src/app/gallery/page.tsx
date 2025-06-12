
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
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_GALLERY_BUCKET = "gallery-photos";

// Helper function to check if an object is empty
const isObjectEmpty = (obj: object | null | undefined): boolean => {
  if (obj === null || obj === undefined) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setIsFetching(true);
    setPhotos([]); // Clear existing photos while fetching
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
        description: error.message || "Could not load photos. Check Supabase 'gallery_photos' table existence, RLS policies, and network.",
        variant: "destructive",
        duration: 9000,
      });
      setPhotos([]); // Ensure photos remain empty on error
    } finally {
      setIsFetching(false);
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
      toast({ title: "No Files Selected", description: "Please select image file(s) to upload.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    let successfullyUploadedPhotosData: { url: string; caption: string; data_ai_hint: string; file_path: string }[] = [];

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = fileName; // Store at the root of the bucket

        try {
          const { error: uploadError } = await supabase.storage
            .from(SUPABASE_GALLERY_BUCKET)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type, // Explicitly set content type
            });

          if (uploadError) {
            console.error(`Supabase Storage upload error for ${file.name}:`, uploadError);
            // Attempt to get more details from the error object if it's not a standard error
            if (typeof uploadError === 'object' && uploadError !== null) {
                console.error('Detailed Supabase Storage upload error object:', JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError)));
            }
            
            let descriptionMessage = `Error: ${uploadError.message || "Upload failed with an unspecified error."}`;
            // Check if it's the specific RLS violation error
            if (uploadError.message && uploadError.message.includes("violates row-level security policy")) {
                descriptionMessage = "CRITICAL: Upload REJECTED by Supabase Storage due to Row Level Security. \n1. Go to Supabase Dashboard > Database > Policies. \n2. Select 'storage' schema and 'objects' table. \n3. Ensure an INSERT policy exists for bucket 'gallery-photos' allowing uploads (e.g., target roles: anon/auth, USING/WITH CHECK: bucket_id = 'gallery-photos'). \n4. This '403 Forbidden - violates RLS policy' is a Supabase configuration issue, not app code.";
            } else if (isObjectEmpty(uploadError) && !uploadError.message) {
                 descriptionMessage = "CRITICAL: Upload failed with an EMPTY error object. This ALMOST ALWAYS means a Supabase RLS or bucket configuration issue. \n1. VERIFY RLS for 'storage.objects': Ensure an INSERT policy exists for bucket 'gallery-photos' (target roles: anon/auth, USING/WITH CHECK: bucket_id = 'gallery-photos'). \n2. Check 'gallery-photos' bucket exists & is public. \n3. Check Supabase URL/Key env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.";
            } else {
                descriptionMessage += " Please check that the 'gallery-photos' bucket exists, is public, and that RLS policies on 'storage.objects' allow INSERT operations for this bucket. Also verify your Supabase URL/key environment variables.";
            }

            toast({
                title: `Storage Upload Failed: ${file.name}`,
                description: descriptionMessage,
                variant: "destructive",
                duration: 15000, // Longer duration for critical messages
            });
            return null;
          }

          const { data: urlData } = supabase.storage
            .from(SUPABASE_GALLERY_BUCKET)
            .getPublicUrl(filePath);

          if (!urlData || !urlData.publicUrl) {
              console.error(`Failed to get public URL for ${filePath}`);
              toast({
                  title: `URL Retrieval Error: ${file.name}`,
                  description: "Could not get public URL after upload. Check bucket RLS policies for SELECT on 'storage.objects' for 'gallery-photos' bucket, and ensure bucket is public.",
                  variant: "destructive",
                  duration: 9000,
              });
              return null;
          }

          return {
            url: urlData.publicUrl,
            caption: newPhotoCaption,
            data_ai_hint: "uploaded image",
            file_path: filePath,
          };
        } catch (innerError: any) {
          console.error(`Unexpected error processing ${file.name}:`, innerError);
          toast({ title: `Processing Error: ${file.name}`, description: innerError.message || "An unexpected error occurred during file processing.", variant: "destructive", duration: 7000 });
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      successfullyUploadedPhotosData = results.filter(data => data !== null) as { url: string; caption: string; data_ai_hint: string, file_path: string }[];

      if (successfullyUploadedPhotosData.length === 0 && selectedFiles.length > 0) {
        toast({ title: "Upload Incomplete", description: "None of the selected files could be successfully uploaded. See previous errors for details.", variant: "default", duration: 7000 });
        // No early return here, finally block handles isLoading
      }

      if (successfullyUploadedPhotosData.length > 0) {
        const photosToInsert = successfullyUploadedPhotosData.map(pData => ({
          url: pData.url,
          caption: pData.caption,
          data_ai_hint: pData.data_ai_hint,
          file_path: pData.file_path,
          // date_added will be set by Supabase default value
        }));

        const { data: insertedPhotos, error: dbError } = await supabase
          .from("gallery_photos")
          .insert(photosToInsert)
          .select();

        if (dbError) {
          console.error("Supabase DB insert error:", dbError);
          toast({
              title: "Database Save Failed",
              description: `Could not save photo metadata. Error: ${dbError.message}. Check 'gallery_photos' table RLS policies for INSERT. Uploaded files remain in storage.`,
              variant: "destructive",
              duration: 9000,
          });
          // Note: Successfully uploaded files to storage are not deleted here if DB insert fails. Consider cleanup logic if this is critical.
          return; // Return here, finally block will handle isLoading for this specific path
        }

        if (insertedPhotos) {
          // Update local state directly for better UX instead of re-fetching
          setPhotos(prevPhotos => [...(insertedPhotos as Photo[]), ...prevPhotos].sort((a,b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()));
          toast({ title: "Success", description: `${insertedPhotos.length} photo(s) uploaded and saved!`, duration: 5000 });
          setIsDialogOpen(false);
          setSelectedFiles([]);
          setNewPhotoCaption("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error: any) {
      console.error("Error in photo addition process:", error);
      toast({
        title: "Photo Addition Process Error",
        description: error.message || "An unexpected error occurred. Check console for details.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
      // Reset form fields if dialog is still open (meaning an error occurred before success closed it,
      // or no photos were successfully uploaded)
      if (isDialogOpen && successfullyUploadedPhotosData.length === 0) {
        setSelectedFiles([]);
        setNewPhotoCaption("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!photo.id || !photo.file_path) {
        toast({title: "Error", description: "Photo information is incomplete for deletion.", variant: "destructive", duration: 7000});
        return;
    }
    if (!confirm("Are you sure you want to delete this photo? This will remove it from storage and the database.")) {
        return;
    }
    setIsLoading(true);
    try {
      const { error: storageError } = await supabase.storage
        .from(SUPABASE_GALLERY_BUCKET)
        .remove([photo.file_path]);

      if (storageError) {
        console.error("Error deleting photo from Supabase Storage:", storageError);
        toast({
          title: "Storage Deletion Warning",
          description: `Could not delete file from storage: ${storageError.message}. Check 'storage.objects' RLS for DELETE on 'gallery-photos' bucket. Attempting to remove from database.`,
          variant: "default", // Changed to default, as it's a warning if DB part succeeds
          duration: 9000,
        });
        // Do not return here if storage fails but DB might succeed.
      }

      const { error: dbError } = await supabase
        .from("gallery_photos")
        .delete()
        .match({ id: photo.id });

      if (dbError) {
        throw dbError; // This will be caught by the outer catch block
      }

      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photo.id));
      toast({ title: "Success", description: "Photo removed from gallery, storage, and database.", duration: 5000 });
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Deletion Error",
        description: error.message || "Could not delete photo. Check RLS policies for 'gallery_photos' (DELETE) and 'storage.objects' (DELETE for 'gallery-photos' bucket).",
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Our Photo Gallery">
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) { // Reset form if dialog is closed for any reason
          setSelectedFiles([]);
          setNewPhotoCaption("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }}>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isFetching || isLoading}>
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
              <Input id="photoFile" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} multiple disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="caption" className="text-foreground/80">Caption (Optional, applies to all)</Label>
              <Input id="caption" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} disabled={isLoading}/>
            </div>
            {isClient && selectedFiles.length > 0 && (
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
              <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10" onClick={() => { if(isLoading) setIsLoading(false); }} disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddPhoto} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isLoading || selectedFiles.length === 0}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Photo(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isFetching && photos.length === 0 && (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isFetching && photos.length === 0 && (
         <DecorativeBorder className="text-center">
            <p className="font-body text-lg text-foreground/70 p-8">Your gallery is empty. Add some photos to start your visual journey!</p>
        </DecorativeBorder>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
            <Card key={photo.id} className="group relative overflow-hidden rounded-lg shadow-lg border border-primary/10 aspect-square transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-accent">
                {isClient && (
                  <Image
                  src={photo.url}
                  alt={photo.caption || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={photo['data_ai_hint'] || "gallery image"}
                  />
                )}
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
                disabled={isLoading || isFetching}
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
