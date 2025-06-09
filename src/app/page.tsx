import { AnniversaryCounter } from "@/components/anniversary-counter";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DecorativeBorder from "@/components/decorative-border";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookHeart, StickyNote, GalleryVertical, Milestone, Wand2 } from "lucide-react";

const quickLinks = [
  { href: "/memories", label: "Our Memories", icon: BookHeart, description: "Relive cherished moments together." },
  { href: "/notes", label: "Love Notes", icon: StickyNote, description: "Share sweet nothings and heartfelt words." },
  { href: "/gallery", label: "Photo Album", icon: GalleryVertical, description: "Browse through your captured smiles." },
  { href: "/milestones", label: "Our Milestones", icon: Milestone, description: "Celebrate the journey's highlights." },
  { href: "/love-letter-generator", label: "AI Love Letter", icon: Wand2, description: "Get inspired for your next message." },
];

export default function Home() {
  return (
    <PageContainer title="Welcome to Eternal Flame">
      <div className="space-y-8">
        <AnniversaryCounter />

        <DecorativeBorder>
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">Explore Your Love Story</CardTitle>
            <CardDescription className="font-body text-foreground/80">
              Navigate through the chapters of your shared life.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map(link => (
                <Card key={link.href} className="hover:shadow-xl transition-shadow duration-300 ease-in-out border-primary/20 bg-background/70">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <link.icon className="w-8 h-8 text-accent" />
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
              ))}
            </div>
          </CardContent>
        </DecorativeBorder>
      </div>
    </PageContainer>
  );
}
