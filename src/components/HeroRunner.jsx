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
export default function HeroRunner({ screenX, screenY, heroPhase, faceDir }) {
  const { heroImgWidth, heroImgHeight, heroFeetOffset } = DESCENT_LAYOUT;
  const { fallDurationMs, scrollDurationMs } = GAME_CONFIG;

  // ── Image selection ──────────────────────────────────────────────────────
  // Use walking.gif while patrolling, static character.png otherwise
  // Use walking.gif while patrolling or exiting, static character.png otherwise
  const src = (heroPhase === 'walking' || heroPhase === 'exiting') ? ASSETS.walking : ASSETS.character;

  // ── CSS transition per phase ─────────────────────────────────────────────
  // KEY design: 'landing' phase transition duration matches scrollDurationMs so
  // the hero slides upward precisely in sync with the floor scroll animation.
  const transition =
    heroPhase === 'falling'
      ? `left 200ms ease, top ${fallDurationMs}ms ease-in`
      : heroPhase === 'landing'
      ? `left 200ms ease, top ${scrollDurationMs}ms cubic-bezier(0.42, 0, 0.58, 1)`
      : heroPhase === 'paused'
      ? `left 220ms ease`           // smooth X alignment to tile centre
      : (heroPhase === 'exiting' || heroPhase === 'vanished')
      ? `left 2200ms linear`        // long linear walk off-screen
      : 'none';                     // 'walking' — no transition, raw rAF speed

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
        transition,
        // Flip horizontally when facing left
        transform:       `scaleX(${faceDir === 'left' ? -1 : 1})`,
        transformOrigin: 'center bottom',
        filter:          'drop-shadow(0 3px 8px #000b)',
        pointerEvents:   'none',
        imageRendering:  'auto',
        opacity:         heroPhase === 'vanished' ? 0 : 1,
        // Added opacity transition for vanishing
        transition:      transition + (transition !== 'none' ? ', opacity 0.5s ease' : 'opacity 0.5s ease'),
      }}
    />
  );
}
