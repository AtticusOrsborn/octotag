'use client';

import { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
}

interface OctopusData {
  id: number;
  position: { x: number; y: number };
  isMoving: boolean;
  justWrapped: boolean;
  isCaught: boolean;
  isPopping?: boolean;
}

interface CatchBubble {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function Octopus() {
  const [octopi, setOctopi] = useState<OctopusData[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [initialized, setInitialized] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [finalDuration, setFinalDuration] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [catchBubbles, setCatchBubbles] = useState<CatchBubble[]>([]);

  const NUM_OCTOPI = 100;
  const SAFE_DISTANCE = 100; // Reduced safe distance to make catching possible
  const DETECTION_RADIUS = 350;
  const MIN_SPEED = 5;
  const MAX_SPEED = 15;
  const IDLE_SPEED = 4; // Doubled from 2
  const PADDING = 60;
  const CENTER_PUSH = 200; // Doubled from 100
  const CATCH_DISTANCE = 50;

  // Fishtank dimensions
  const TANK_WIDTH = 200;
  const TANK_HEIGHT = 400;
  const TANK_PADDING = 20;
  const CAUGHT_OCTOPUS_SIZE = 30;

  // Format time in mm:ss.ms format
  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Get current time display
  const getTimeDisplay = () => {
    if (!startTime) return '00:00.00';
    if (isGameComplete) {
      return formatTime(endTime! - startTime);
    }
    return formatTime(Date.now() - startTime);
  };

  // Helper function to get random position in fishtank
  const getRandomTankPosition = () => {
    return {
      x: dimensions.width - TANK_WIDTH + TANK_PADDING + Math.random() * (TANK_WIDTH - 2 * TANK_PADDING),
      y: TANK_PADDING + Math.random() * (TANK_HEIGHT - 2 * TANK_PADDING)
    };
  };

  // Helper function to wrap position
  const wrapPosition = (pos: { x: number; y: number }) => {
    let newX = pos.x;
    let newY = pos.y;
    let wrapped = false;

    if (newX < -PADDING) {
      newX = dimensions.width - CENTER_PUSH;
      wrapped = true;
    } else if (newX > dimensions.width + PADDING) {
      newX = CENTER_PUSH;
      wrapped = true;
    }

    if (newY < -PADDING) {
      newY = dimensions.height - CENTER_PUSH;
      wrapped = true;
    } else if (newY > dimensions.height + PADDING) {
      newY = CENTER_PUSH;
      wrapped = true;
    }

    return { position: { x: newX, y: newY }, wrapped };
  };

  // Helper function to get a unique target position near center for each octopus
  const getOctopusTargetPosition = (id: number) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Create a more varied distribution using multiple factors
    const baseAngle = (id * Math.PI * 2) / NUM_OCTOPI;
    const timeOffset = Math.sin(Date.now() / 5000 + id * 0.1) * Math.PI; // Slow rotation over time
    const angle = baseAngle + timeOffset;
    
    // Use multiple radii to create clusters at different distances
    const innerRadius = 100;
    const outerRadius = 250;
    const radiusMultiplier = Math.sin(id * 2.7) * 0.5 + 0.5; // Creates varied distances
    const radius = innerRadius + (outerRadius - innerRadius) * radiusMultiplier;
    
    // Add some controlled randomness
    const jitterX = (Math.random() - 0.5) * 50;
    const jitterY = (Math.random() - 0.5) * 50;
    
    return {
      x: centerX + Math.cos(angle) * radius + jitterX,
      y: centerY + Math.sin(angle) * radius + jitterY
    };
  };

