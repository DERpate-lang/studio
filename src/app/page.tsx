
import { AnniversaryCounter } from "@/components/anniversary-counter";
import { PageContainer } from "@/components/page-container";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Adjusted imports
import DecorativeBorder from "@/components/decorative-border";
import { QuickLinksClient } from "@/components/quick-links-client"; // Import the new client component

// Use string names for icons
const quickLinks = [
  { href: "/memories", label: "Our Memories", icon: "BookHeart", description: "Relive cherished moments together." },
  { href: "/notes", label: "Love Notes", icon: "StickyNote", description: "Share sweet nothings and heartfelt words." },
  { href: "/gallery", label: "Photo Album", icon: "GalleryVertical", description: "Browse through your captured smiles." },
  { href: "/milestones", label: "Our Milestones", icon: "Milestone", description: "Celebrate the journey's highlights." },
  { href: "/love-letter-generator", label: "AI Love Letter", icon: "Wand2", description: "Get inspired for your next message." },
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
            {/* Use the QuickLinksClient component here */}
            <QuickLinksClient quickLinks={quickLinks} />
          </CardContent>
        </DecorativeBorder>
      </div>
    </PageContainer>
  );
}
