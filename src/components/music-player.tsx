
"use client";

import { useState, useEffect } from 'react';
import DecorativeBorder from "./decorative-border";
import { CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"; // Removed Card import as it's not directly used

export function MusicPlayer() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // A generic romantic playlist from Spotify. Replace with a specific one if desired.
  const spotifyPlaylistUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DWVtHZZ3Gc8C1?utm_source=generator&theme=0";

  return (
    <DecorativeBorder>
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">Our Anniversary Playlist</CardTitle>
            <CardDescription className="font-body text-foreground/80">Melodies that tell our story.</CardDescription>
        </CardHeader>
        <CardContent>
            {isClient ? (
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
            ) : (
                <div style={{ width: "100%", height: "352px", backgroundColor: "hsl(var(--muted))", borderRadius: "12px", display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="border border-border">
                    <p className="text-muted-foreground font-body">Loading player...</p>
                </div>
            )}
        </CardContent>
    </DecorativeBorder>
  );
}