  // Helper function to calculate movement towards center
  const moveTowardsCenter = (octopus: OctopusData) => {
    if (octopus.isCaught) {
      const tankPos = getRandomTankPosition();
      return tankPos;
    }

    const target = getOctopusTargetPosition(octopus.id);
    const dx = target.x - octopus.position.x;
    const dy = target.y - octopus.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate how close to the edge the octopus is
    const distanceFromEdgeX = Math.min(octopus.position.x, dimensions.width - octopus.position.x);
    const distanceFromEdgeY = Math.min(octopus.position.y, dimensions.height - octopus.position.y);
    const edgeProximity = Math.min(distanceFromEdgeX, distanceFromEdgeY);
    
    // More aggressive speed scaling
    const baseSpeed = IDLE_SPEED * (1 + Math.max(0, (800 - edgeProximity) / 100));
    const speedMultiplier = Math.min(4, 1 + distance / 300); // More aggressive distance scaling

    if (distance > 5) {
      const angle = Math.atan2(dy, dx);
      const waveOffset = Math.sin(Date.now() / 1000 + octopus.id * 0.5) * 0.2; // Reduced wave offset for more direct movement
      const adjustedAngle = angle + waveOffset;
      
      let newX = octopus.position.x + Math.cos(adjustedAngle) * baseSpeed * speedMultiplier;
      let newY = octopus.position.y + Math.sin(adjustedAngle) * baseSpeed * speedMultiplier;

      return { x: newX, y: newY };
    }
    return octopus.position;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create custom cursor
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      cursor.innerHTML = '🕸️'; // Changed to net emoji
      document.body.appendChild(cursor);

      // Initialize dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });

      // Initialize octopi in a spiral pattern
      const newOctopi: OctopusData[] = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const spiralSpacing = Math.min(width, height) / (Math.sqrt(NUM_OCTOPI) * 1.8); // Adjusted spacing for more octopi

      for (let i = 0; i < NUM_OCTOPI; i++) {
        const angle = i * (Math.PI * 2) / NUM_OCTOPI * 3;
        const radius = spiralSpacing * Math.sqrt(i);
        newOctopi.push({
          id: i,
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          },
          isMoving: false,
          justWrapped: false,
          isCaught: false
        });
      }
      setOctopi(newOctopi);
      setInitialized(true);

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        document.body.removeChild(cursor);
      };
    }
  }, []);

  // Reduce bubble creation frequency
  useEffect(() => {
    const movingOctopi = octopi.filter(o => o.isMoving && !o.isCaught);
    if (movingOctopi.length > 0 && initialized) {
      const interval = setInterval(() => {
        // Only create bubbles for a subset of moving octopi
        const randomOctopus = movingOctopi[Math.floor(Math.random() * movingOctopi.length)];
        const newBubble = {
          id: Date.now(),
          x: randomOctopus.position.x + (Math.random() - 0.5) * 30,
          y: randomOctopus.position.y + (Math.random() - 0.5) * 30,
        };
        setBubbles(prev => [...prev, newBubble]);
      }, 200); // Reduced frequency

      return () => clearInterval(interval);
    }
  }, [octopi, initialized]);

  // Keep fewer bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => prev.slice(-20)); // Reduced max bubbles
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Add continuous movement effect
  useEffect(() => {
    if (!initialized) return;

    const moveInterval = setInterval(() => {
      setOctopi(prevOctopi => prevOctopi.map(octopus => {
        if (!octopus.isMoving && !octopus.isCaught) {
          const newPosition = moveTowardsCenter(octopus);
          return {
            ...octopus,
            position: newPosition,
            isMoving: true
          };
        }
        return octopus;
      }));
    }, 50);

    return () => clearInterval(moveInterval);
  }, [dimensions, initialized]);

  useEffect(() => {
    if (!initialized) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    let timerInterval: NodeJS.Timeout;
    if (!isGameComplete) {
      timerInterval = setInterval(() => {
        setOctopi(prev => [...prev]); // Force re-render to update timer
      }, 10);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [initialized, isGameComplete, startTime]);

  useEffect(() => {
    if (!initialized || isGameComplete) return;  // Don't process mouse moves if game is complete

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Update custom cursor
      const cursor = document.querySelector('.custom-cursor') as HTMLElement;
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        cursor.style.display = 'block';
      }
      
      // Update each octopus
      setOctopi(prevOctopi => {
        let newCaughtCount = 0;
        const updatedOctopi = prevOctopi.map(octopus => {
          // Count already caught octopi
          if (octopus.isCaught) {
            newCaughtCount++;
            return octopus;
          }

          const dx = e.clientX - octopus.position.x;
          const dy = e.clientY - octopus.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check if octopus is caught
          if (distance < CATCH_DISTANCE) {
            newCaughtCount++;
            // Create fewer catch bubbles
            const newBubbles = [...Array(4)].map((_, i) => ({
              id: Date.now() + i,
              x: octopus.position.x,
              y: octopus.position.y,
              angle: (i * Math.PI * 2) / 4
            }));
            setCatchBubbles(prev => [...prev, ...newBubbles]);
            setTimeout(() => {
              setCatchBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)));
            }, 300); // Reduced animation duration
            return {
              ...octopus,
              isCaught: true,
              isPopping: true,
              isMoving: false
            };
          }

          if (distance < DETECTION_RADIUS || octopus.justWrapped) {
            let angle = Math.atan2(dy, dx);
            
            if (octopus.justWrapped) {
              const centerDx = dimensions.width / 2 - octopus.position.x;
              const centerDy = dimensions.height / 2 - octopus.position.y;
              const centerAngle = Math.atan2(centerDy, centerDx);
              angle = (angle + centerAngle) / 2;
            }
            
            const speedFactor = Math.min(1, Math.max(0, (SAFE_DISTANCE - distance) / SAFE_DISTANCE));
            const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * speedFactor;
            
            let newX = octopus.position.x - Math.cos(angle) * speed;
            let newY = octopus.position.y - Math.sin(angle) * speed;

            const { position: wrappedPosition, wrapped } = wrapPosition({ x: newX, y: newY });

            if (wrapped) {
              setTimeout(() => {
                setOctopi(prev => prev.map(o => 
                  o.id === octopus.id ? { ...o, justWrapped: false } : o
                ));
              }, 500);
            }

            return {
              ...octopus,
              position: wrappedPosition,
              isMoving: true,
              justWrapped: wrapped ? true : octopus.justWrapped
            };
          }

          return {
            ...octopus,
            isMoving: false
          };
        });

        // Update caught count and check for game completion
        setCaughtCount(newCaughtCount);
        
        if (newCaughtCount === NUM_OCTOPI && !isGameComplete) {
          const finalEndTime = Date.now();
          setEndTime(finalEndTime);
          setIsGameComplete(true);
          console.log('Game Complete!', { 
            caughtCount, 
            NUM_OCTOPI,
            startTime,
            finalEndTime,
            duration: finalEndTime - startTime! 
          });
        }

        return updatedOctopi;
      });
    };

    const handleMouseLeave = () => {
      const cursor = document.querySelector('.custom-cursor') as HTMLElement;
      if (cursor) {
        cursor.style.display = 'none';
      }
    };

    const handleMouseEnter = () => {
      const cursor = document.querySelector('.custom-cursor') as HTMLElement;
      if (cursor) {
        cursor.style.display = 'block';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [dimensions, initialized, isGameComplete, startTime]);

  const handleMouseDown = () => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) cursor.classList.add('active');
  };

  const handleMouseUp = () => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) cursor.classList.remove('active');
  };

  useEffect(() => {
    if (!initialized) return;

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [initialized]);

  const handleRestart = () => {
    // Reset game state
    setCaughtCount(0);
    setStartTime(Date.now());
    setEndTime(null);
    setFinalDuration(null);
    setIsGameComplete(false);
    setBubbles([]);
    setCatchBubbles([]);

    // Reinitialize octopi in spiral pattern
    const newOctopi: OctopusData[] = [];
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const spiralSpacing = Math.min(dimensions.width, dimensions.height) / (Math.sqrt(NUM_OCTOPI) * 1.8);

    for (let i = 0; i < NUM_OCTOPI; i++) {
      const angle = i * (Math.PI * 2) / NUM_OCTOPI * 3;
      const radius = spiralSpacing * Math.sqrt(i);
      newOctopi.push({
        id: i,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        },
        isMoving: false,
        justWrapped: false,
        isCaught: false
      });
    }
    setOctopi(newOctopi);
  };

  if (!initialized) return null;

  return (
    <>
      {/* Background gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #0c4a6e 0%, #082f49 100%)',
        zIndex: -2
      }} />

      {/* Ocean Ambiance - Reduced count and complexity */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -1,
        opacity: isGameComplete ? 0.5 : 1,
        transition: 'opacity 0.5s ease-out'
      }}>
        {/* Light rays - reduced count */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`ray-${i}`}
            style={{
              position: 'fixed',
              top: '-20%',
              left: `${30 + i * 20}%`,
              width: '150px',
              height: '120vh',
              background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%)',
              transform: `rotate(${15 + i * 5}deg)`,
              transformOrigin: 'top center',
              animation: `ray ${15 + i * 2}s ease-in-out infinite`,
              opacity: 0.2
            }}
          />
        ))}

        {/* Ambient Bubbles - reduced count */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`ambient-bubble-${i}`}
            style={{
              position: 'fixed',
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              animation: `floatBubble ${15 + Math.random() * 10}s infinite linear`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.4
            }}
          />
        ))}
        
        {/* Seaweed - reduced count and simplified */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`seaweed-${i}`}
            style={{
              position: 'fixed',
              left: `${(i * 20) + Math.random() * 5}%`,
              bottom: '-20px',
              width: '8px',
              height: `${80 + Math.random() * 20}px`,
              background: '#065f46',
              borderRadius: '4px',
              transformOrigin: 'bottom',
              animation: `sway ${6 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      {/* Game Title */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        fontFamily: '"Gill Sans", "Trebuchet MS", Calibri, sans-serif'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          position: 'relative',
          padding: '0 20px',
          letterSpacing: '2px'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #0c4a6e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            animation: 'titleGlow 3s ease-in-out infinite'
          }}>
            OCTOTAG
          </div>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0369a1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: 0.7
          }}>
            OCTOTAG
          </div>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: 0.5
          }}>
            OCTOTAG
          </div>
          <div style={{ opacity: 0 }}>OCTOTAG</div>
          <div style={{
            fontSize: '14px',
            color: '#7dd3fc',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            marginTop: '5px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            animation: 'subtitlePulse 2s ease-in-out infinite',
            fontWeight: 'normal'
          }}>
            Deep Sea Chase
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard" style={{
        position: 'fixed',
        right: '20px',
        top: '20px',
        width: `${TANK_WIDTH + 40}px`,
        background: 'linear-gradient(135deg, rgba(0, 67, 101, 0.85) 0%, rgba(0, 42, 64, 0.95) 100%)',
        borderRadius: '15px',
        border: '2px solid rgba(127, 219, 255, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '15px',
        color: 'white',
        fontFamily: '"Gill Sans", "Trebuchet MS", Calibri, sans-serif',
        overflow: 'hidden',
        zIndex: 100
      }}>
        {/* Decorative waves */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(127, 219, 255, 0.2) 50%, transparent 100%)',
          animation: 'wave 2s infinite linear'
        }} />
        
        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '12px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          letterSpacing: '0.5px',
          background: 'linear-gradient(180deg, #fff 0%, #7dd3fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))'
        }}>
          Octopus Tracker
        </div>

        {/* Stats container */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '10px'
        }}>
          {/* Caught count with progress bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>Tagged</span>
              <span style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#7dd3fc'
              }}>
                {caughtCount}/{NUM_OCTOPI}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(caughtCount / NUM_OCTOPI) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #7dd3fc 0%, #38bdf8 100%)',
                borderRadius: '3px',
                transition: 'width 0.3s ease-out',
                boxShadow: '0 0 10px rgba(125, 211, 252, 0.5)'
              }} />
            </div>
          </div>

          {/* Time */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Time</span>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#7dd3fc'
            }}>
              {getTimeDisplay()}
            </span>
          </div>
        </div>

        {/* Decorative bubbles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              bottom: '-20px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              animation: `bubble ${3 + Math.random() * 4}s infinite linear`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Congratulations Overlay */}
      {isGameComplete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.5s ease-out',
          fontFamily: '"Gill Sans", "Trebuchet MS", Calibri, sans-serif'
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #7dd3fc 0%, #0ea5e9 50%, #0369a1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'congratsGlow 2s ease-in-out infinite',
            letterSpacing: '2px'
          }}>
            Victory!
          </div>
          <div style={{
            fontSize: '24px',
            color: '#7dd3fc',
            marginBottom: '30px',
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            You caught all {NUM_OCTOPI} octopi in<br/>
            <span style={{ 
              fontSize: '36px', 
              fontWeight: 'bold',
              display: 'block',
              margin: '10px 0',
              textShadow: '0 0 10px rgba(125, 211, 252, 0.5)',
              fontFamily: 'monospace'
            }}>
              {getTimeDisplay()}
            </span>
          </div>
          <button
            onClick={handleRestart}
            className="play-again-button"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
              border: 'none',
              borderRadius: '25px',
              padding: '15px 40px',
              fontSize: '18px',
              color: 'white',
              cursor: 'pointer',
              transform: 'scale(1)',
              transition: 'all 0.2s ease-out',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bubble {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px); opacity: 0; }
        }

        @keyframes floatBubble {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }

        @keyframes sway {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }

        @keyframes ray {
          0% { opacity: 0.1; }
          50% { opacity: 0.2; }
          100% { opacity: 0.1; }
        }

        @keyframes titleGlow {
          0% { filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) brightness(1); }
          50% { filter: drop-shadow(0 2px 15px rgba(14, 165, 233, 0.5)) brightness(1.2); }
          100% { filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) brightness(1); }
        }

        @keyframes congratsGlow {
          0% { filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.3)); }
          50% { filter: drop-shadow(0 0 40px rgba(14, 165, 233, 0.6)); }
          100% { filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.3)); }
        }

        @keyframes subtitlePulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popCatch {
          0% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
        }

        .custom-cursor {
          filter: drop-shadow(0 0 10px rgba(125, 211, 252, 0.5));
          transition: transform 0.2s ease-out;
        }

        .custom-cursor.active {
          transform: scale(1.2);
        }

        .octopus {
          filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
          transition: transform 0.1s ease-out, font-size 0.3s ease-out, filter 0.3s ease-out;
        }

        .octopus:hover {
          filter: drop-shadow(0 0 15px rgba(125, 211, 252, 0.5));
        }

        .play-again-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 25px rgba(14, 165, 233, 0.4);
        }

        .octopus.popping {
          animation: popCatch 0.5s ease-out forwards;
          pointer-events: none;
        }

        .catch-bubble {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }

        @keyframes catchBubble {
          0% { 
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
            opacity: 1;
          }
          100% { 
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(30px);
            opacity: 0;
          }
        }
      `}</style>

      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            '--duration': '2s',
            '--x': `${bubble.x}px`,
            left: bubble.x,
            top: bubble.y,
            opacity: isGameComplete ? 0.3 : 0.6,
            transition: 'opacity 0.5s ease-out'
          } as React.CSSProperties}
        />
      ))}
      {octopi.map(octopus => (
        <div
          key={octopus.id}
          className={`octopus ${octopus.isPopping ? 'popping' : ''}`}
          style={{
            left: `${octopus.position.x}px`,
            top: `${octopus.position.y}px`,
            fontSize: octopus.isCaught ? `${CAUGHT_OCTOPUS_SIZE}px` : '60px',
            transition: 'transform 0.1s ease-out, font-size 0.3s ease-out',
            transform: !octopus.isPopping ? `translate(-50%, -50%) rotate(${
              Math.atan2(mousePos.y - octopus.position.y, mousePos.x - octopus.position.x) * (180 / Math.PI)
            }deg)` : undefined,
            zIndex: octopus.isCaught ? 1000 : 1,
            opacity: isGameComplete ? 0.7 : 1,
            display: octopus.isCaught && !octopus.isPopping ? 'none' : 'block'
          }}
        >
          🐙
        </div>
      ))}

      {/* Render catch bubbles */}
      {catchBubbles.map(bubble => (
        <div
          key={bubble.id}
          className="catch-bubble"
          style={{
            left: bubble.x,
            top: bubble.y,
            animation: 'catchBubble 0.5s ease-out forwards',
            transform: `translate(-50%, -50%) rotate(${bubble.angle}rad) translateX(20px)`
          }}
        />
      ))}
    </>
  );
} 