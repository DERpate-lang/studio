
"use client";

import { useState, useEffect } from "react";
import type { Milestone } from "@/lib/types";
import { PageContainer } from "@/components/page-container";
import { MilestoneItem } from "@/components/milestone-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { format, parseISO } from 'date-fns';

const milestoneIcons = [
  { value: "default", label: "General Sparkle" },
  { value: "event", label: "Special Event" },
  { value: "gift", label: "Thoughtful Gift" },
  { value: "travel", label: "Our Adventures" },
];

const formatTimestampForInput = (timestamp: Timestamp | string | undefined): string => {
  if (!timestamp) return new Date().toISOString().split('T')[0];
  if (typeof timestamp === 'string') {
     // Check if it's already in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
        return timestamp;
    }
    try {
      return format(parseISO(timestamp), "yyyy-MM-dd");
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
  return format(timestamp.toDate(), "yyyy-MM-dd");
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Partial<Milestone>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const milestonesCollectionRef = collection(db, "milestones");

  const fetchMilestones = async () => {
    setIsFetching(true);
    try {
      const q = query(milestonesCollectionRef, orderBy("date", "desc"));
      const data = await getDocs(q);
      const fetchedMilestones = data.docs.map((doc) => {
        const docData = doc.data();
        return { 
            ...docData, 
            id: doc.id,
            date: docData.date // Keep as Firestore Timestamp initially
        } as Milestone;
      });
      setMilestones(fetchedMilestones);
    } catch (error: any) {
      console.error("Error fetching milestones from Firestore:", error);
      toast({ title: "Error Fetching Milestones", description: error.message || "Could not fetch milestones. Check Firestore setup and security rules.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMilestone(prev => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: string) => {
    setCurrentMilestone(prev => ({ ...prev, icon: value }));
  };

  const handleSubmit = async () => {
    if (!currentMilestone.title || !currentMilestone.date || !currentMilestone.description) {
      toast({ title: "Validation Error", description: "Please fill in title, date, and description.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      let dateString = currentMilestone.date;
      if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
         dateString = formatTimestampForInput(currentMilestone.date);
      }
      const dateAsTimestamp = Timestamp.fromDate(parseISO(dateString));
    
      const milestoneDataToSave = {
        title: currentMilestone.title!,
        date: dateAsTimestamp,
        description: currentMilestone.description!,
        icon: currentMilestone.icon || "default",
      };

      if (isEditing && currentMilestone.id) {
        const milestoneDoc = doc(db, "milestones", currentMilestone.id);
        await updateDoc(milestoneDoc, milestoneDataToSave);
        toast({ title: "Success", description: "Milestone updated!" });
      } else {
        await addDoc(milestonesCollectionRef, milestoneDataToSave);
        toast({ title: "Success", description: "Milestone added!" });
      }
      fetchMilestones();
      resetFormAndDialog();
    } catch (error: any) {
      console.error("Error saving milestone to Firestore:", error);
      toast({ title: "Database Error", description: error.message || "Could not save milestone. Check Firestore rules and network.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormAndDialog = () => {
    setIsDialogOpen(false);
    setCurrentMilestone({});
    setIsEditing(false);
  };

  const openAddDialog = () => {
    resetFormAndDialog();
    setCurrentMilestone({ date: new Date().toISOString().split('T')[0], icon: "default" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (milestone: Milestone) => {
    resetFormAndDialog();
    setCurrentMilestone({
        ...milestone,
        date: formatTimestampForInput(milestone.date),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this milestone from the database?")) {
        return;
    }
    setIsLoading(true);
    try {
      const milestoneDoc = doc(db, "milestones", id);
      await deleteDoc(milestoneDoc);
      toast({ title: "Success", description: "Milestone deleted." });
      fetchMilestones();
    } catch (error: any) {
      console.error("Error deleting milestone from Firestore:", error);
      toast({ title: "Database Error", description: error.message || "Could not delete milestone.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Our Relationship Milestones">
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          if(!isOpen) resetFormAndDialog();
          setIsDialogOpen(isOpen);
        }}>
        <DialogTrigger asChild>
          <Button onClick={openAddDialog} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isFetching}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Milestone
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px] bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {isEditing ? "Edit Milestone" : "Add New Milestone"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 font-body">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-foreground/80">Title</Label>
              <Input id="title" name="title" value={currentMilestone.title || ""} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-foreground/80">Date</Label>
              <Input id="date" name="date" type="date" value={formatTimestampForInput(currentMilestone.date)} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-foreground/80">Description</Label>
              <Textarea id="description" name="description" value={currentMilestone.description || ""} onChange={handleInputChange} className="col-span-3 min-h-[100px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right text-foreground/80">Icon</Label>
              <Select name="icon" value={currentMilestone.icon || "default"} onValueChange={handleIconChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {milestoneIcons.map(icon => (
                    <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10" onClick={() => { if(isLoading) setIsLoading(false); }} disabled={isLoading && !isFetching}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body" disabled={isLoading || isFetching}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? "Save Changes" : "Save Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isFetching && milestones.length === 0 && (
         <div className="flex justify-center items-center h-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isFetching && milestones.length === 0 ? (
        <DecorativeBorder className="text-center">
            <p className="font-body text-lg text-foreground/70 p-8">No milestones recorded yet. Add the important moments that shaped your journey!</p>
        </DecorativeBorder>
      ) : (
        <div className="space-y-6">
          {milestones.map(milestone => (
            <MilestoneItem key={milestone.id} milestone={milestone} onEdit={openEditDialog} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

    