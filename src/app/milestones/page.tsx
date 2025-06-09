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
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DecorativeBorder from "@/components/decorative-border";

const milestoneIcons = [
  { value: "default", label: "General Sparkle" },
  { value: "event", label: "Special Event" },
  { value: "gift", label: "Thoughtful Gift" },
  { value: "travel", label: "Our Adventures" },
];

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Partial<Milestone>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedMilestones = localStorage.getItem("milestones");
    if (storedMilestones) {
      setMilestones(JSON.parse(storedMilestones).sort((a: Milestone, b: Milestone) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const saveMilestonesToLocalStorage = (updatedMilestones: Milestone[]) => {
    localStorage.setItem("milestones", JSON.stringify(updatedMilestones));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMilestone(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIconChange = (value: string) => {
    setCurrentMilestone(prev => ({ ...prev, icon: value }));
  };

  const handleSubmit = () => {
    if (!currentMilestone.title || !currentMilestone.date || !currentMilestone.description) {
      toast({ title: "Error", description: "Please fill in title, date, and description.", variant: "destructive" });
      return;
    }

    let updatedMilestones;
    if (isEditing && currentMilestone.id) {
      updatedMilestones = milestones.map(m => m.id === currentMilestone.id ? { ...m, ...currentMilestone } as Milestone : m);
      toast({ title: "Success", description: "Milestone updated!" });
    } else {
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        icon: currentMilestone.icon || "default",
        ...currentMilestone,
      } as Milestone;
      updatedMilestones = [newMilestone, ...milestones];
      toast({ title: "Success", description: "Milestone added!" });
    }
    
    updatedMilestones.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMilestones(updatedMilestones);
    saveMilestonesToLocalStorage(updatedMilestones);
    setIsDialogOpen(false);
    setCurrentMilestone({});
    setIsEditing(false);
  };

  const openAddDialog = () => {
    setCurrentMilestone({ date: new Date().toISOString().split('T')[0], icon: "default" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (milestone: Milestone) => {
    setCurrentMilestone(milestone);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this milestone?")) {
      const updatedMilestones = milestones.filter(m => m.id !== id);
      setMilestones(updatedMilestones);
      saveMilestonesToLocalStorage(updatedMilestones);
      toast({ title: "Success", description: "Milestone deleted." });
    }
  };

  return (
    <PageContainer title="Our Relationship Milestones">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={openAddDialog} className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground font-body">
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
              <Input id="date" name="date" type="date" value={currentMilestone.date || ""} onChange={handleInputChange} className="col-span-3" />
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
              <Button variant="outline" className="font-body border-primary text-primary hover:bg-primary/10">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-body">Save Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {milestones.length === 0 ? (
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
