import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ title, children, className }: PageContainerProps) {
  return (
    <div className={cn("container mx-auto p-4 md:p-8 space-y-6", className)}>
      <h1 className="font-headline text-4xl md:text-5xl text-primary drop-shadow-sm">
        {title}
      </h1>
      <Separator className="bg-accent h-[2px]" />
      <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-primary/10">
        {children}
      </div>
    </div>
  );
}
