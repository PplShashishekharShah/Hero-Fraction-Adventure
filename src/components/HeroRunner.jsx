import { ASSETS } from '../constants/assets';
import { DESCENT_LAYOUT, GAME_CONFIG } from '../constants/gameConfig';

/**
 * HeroRunner — hero character for descent mode.
 *
 * Coordinate system:
 *   screenX — hero centre X (in screen/viewport space)
 *   screenY — hero feet Y  (in screen/viewport space = worldY - worldOffset)
 *
 * CSS transition strategy:
 *   'walking' → rapid X updates via rAF, NO transition (avoids lag)
 *   'paused'  → allows a short X transition for alignment to tile centre
 *   'falling' → animates Y downward (fall to lower floor)
 *   'landing' → animates Y upward WITH the world scroll (synced duration)
 *
 * Props:
 *   screenX   — number
 *   screenY   — number
 *   heroPhase — 'walking' | 'paused' | 'falling' | 'landing'
 *   faceDir   — 'left' | 'right'
 */
export default function HeroRunner({ screenX, screenY, heroPhase, faceDir, walkDuration = 450 }) {
  const { heroImgWidth, heroImgHeight, heroFeetOffset } = DESCENT_LAYOUT;
  const { fallDurationMs, scrollDurationMs } = GAME_CONFIG;

  // ── Image selection ──────────────────────────────────────────────────────
  // Use drill.gif when drilling, walking.gif which patrolling/exiting/moving, else static
  const src = heroPhase === 'drilling'
    ? ASSETS.drill
    : (heroPhase === 'walking' || heroPhase === 'exiting' || heroPhase === 'moving_to_tile') ? ASSETS.walking : ASSETS.character;

  const isDrilling = heroPhase === 'drilling';

  // ── CSS transition per phase ─────────────────────────────────────────────
  // KEY design: 'landing' phase transition duration matches scrollDurationMs so
  // the hero slides upward precisely in sync with the floor scroll animation.
  const transition =
    heroPhase === 'falling'
      ? `left 200ms ease, top ${fallDurationMs}ms ease-in`
      : heroPhase === 'landing'
      ? `left 200ms ease, top ${scrollDurationMs}ms cubic-bezier(0.42, 0, 0.58, 1)`
      : heroPhase === 'moving_to_tile'
      ? `left ${walkDuration}ms linear` // Constant speed walk
      : (heroPhase === 'paused' || heroPhase === 'drilling')
      ? `left 450ms ease-out`           // smooth X alignment to tile centre
      : (heroPhase === 'exiting' || heroPhase === 'vanished')
      ? `left 2200ms linear`            // long linear walk off-screen
      : 'none';                         // 'walking' — no transition, raw rAF speed

  return (
    <img
      src={src}
      alt="Web Hero"
      draggable={false}
      style={{
        position:        'absolute',
        left:            screenX - heroImgWidth / 2,
        top:             screenY - heroFeetOffset,
        width:           heroImgWidth,
        height:          heroImgHeight,
        objectFit:       'contain',
        zIndex:          20,
        // Flip horizontally when facing left, scale UP, and NUDGE DOWN if drilling
        transform:       `scaleX(${faceDir === 'left' ? -1 : 1}) ${isDrilling ? 'scale(1.4) translateY(18px)' : 'scale(1)'}`,
        transformOrigin: 'center bottom',
        filter:          'drop-shadow(0 3px 8px #000b)',
        pointerEvents:   'none',
        imageRendering:  'auto',
        opacity:         heroPhase === 'vanished' ? 0 : 1,
        // Added opacity transition for vanishing
        transition:      `${transition}${transition !== 'none' ? ', opacity 0.5s ease' : ''}`,
      }}
    />
  );
}
