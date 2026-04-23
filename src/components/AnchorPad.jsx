import { ASSETS } from '../constants/assets';
import FractionPlate from './FractionPlate';

const ANCHOR_IMG = {
  idle:    ASSETS.anchorIdle,
  correct:      ASSETS.anchorCorrect,
  correct_hint: ASSETS.anchorCorrect,
  wrong:        ASSETS.anchorWrong,
  break:        ASSETS.anchorBreak,
};

const GLOW = {
  correct:    '0 0 24px 8px #00ff9966',
  wrong:      '0 0 24px 8px #ff330066',
  break:      '0 0 18px 5px #ff000044',
  selectable:   '0 0 18px 6px #4cf4ff55',
  highlight:    '0 0 40px 20px #ffff00', 
  correct_hint: '0 0 40px 20px #ffff00', 
};

/**
 * AnchorPad — Restructured to prevent animation restarts on state changes.
 * 
 * We use nested divs:
 * 1. Outer: Handles global entry/exit animations (spawn, descend, exit).
 * 2. Inner: Handles state-based effects (glow, pulse, floating).
 */
export default function AnchorPad({ x, y, n, d, state, selectable, onClick }) {
  const img  = ANCHOR_IMG[state] ?? ASSETS.anchorIdle;
  const glow = GLOW[state] ?? (selectable ? GLOW.selectable : null);

  // ENTRY/EXIT animations (Outer container)
  // These should only change when the round phase changes drastically
  const outerAnim = 
    state === 'exiting' 
      ? 'anchorExitDown 2.2s cubic-bezier(0.42, 0, 0.58, 1) forwards'
      : state === 'descending'
      ? 'anchorDescend 2.2s cubic-bezier(0.42, 0, 0.58, 1) forwards'
      : 'anchorSpawn 2.2s cubic-bezier(0.42, 0, 0.58, 1) both';

  // IDLE/EFFECT animations (Inner container)
  // These can change without resetting the spawn/descend position
  const innerAnim = 
    (state === 'highlight' || state === 'correct_hint')
      ? 'highlightPulse 1.5s ease-in-out infinite'
      : selectable
      ? 'floatAnchor 2.2s ease-in-out infinite'
      : 'none';

  return (
    <div
      style={{
        position:   'absolute',
        left:       x - 65,
        top:        y - 36,
        width:      130,
        height:     130,
        zIndex:     20,
        animation:  outerAnim,
        pointerEvents: 'none', // Handled by inner
      }}
    >
      <div
        onClick={selectable ? onClick : undefined}
        style={{
          width:         '100%',
          height:        '100%',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           0,
          cursor:        selectable ? 'pointer' : 'default',
          userSelect:    'none',
          filter:        glow ? `drop-shadow(${glow})` : 'none',
          transition:    'filter 0.2s',
          animation:     innerAnim,
          pointerEvents: 'auto',
        }}
      >
        <FractionPlate n={n} d={d} />

        <img
          src={img}
          alt=""
          style={{
            width:      180,
            height:     180,
            objectFit:  'contain',
            marginTop:  -50,
            transition: 'transform 0.1s',
            transform:  selectable ? 'scale(1)' : 'scale(0.95)',
          }}
        />
      </div>
    </div>
  );
}
