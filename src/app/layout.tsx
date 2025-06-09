import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { SidebarNav } from '@/components/sidebar-nav';
import { Toaster } from "@/components/ui/toaster";
import FallingPetals from '@/components/falling-petals';

export const metadata: Metadata = {
  title: 'Eternal Flame',
  description: 'Cherish your love story.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background text-foreground">
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" className="border-r border-primary/20 shadow-lg">
            <div className="flex h-16 items-center justify-center border-b border-primary/20">
               {/* Placeholder for logo or app name in sidebar itself if needed */}
            </div>
            <SidebarNav />
          </Sidebar>
          <SidebarInset className="flex flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
        <FallingPetals />
      </body>
    </html>
  );
}
