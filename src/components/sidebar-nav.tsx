
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react"; // Added useState, useEffect
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
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // Defer active state calculation until client has mounted
        const active = isClient ? pathname === item.href : false;
        
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "font-body",
                  active // Use the client-aware active state
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                isActive={active} // Pass the client-aware active state
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
      })}
    </SidebarMenu>
  );
}
