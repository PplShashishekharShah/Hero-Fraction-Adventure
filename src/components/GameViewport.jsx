import { ASSETS, VP_W, VP_H } from '../constants/assets';
import AnchorPad     from './AnchorPad';
import Hero          from './Hero';
import WebLine       from './WebLine';
import FeedbackToast from './FeedbackToast';
import WinScreen     from './WinScreen';

// ─── Scrolling building strip ─────────────────────────────────────────────────
// Two identical images stacked = 2 × VP_H tall.
// CSS buildingScroll animates translateY from -50% → 0, creating a seamless
// downward scroll (hero feels like it is climbing upward).
function ScrollingBuilding({ src, side }) {
  const sideStyle = side === 'left' ? { left: 0 } : { right: 0 };
  return (
    <div
      style={{
        position:      'absolute',
        ...sideStyle,
        top:           0,
        width:         170,
        height:        VP_H * 2,   // two-image stack
        zIndex:        5,
        pointerEvents: 'none',
        animation:     'buildingScroll 7s linear infinite',
        willChange:    'transform',
      }}
    >
      {/* Top image — enters viewport as animation approaches 100% */}
      <img
        src={src}
        alt=""
        style={{
          width:          '100%',
          height:         VP_H,
          objectFit:      'cover',
          objectPosition: side === 'left' ? 'right' : 'left',
          display:        'block',
        }}
      />
      {/* Bottom image — visible at animation start */}
      <img
        src={src}
        alt=""
        style={{
          width:          '100%',
          height:         VP_H,
          objectFit:      'cover',
          objectPosition: side === 'left' ? 'right' : 'left',
          display:        'block',
        }}
      />
    </div>
  );
}

// ─── GameViewport ─────────────────────────────────────────────────────────────
/**
 * Receives all visual state from useGameLogic via FractionClimbGame.
 * No game logic lives here — pure rendering.
 *
 * Extra prop: showRooftop — renders rooftop layer during intro round only.
 * roundIndex is used to key anchor pads so spawn animation re-fires each round.
 */
export default function GameViewport({
  round,
  roundIndex,
  anchors,
  anchorStates,
  heroPos,
  heroState,
  weblineVisible,
  weblineEnd,
  feedback,
  inputLocked,
  won,
  showRooftop,
  onAnchorClick,
  onReplay,
}) {
  return (
    <div
      style={{
        position:     'relative',
        width:        VP_W,
        maxWidth:     '100%',
        height:       VP_H,
        overflow:     'hidden',
        border:       '2px solid #1a4a6a',
        borderTop:    'none',
        borderRadius: '0 0 14px 14px',
        boxShadow:    '0 8px 40px #0008',
      }}
    >
      {/* ── Layer 1: Background city ── */}
      <img
        src={ASSETS.bg}
        alt=""
        style={{
          position:  'absolute',
          inset:     0,
          width:     '100%',
          height:    '100%',
          objectFit: 'cover',
          zIndex:    0,
        }}
      />

      {/* ── Layer 2: Rooftop start platform (intro round only) ── */}
      {showRooftop && (
        <img
          src={ASSETS.rooftop}
          alt=""
          style={{
            position:       'absolute',
            bottom:         0,
            left:           0,
            width:          '100%',
            height:         160,
            objectFit:      'cover',
            objectPosition: 'center top',
            zIndex:         3,
            pointerEvents:  'none',
          }}
        />
      )}

      {/* ── Layer 3: Scrolling left building ── */}
      <ScrollingBuilding src={ASSETS.leftBuilding}  side="left"  />

      {/* ── Layer 3: Scrolling right building ── */}
      <ScrollingBuilding src={ASSETS.rightBuilding} side="right" />

      {/* ── Centre-lane dim overlay ── */}
      <div
        style={{
          position:      'absolute',
          left:          160,
          right:         160,
          top:           0,
          bottom:        0,
          background:    'linear-gradient(180deg, rgba(0,12,30,0.3) 0%, rgba(0,12,30,0.05) 100%)',
          zIndex:        6,
          pointerEvents: 'none',
        }}
      />

      {/* ── Mode badge ── */}
      <div
        style={{
          position:      'absolute',
          top:           12,
          left:          '50%',
          transform:     'translateX(-50%)',
          background:    round.mode === 'intro' ? '#0d3d5a' : '#0d3a1a',
          border:        `1px solid ${round.mode === 'intro' ? '#1de9b644' : '#1de9b6'}`,
          borderRadius:  20,
          padding:       '3px 14px',
          fontSize:      11,
          fontWeight:    800,
          color:         round.mode === 'intro' ? '#7ee8ff' : '#1de9b6',
          zIndex:        40,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {round.mode === 'intro' ? 'INTRO MODE' : 'CLIMB MODE'}
      </div>

      {/* ── Feedback toast ── */}
      <FeedbackToast
        message={feedback.message}
        type={feedback.type}
        visible={feedback.visible}
      />

      {/* ── Web line ── */}
      <WebLine start={heroPos} end={weblineEnd} visible={weblineVisible} />

      {/* ── Anchor pads (keyed by roundIndex so spawn animation re-fires) ── */}
      {anchors.map(a => (
        <AnchorPad
          key={`${roundIndex}-${a.id}`}
          x={a.x}
          y={a.y}
          n={a.n}
          d={a.d}
          state={anchorStates[a.id] ?? 'idle'}
          selectable={a.selectable && !inputLocked}
          onClick={() => onAnchorClick(a.id)}
        />
      ))}

      {/* ── Hero character ── */}
      <Hero x={heroPos.x} y={heroPos.y} heroState={heroState} />

      {/* ── Win screen ── */}
      {won && <WinScreen onReplay={onReplay} />}
    </div>
  );
}
