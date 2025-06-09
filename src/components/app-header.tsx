
"use client"; // Make it a client component

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { FlameKindling } from "lucide-react"; 

export function AppHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <SidebarTrigger className="text-primary hover:text-accent" />
      <Link href="/" className="flex items-center gap-2">
        {isClient ? (
          <FlameKindling className="h-8 w-8 text-primary" />
        ) : (
          <div className="h-8 w-8" /> // Placeholder for FlameKindling
        )}
        <h1 className="font-headline text-2xl font-semibold text-primary">
          Eternal Flame
        </h1>
      </Link>
    </header>
  );
}
