import { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { DESCENT_LAYOUT } from '../constants/gameConfig';

/**
 * FractionFloorTile — a single clickable floor tile that displays a fraction.
 *
 * Props:
 *   fraction  — { numerator, denominator }
 *   tileState — 'idle' | 'correct' | 'wrong' | 'crack' | 'broken'
 *   disabled  — boolean (non-interactive tile)
 *   onClick   — () => void
 */
const TILE_IMAGES = {
  idle:    () => ASSETS.floorIdle,
  correct: () => ASSETS.floorCorrect,
  wrong:   () => ASSETS.floorWrong,
  crack:   () => ASSETS.floorCrack,
  broken:  () => ASSETS.floorBroken,
};

export default function FractionFloorTile({ fraction, tileState, disabled, onClick }) {
  const [hovered, setHovered] = useState(false);

  const src      = (TILE_IMAGES[tileState] ?? TILE_IMAGES.idle)();
  const isIdle   = tileState === 'idle';
  const isWrong  = tileState === 'wrong';
  const isBroken = tileState === 'broken';

  // Glow / shake filters
  const filter = isWrong
    ? 'drop-shadow(0 0 10px #ff4444) brightness(1.1)'
    : (hovered && isIdle && !disabled)
    ? 'drop-shadow(0 0 10px #ffe740) brightness(1.15)'
    : tileState === 'correct'
    ? 'drop-shadow(0 0 10px #1de9b6) brightness(1.1)'
    : 'none';

  return (
    <div
      onClick={(!disabled && !isBroken) ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:   'relative',
        left: "60px",
        top: "42px",
        width:      DESCENT_LAYOUT.tileWidth,
        height:     DESCENT_LAYOUT.tileHeight,
        cursor:     (disabled || isBroken) ? 'default' : 'pointer',
        userSelect: 'none',
        // shake on wrong answer (CSS keyframe defined in index.css)
        animation:  isWrong ? 'tileShake 0.45s ease' : 'none',
      }}
    >
      {/* ── Tile background image ── */}
      <img
        src={src}
        alt=""
        draggable={false}
        
        style={{
          width:      '80%',
          height:     '80%',
          objectFit:  'fill',
          display:    'block',
          filter,
          transition: 'filter 0.2s ease',
        }}
      />

      {/* ── Fraction text overlay (hidden when broken) ── */}
      {!isBroken && (
        <div
          style={{
            position:       'absolute',
            inset:          "30% 25% 50% 5%",
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            pointerEvents:  'none',
          }}
        >
          <div style={{ textAlign: 'center', lineHeight: 1 }}>
            {/* Numerator */}
            <div
              style={{
                fontSize:      18,
                fontWeight:    900,
                color:         isWrong ? '#ff8888' : '#fffde7',
                textShadow:    '0 1px 4px #000c, 0 0 6px #0008',
                borderBottom:  `2px solid ${isWrong ? '#ff8888' : '#fffde7aa'}`,
                paddingBottom: 2,
                lineHeight:    1,
                letterSpacing: 0.5,
              }}
            >
              {fraction.numerator}
            </div>
            {/* Denominator */}
            <div
              style={{
                fontSize:    16,
                fontWeight:  900,
                color:       isWrong ? '#ff8888' : '#fffde7',
                textShadow:  '0 1px 4px #000c',
                paddingTop:  2,
                lineHeight:  1,
                letterSpacing: 0.5,
              }}
            >
              {fraction.denominator}
            </div>
          </div>
        </div>
      )}

      {/* ── Broken hole visual hint ── */}
      {isBroken && (
        <div
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            pointerEvents:  'none',
          }}
        >
          <div style={{ fontSize: 20 }}>🕳️</div>
        </div>
      )}
    </div>
  );
}
