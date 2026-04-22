import React from 'react';

/**
 * BirdsDecoration — A subtle aesthetic layer for climb mode.
 * Animates a few small bird silhouettes gliding across the sky.
 */
export default function BirdsDecoration() {
  const birds = [
    { id: 1, top: '19%', delay: '0s', duration: '22s', size: 20 },
    { id: 2, top: '25%', delay: '5s', duration: '18s', size: 25 },
    { id: 3, top: '10%', delay: '12s', duration: '25s', size: 18 },
    { id: 4, top: '30%', delay: '8s', duration: '20s', size: 20 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {birds.map(bird => (
        <div
          key={bird.id}
          style={{
            position: 'absolute',
            top: bird.top,
            left: '-50px',
            width: bird.size,
            height: bird.size,
            animation: `flyAcross ${bird.duration} linear ${bird.delay} infinite`,
          }}
        >
          {/* Simple SVG bird silhouette */}
          <svg viewBox="0 0 100 100" style={{ fill: 'rgba(0,0,0,0.4)', filter: 'blur(0.5px)' }}>
            <path d="M0,50 Q25,0 50,50 Q75,0 100,50 Q75,25 50,75 Q25,25 0,50" />
          </svg>
        </div>
      ))}

      <style>{`
        @keyframes flyAcross {
          from { transform: translateX(0) translateY(0); }
          50% { transform: translateX(50vw) translateY(10px); }
          to { transform: translateX(110vw) translateY(0); }
        }
      `}</style>
    </div>
  );
}
