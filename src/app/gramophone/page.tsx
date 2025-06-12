
import { PageContainer } from "@/components/page-container";
import { GramophonePlayer } from "@/components/gramophone-player";
import DecorativeBorder from "@/components/decorative-border";

export default function GramophonePage() {
  const vinylImage = "https://images.unsplash.com/photo-1602848597941-0d3d3a2c1241?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx2aW55bCUyMHJlY29yZHxlbnwwfHx8fDE3NDk3NjIwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <PageContainer title="Gramophone Player">
      <DecorativeBorder>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
            <h2 className="text-2xl font-headline text-primary">Retro Vibes</h2>
            <p className="font-body text-foreground/80 text-center">
                Click the vinyl to start the music. Double-click to pause.
            </p>
            <GramophonePlayer audioSrc="/music/lofi.mp3" vinylImageSrc={vinylImage} />
            <div className="mt-6 p-4 bg-muted/50 rounded-md text-sm font-body text-muted-foreground">
                <p className="font-semibold text-primary">Important Audio Note:</p>
                <p>For the player to work, please ensure you have a file named <code>lofi.mp3</code> located in your <code>public/music/</code> directory.</p>
                <p>If the error 'Could not load audio' persists, this file is likely missing or misplaced.</p>
            </div>
        </div>
      </DecorativeBorder>
    </PageContainer>
  );
}
