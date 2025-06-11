
import { PageContainer } from "@/components/page-container";
import { GramophonePlayer } from "@/components/gramophone-player";
import DecorativeBorder from "@/components/decorative-border";

export default function GramophonePage() {
  return (
    <PageContainer title="Gramophone Player">
      <DecorativeBorder>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
            <h2 className="text-2xl font-headline text-primary">Retro Vibes</h2>
            <p className="font-body text-foreground/80 text-center">
                Click the vinyl to start the music. Double-click to pause.
            </p>
            <GramophonePlayer audioSrc="/audio/lofi.mp3" />
            <div className="mt-6 p-4 bg-muted/50 rounded-md text-sm font-body text-muted-foreground">
                <p className="font-semibold text-primary">Important:</p>
                <p>Make sure you have a file named <code>lofi.mp3</code> in your <code>public/audio/</code> directory for the player to work.</p>
            </div>
        </div>
      </DecorativeBorder>
    </PageContainer>
  );
}
