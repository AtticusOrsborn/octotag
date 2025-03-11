'use client';

import { Octopus } from './components/Octopus';
import { SeaShanty } from './components/SeaShanty';
import { useEffect, useState } from 'react';
import './globals.css';

function Decoration({ emoji, style }: { emoji: string, style: React.CSSProperties }) {
  return <div style={style}>{emoji}</div>;
}

function Bubble({ delay = 0 }: { delay?: number }) {
  const style = {
    '--duration': `${3 + Math.random() * 4}s`,
    '--x': `${Math.random() * 100}%`,
    '--size': `${10 + Math.random() * 20}px`,
    animationDelay: `${delay}s`,
  } as React.CSSProperties;

  return <div className="bubble" style={style} />;
}

export default function Home() {
  const [bubbles, setBubbles] = useState<number[]>([]);

  useEffect(() => {
    // Create initial bubbles
    setBubbles(Array.from({ length: 50 }, (_, i) => i));

    // Add new bubbles periodically
    const interval = setInterval(() => {
      setBubbles(prev => [...prev, prev.length]);
      // Remove old bubbles to prevent too many elements
      if (bubbles.length > 100) {
        setBubbles(prev => prev.slice(-100));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const decorations = [
    { emoji: '🌿', style: { left: '5%', bottom: '10%' }, className: 'seaweed' },
    { emoji: '🌿', style: { left: '15%', bottom: '5%' }, className: 'seaweed' },
    { emoji: '🌿', style: { right: '10%', bottom: '8%' }, className: 'seaweed' },
    { emoji: '🌿', style: { right: '20%', bottom: '12%' }, className: 'seaweed' },
    { emoji: '🐠', style: { left: '20%', top: '20%' }, className: 'fish' },
    { emoji: '🐟', style: { right: '25%', top: '40%' }, className: 'fish' },
    { emoji: '🐡', style: { left: '40%', top: '60%' }, className: 'fish' },
    { emoji: '⭐', style: { right: '15%', bottom: '25%' }, className: 'fish' },
    { emoji: '🐚', style: { left: '10%', bottom: '5%' }, className: 'fish' },
    { emoji: '🪸', style: { right: '5%', bottom: '5%' }, className: 'fish' },
  ];

  return (
    <main className="underwater">
      <h1 className="title">octotag</h1>
      
      {/* Decorations */}
      {decorations.map((dec, i) => (
        <div
          key={i}
          className={dec.className}
          style={{
            ...dec.style,
            animationDelay: `${-i * 0.5}s`,
            filter: `hue-rotate(${i * 30}deg)`,
          }}
        >
          {dec.emoji}
        </div>
      ))}

      {/* Bubbles */}
      {bubbles.map((i) => (
        <Bubble key={i} delay={i * 0.2} />
      ))}

      {/* Custom cursor */}
      <div 
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          fontSize: '32px',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}
        className="custom-cursor"
      >
        🕸️
      </div>

      <Octopus />
      <SeaShanty />
    </main>
  );
} 