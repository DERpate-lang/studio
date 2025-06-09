import { cn } from "@/lib/utils";

const DecorativeBorder = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("border-2 border-primary/30 p-1 shadow-lg rounded-xl bg-background", className)}>
      <div className="border border-accent/60 p-4 sm:p-6 rounded-lg bg-card/80">
        {children}
      </div>
    </div>
  );
};

export default DecorativeBorder;
