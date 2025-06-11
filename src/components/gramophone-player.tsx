
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { PlayCircle, PauseCircle } from "lucide-react";

interface GramophonePlayerProps {
  audioSrc: string;
  vinylImageSrc?: string;
}

export function GramophonePlayer({
  audioSrc,
  vinylImageSrc = "https://placehold.co/200x200.png",
}: GramophonePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.oncanplaythrough = () => {
        setIsAudioLoaded(true);
      };
      // Optional: handle errors during loading
      audioRef.current.onerror = () => {
        console.error("Error loading audio source:", audioSrc);
        setIsAudioLoaded(false); // Or handle more gracefully
      };
    }
  }, [audioSrc]);

  const handlePlay = () => {
    if (audioRef.current && isAudioLoaded) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current && isAudioLoaded) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // More robust click handling to avoid double click firing single click
  let clickTimeout: NodeJS.Timeout | null = null;

  const handleClick = () => {
    if (clickTimeout === null) {
      clickTimeout = setTimeout(() => {
        // This is a single click
        if (audioRef.current && isAudioLoaded) {
          if (audioRef.current.paused) {
            handlePlay();
          } else {
            // If already playing, a single click (as per spec "start playing")
            // could restart or do nothing. Let's make it restart for now.
             audioRef.current.currentTime = 0;
             handlePlay();
          }
        }
        clickTimeout = null;
      }, 250); // 250ms delay to wait for a potential double click
    }
  };

  const handleDoubleClick = () => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    // This is a double click
    if (isPlaying) {
      handlePause();
    }
  };


  return (
    <div className="flex flex-col items-center p-4 border border-primary/20 rounded-lg shadow-lg bg-card max-w-xs mx-auto">
      <div
        className="relative w-48 h-48 sm:w-56 sm:h-56 cursor-pointer group"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        <Image
          src={vinylImageSrc}
          alt="Vinyl record"
          width={200}
          height={200}
          className={`rounded-full shadow-xl transition-transform duration-1000 ease-linear ${
            isPlaying ? "animate-spin-slow" : ""
          }`}
          data-ai-hint="vinyl record"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {isPlaying ? (
            <PauseCircle className="w-16 h-16 text-white/80" />
          ) : (
            <PlayCircle className="w-16 h-16 text-white/80" />
          )}
        </div>
      </div>
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      <p className="mt-4 text-sm text-foreground/70 font-body">
        {isAudioLoaded ? (isPlaying ? "Playing..." : "Paused") : "Loading audio..."}
      </p>
      <p className="mt-1 text-xs text-muted-foreground font-body">
        Single-click to play/restart, double-click to pause.
      </p>
    </div>
  );
}

// Add a slow spin animation to tailwind.config.ts if you want a visual cue for playing
// In tailwind.config.ts:
// theme: {
//   extend: {
//     animation: {
//       'spin-slow': 'spin 10s linear infinite',
//     }
//   }
// }
// Make sure to rebuild or restart dev server if you change tailwind config.
