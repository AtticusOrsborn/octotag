'use client';

import { useState, useEffect, useRef } from 'react';

export function SeaShanty() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioInitialized) {
      const audio = new Audio('/octotag.wav');
      audio.loop = true;
      audio.volume = volume;
      audioRef.current = audio;
      setAudioInitialized(true);

      // Add event listener for when audio ends
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.log("Please interact with the page first to enable audio.");
      }
    }
  };

  return (
    <div className="music-controls">
      <div className="music-controls-inner">
        <button
          onClick={togglePlay}
          className="music-toggle"
          aria-label={isPlaying ? 'Pause shanty' : 'Play shanty'}
        >
          <span className="music-icon">{isPlaying ? '🐚' : '🎵'}</span>
          <span className="music-text">{isPlaying ? 'SILENCE THE SEAS' : 'PLAY SEA SHANTY'}</span>
        </button>
        <div className="volume-control">
          <span className="volume-icon">🌊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="volume-slider"
            aria-label="Volume control"
          />
          <span className="volume-level">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
} 