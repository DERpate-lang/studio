
"use client";

import { useState, useEffect, type ComponentType } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideProps } from "lucide-react";
import { BookHeart, StickyNote, GalleryVertical, Milestone, Wand2 } from "lucide-react";

// Map string names to actual Lucide components
const iconMap: { [key: string]: ComponentType<LucideProps> } = {
  BookHeart,
  StickyNote,
  GalleryVertical,
  Milestone,
  Wand2,
};

interface QuickLinkItem {
  href: string;
  label: string;
  icon: string; // Expect icon name as string
  description: string;
}

interface QuickLinksClientProps {
  quickLinks: QuickLinkItem[];
}

export function QuickLinksClient({ quickLinks = [] }: QuickLinksClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickLinks.map(link => {
        const IconComponent = iconMap[link.icon];
        return (
          <Card key={link.href} className="hover:shadow-xl transition-shadow duration-300 ease-in-out border-primary/20 bg-background/70">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              {isClient && IconComponent ? (
                <IconComponent className="w-8 h-8 text-accent" />
              ) : (
                <div className="w-8 h-8" /> // Placeholder for icon
              )}
              <CardTitle className="font-headline text-xl text-primary">{link.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-foreground/70 font-body">{link.description}</p>
              <Link href={link.href} passHref>
                <Button variant="link" className="text-primary hover:text-accent p-0 font-body">
                  Go to {link.label} &rarr;
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
