import DecorativeBorder from "./decorative-border";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function MusicPlayer() {
  // A generic romantic playlist from Spotify. Replace with a specific one if desired.
  const spotifyPlaylistUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DWVtHZZ3Gc8C1?utm_source=generator&theme=0";
  // theme=0 is dark, theme=1 is light. Let's try theme=0 (dark) as it might contrast well with Antique White.
  // Or remove theme param to let it adapt. For Victorian, maybe a specific aesthetic is better.
  // Using default theme which should be light if not specified.
  // The provided URL is for Romantic Ballads, it seems appropriate.

  return (
    <DecorativeBorder>
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">Our Anniversary Playlist</CardTitle>
            <CardDescription className="font-body text-foreground/80">Melodies that tell our story.</CardDescription>
        </CardHeader>
        <CardContent>
            <iframe
                style={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                src={spotifyPlaylistUrl}
                width="100%"
                height="352" // Standard height for Spotify embed
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Playlist Embed"
            ></iframe>
        </CardContent>
    </DecorativeBorder>
  );
}
