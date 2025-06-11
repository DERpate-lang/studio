
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  BookHeart,
  StickyNote,
  GalleryVertical,
  Milestone,
  Wand2,
  Disc3, 
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<LucideProps>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/memories", label: "Memories", icon: BookHeart },
  { href: "/notes", label: "Love Notes", icon: StickyNote },
  { href: "/gallery", label: "Photo Gallery", icon: GalleryVertical },
  { href: "/milestones", label: "Milestones", icon: Milestone },
  { href: "/love-letter-generator", label: "Love Letter AI", icon: Wand2 },
  { href: "/gramophone", label: "Music Player", icon: Disc3 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarMenu>
      {isClient
        ? navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "font-body",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    isActive={active}
                    tooltip={item.label}
                  >
                    {/* Wrap icon and label in a span. This span becomes the direct child of Slot. */}
                    <span>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })
        : navItems.map((item, index) => ( // Render placeholders/skeletons on server and initial client render
            <SidebarMenuItem key={`skeleton-${item.label}-${index}`}>
              <SidebarMenuButton
                className={cn("font-body")}
                isActive={false}
                tooltip={item.label}
                // Removed asChild here for skeleton path to ensure it renders a <button>
              >
                <span>
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="ml-2 h-4 w-[80px] rounded" />
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
    </SidebarMenu>
  );
}
