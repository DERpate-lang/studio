import type { Milestone } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { CalendarDays, Edit3, Trash2, Zap, Gift, MapPin, Sparkles } from "lucide-react"; // Example icons
import { format, parseISO } from "date-fns";

interface MilestoneItemProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

const iconMap: { [key: string]: React.ElementType } = {
  default: Sparkles,
  event: Zap,
  gift: Gift,
  travel: MapPin,
};

export function MilestoneItem({ milestone, onEdit, onDelete }: MilestoneItemProps) {
  const IconComponent = milestone.icon && iconMap[milestone.icon] ? iconMap[milestone.icon] : iconMap.default;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-primary/20 bg-background/70">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconComponent className="h-8 w-8 text-accent flex-shrink-0" />
          <div>
            <CardTitle className="font-headline text-2xl text-primary">{milestone.title}</CardTitle>
            <div className="flex items-center text-sm text-foreground/70 font-body">
              <CalendarDays className="mr-2 h-4 w-4 text-accent" />
              {format(parseISO(milestone.date), "MMMM d, yyyy")}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-body text-foreground/90 leading-relaxed">{milestone.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/30 p-4">
        <Button variant="ghost" size="sm" onClick={() => onEdit(milestone)} className="text-primary hover:text-accent">
          <Edit3 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(milestone.id)} className="text-destructive hover:text-destructive/80">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
