import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlameKindling } from "lucide-react"; // Ornate-ish icon for app logo

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <SidebarTrigger className="text-primary hover:text-accent" />
      <Link href="/" className="flex items-center gap-2">
        <FlameKindling className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-semibold text-primary">
          Eternal Flame
        </h1>
      </Link>
      {/* Add other header elements like user profile/settings if needed later */}
    </header>
  );
}
