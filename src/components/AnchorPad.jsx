import { ASSETS } from '../constants/assets';
import FractionPlate from './FractionPlate';

const ANCHOR_IMG = {
  idle:    ASSETS.anchorIdle,
  correct: ASSETS.anchorCorrect,
  wrong:   ASSETS.anchorWrong,
  break:   ASSETS.anchorBreak,
};

const GLOW = {
  correct:    '0 0 24px 8px #00ff9966',
  wrong:      '0 0 24px 8px #ff330066',
  break:      '0 0 18px 5px #ff000044',
  selectable: '0 0 18px 6px #4cf4ff55',
};

/**
 * AnchorPad — bigger anchor with spawn animation and tighter plate gap.
 *
 * Container gets anchorSpawn once (keyed per round in parent).
 * Selectable anchor image floats after spawn completes.
 */
export default function AnchorPad({ x, y, n, d, state, selectable, onClick }) {
  const img  = ANCHOR_IMG[state] ?? ASSETS.anchorIdle;
  const glow = GLOW[state] ?? (selectable ? GLOW.selectable : null);

  return (
    <div
      onClick={selectable ? onClick : undefined}
      style={{
        position:      'absolute',
        left:          x - 65,
        top:           y - 36,
        width:         130,
        height:        130,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           0,              // no gap between plate and anchor img
        cursor:        selectable ? 'pointer' : 'default',
        userSelect:    'none',
        zIndex:        20,
        filter:        glow ? `drop-shadow(${glow})` : 'none',
        transition:    'filter 0.2s',
        willChange:    'transform, opacity',
        /* dynamic animation based on climbing state */
        animation: 
          state === 'exiting' 
            ? 'anchorExitDown 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards'
            : state === 'descending'
            ? 'anchorDescend 1.1s cubic-bezier(0.25, 1, 0.5, 1) forwards'
            : selectable
            ? 'anchorSpawn 1.1s cubic-bezier(0.25, 1, 0.5, 1) both, floatAnchor 2.2s ease-in-out infinite 1.1s'
            : 'anchorSpawn 1.1s cubic-bezier(0.25, 1, 0.5, 1) both',
      }}
    >
      {/* Fraction plate — sits directly above anchor with no gap */}
      <FractionPlate n={n} d={d} />

      {/* Anchor image — slightly overlaps plate bottom */}
      <img
        src={img}
        alt=""
        style={{
          width:      180,
          height:     180,
          objectFit:  'contain',
          marginTop:  -50,   // pulls anchor up to close gap against plate
          transition: 'transform 0.1s',
          transform:  selectable ? 'scale(1)' : 'scale(0.95)',
        }}
      />
    </div>
  );
}
