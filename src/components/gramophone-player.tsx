
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { PlayCircle, PauseCircle, AlertTriangle } from "lucide-react";

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
  const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      // Reset states when audioSrc changes or component mounts
      setIsAudioLoaded(false);
      setAudioLoadError(null);
      setIsPlaying(false); // Stop playing if src changes

      audioRef.current.oncanplaythrough = () => {
        setIsAudioLoaded(true);
        setAudioLoadError(null);
      };

      audioRef.current.onerror = () => {
        let errorDetails = "Unknown error.";
        if (audioRef.current?.error) {
          switch (audioRef.current.error.code) {
            case 1: // MEDIA_ERR_ABORTED
              errorDetails = "Audio playback aborted by user or script.";
              break;
            case 2: // MEDIA_ERR_NETWORK
              errorDetails = "A network error occurred while fetching the audio.";
              break;
            case 3: // MEDIA_ERR_DECODE
              errorDetails = "Audio decoding error. The file might be corrupted or in an unsupported format.";
              break;
            case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
              errorDetails = "Audio source not supported. The URL might be incorrect or the format not playable.";
              break;
            default:
              errorDetails = `An unknown error occurred (Code: ${audioRef.current.error.code}).`;
          }
        }
        const userMessage = `Could not load audio from "${audioSrc}". Please check the file path and format.`;
        console.error(`GramophonePlayer Error: ${userMessage} Details: ${errorDetails}`, audioRef.current?.error);
        setAudioLoadError(userMessage);
        setIsAudioLoaded(false);
      };

      // Attempt to load the new source
      audioRef.current.load();
    }
    // Cleanup: remove event listeners if the component unmounts or audioSrc changes before loading finishes.
    const currentAudioRef = audioRef.current;
    return () => {
      if (currentAudioRef) {
        currentAudioRef.oncanplaythrough = null;
        currentAudioRef.onerror = null;
      }
    };
  }, [audioSrc]); // Re-run effect if audioSrc changes

  const handlePlay = () => {
    if (audioRef.current && isAudioLoaded && !audioLoadError) {
      audioRef.current.play().catch(err => {
        console.error("Error attempting to play audio:", err);
        setAudioLoadError("Could not start audio playback.");
      });
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current && isAudioLoaded && !audioLoadError) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  let clickTimeout: NodeJS.Timeout | null = null;

  const handleClick = () => {
    if (audioLoadError) return; // Don't process clicks if there's an error
    if (clickTimeout === null) {
      clickTimeout = setTimeout(() => {
        if (audioRef.current && isAudioLoaded) {
          if (audioRef.current.paused) {
            handlePlay();
          } else {
             audioRef.current.currentTime = 0;
             handlePlay();
          }
        }
        clickTimeout = null;
      }, 250);
    }
  };

  const handleDoubleClick = () => {
    if (audioLoadError) return;
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
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
        tabIndex={audioLoadError ? -1 : 0}
        aria-label={audioLoadError ? "Audio error" : isPlaying ? "Pause audio" : "Play audio"}
        aria-disabled={!!audioLoadError}
      >
        <Image
          src={vinylImageSrc}
          alt="Vinyl record"
          width={200}
          height={200}
          className={`rounded-full shadow-xl transition-transform duration-1000 ease-linear ${
            isPlaying && !audioLoadError ? "animate-spin-slow" : ""
          } ${audioLoadError ? 'opacity-50' : ''}`}
          data-ai-hint="vinyl record"
        />
        {!audioLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <PauseCircle className="w-16 h-16 text-white/80" />
            ) : (
              <PlayCircle className="w-16 h-16 text-white/80" />
            )}
          </div>
        )}
         {audioLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/30 rounded-full">
            <AlertTriangle className="w-16 h-16 text-destructive-foreground/80" />
          </div>
        )}
      </div>
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      <p className={`mt-4 text-sm font-body ${audioLoadError ? 'text-destructive' : 'text-foreground/70'}`}>
        {audioLoadError
          ? "Audio Error"
          : isAudioLoaded
          ? isPlaying
            ? "Playing..."
            : "Paused"
          : "Loading audio..."}
      </p>
      {audioLoadError && (
        <p className="mt-1 px-2 text-xs text-destructive font-body text-center">{audioLoadError}</p>
      )}
      {!audioLoadError && (
        <p className="mt-1 text-xs text-muted-foreground font-body">
          Single-click to play/restart, double-click to pause.
        </p>
      )}
    </div>
  );
}
