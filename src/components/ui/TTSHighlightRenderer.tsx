"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";

interface TTSHighlightRendererProps {
  text: string;
  deafMode: boolean;
  autoPlay?: boolean;
}

export function TTSHighlightRenderer({ text, deafMode, autoPlay = false }: TTSHighlightRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Split text into words, keeping track of their character offsets
  const wordsWithOffsets = useMemo(() => {
    const list: { word: string; start: number; end: number }[] = [];
    let currentIndex = 0;
    
    // Split by whitespace but keep track of start/end indices in original text
    const words = text.split(/(\s+)/);
    
    words.forEach((part) => {
      const isWhitespace = /^\s+$/.test(part);
      if (!isWhitespace && part.length > 0) {
        list.push({
          word: part,
          start: currentIndex,
          end: currentIndex + part.length,
        });
      }
      currentIndex += part.length;
    });
    
    return list;
  }, [text]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(null);
  }, []);

  // Stop immediately if deafMode gets enabled while reading
  useEffect(() => {
    if (deafMode && isPlaying) {
      stopSpeech();
    }
  }, [deafMode, isPlaying, stopSpeech]);

  const playSpeech = useCallback(() => {
    if (deafMode) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    // Highlight words on boundary events
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        // Find the index of the word containing this character offset
        const matchIdx = wordsWithOffsets.findIndex(
          (w) => charIndex >= w.start && charIndex < w.end
        );
        if (matchIdx !== -1) {
          setCurrentWordIndex(matchIdx);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [deafMode, isPaused, text, wordsWithOffsets]);

  // Trigger autoplay if requested
  useEffect(() => {
    if (autoPlay && !deafMode && !isPlaying) {
      playSpeech();
    }
  }, [autoPlay, deafMode, isPlaying, playSpeech]);

  const pauseSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  if (deafMode) {
    return (
      <div className="rounded-xl border border-stone-800 bg-[#130d2a] p-4 text-slate-400 text-sm">
        <div className="flex items-center gap-2 mb-2 text-violet-400">
          <VolumeX className="w-4 h-4" />
          <span className="font-semibold text-xs uppercase tracking-wider">Speech Suppressed</span>
        </div>
        <p className="leading-relaxed">
          {wordsWithOffsets.map((w, idx) => (
            <span key={idx} className="mr-1">
              {w.word}
            </span>
          ))}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-violet-800/40 bg-[#130d2a] p-5 shadow-lg shadow-violet-950/20">
      {/* Speech Control Panel Header */}
      <div className="flex items-center justify-between border-b border-violet-800/20 pb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Speech Control
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={playSpeech}
              className="p-2 rounded-lg bg-violet-750 hover:bg-violet-700 text-violet-200 transition-colors"
              title="Play Speech"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pauseSpeech}
              className="p-2 rounded-lg bg-amber-900/60 hover:bg-amber-900/80 text-amber-200 transition-colors"
              title="Pause Speech"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={stopSpeech}
              className="p-2 rounded-lg bg-red-950/60 hover:bg-red-950/80 text-red-200 transition-colors"
              title="Stop Speech"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rendered Text with Spans */}
      <div className="text-base leading-relaxed text-slate-200 tracking-wide font-medium">
        {wordsWithOffsets.map((w, idx) => {
          const isHighlighted = idx === currentWordIndex;
          return (
            <span
              key={idx}
              className="inline-block mr-1 rounded px-0.5 transition-all duration-150"
              style={{
                backgroundColor: isHighlighted ? "#7c3aed" : "transparent",
                color: isHighlighted ? "#ffffff" : "inherit",
                transform: isHighlighted ? "scale(1.05)" : "scale(1)",
                fontWeight: isHighlighted ? "bold" : "normal",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
