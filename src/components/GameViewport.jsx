import { useState, useEffect, useRef } from 'react';
import { ASSETS, VP_W, VP_H } from '../constants/assets';
import AnchorPad     from './AnchorPad';
import Hero          from './Hero';
import WebLine       from './WebLine';
import FeedbackToast from './FeedbackToast';
import WinScreen     from './WinScreen';

// ─── Building strip (scroll triggered per climb) ───────────────────────────
// Container is 2 × VP_H, initially rendered at translateY(-50%) (via keyframe
// `from`). On each mount (caused by scrollKey change), the animation plays
// once: translateY(-50%) → translateY(0), creating a downward scroll feel.
// `forwards` fill-mode keeps end state so buildings don't snap back.
function ScrollingBuilding({ src, side }) {
  const sideStyle = side === 'left' ? { left: 0 } : { right: 0 };
  return (
    <div
      style={{
        position:       'absolute',
        ...sideStyle,
        top:            0,
        width:          180,
        height:         VP_H * 2,
        zIndex:         5,
        pointerEvents:  'none',
        animation:      'buildingClimbScroll 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        willChange:     'transform',
      }}
    >
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
export default function GameViewport({
  round,
  roundIndex,
  anchors,
  anchorStates,
  heroPos,
  heroState,
  heroDirection,
  flashStatus,
  weblineVisible,
  weblineEnd,
  feedback,
  inputLocked,
  won,
  showRooftop,
  scrollKey,      // increments on each correct climb → re-keys buildings
  onAnchorClick,
  onReplay,
}) {
  // Snapshot mechanism for "continuous" transitions
  const [exitingAnchors, setExitingAnchors] = useState([]);
  const prevRoundIndex = useRef(roundIndex);

  useEffect(() => {
    // When round advances, capture current lower anchors to show them exiting
    if (roundIndex > prevRoundIndex.current) {
      const oldLower = anchors.filter(a => a.role === 'lower');
      if (oldLower.length > 0) {
        setExitingAnchors(oldLower);
        // Clear them after animation finishes
        setTimeout(() => setExitingAnchors([]), 1100);
      }
    }
    prevRoundIndex.current = roundIndex;
  }, [roundIndex, anchors]);

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

      {/* ── Layer 2: Rooftop — visible only during intro round ──
           Centred at the viewport bottom so character appears to stand on it.
           zIndex 4 puts it above bg but below buildings and game elements.    */}
      {showRooftop && (
        <img
          src={ASSETS.rooftop}
          alt=""
          style={{
            position:      'absolute',
            bottom:        0,
            left:          '50%',
            transform:     'translateX(-50%)',
            width:         '84%',
            height:        'auto',
            zIndex:        4,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Layer 3: Left building — re-keyed per climb to replay scroll ── */}
      <ScrollingBuilding
        key={`left-${scrollKey}`}
        src={ASSETS.leftBuilding}
        side="left"
      />

      {/* ── Layer 3: Right building ── */}
      <ScrollingBuilding
        key={`right-${scrollKey}`}
        src={ASSETS.rightBuilding}
        side="right"
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

      {/* ── Transitioning Anchors (Exiting) ── */}
      {exitingAnchors.map(a => (
        <AnchorPad
          key={`exit-${a.id}-${roundIndex}`}
          x={a.x}
          y={a.y}
          n={a.n}
          d={a.d}
          state="exiting"
          selectable={false}
        />
      ))}

      {/* ── Current Round Anchors ── */}
      {anchors.map(a => {
        // Lower anchors arrive by "descending" from upper row (except first round)
        const transitionState = (roundIndex > 0 && a.role === 'lower') ? 'descending' : 'idle';
        
        return (
          <AnchorPad
            key={`${roundIndex}-${a.id}`}
            x={a.x}
            y={a.y}
            n={a.n}
            d={a.d}
            state={anchorStates[a.id] || transitionState}
            selectable={a.selectable && !inputLocked}
            onClick={() => onAnchorClick(a.id)}
          />
        );
      })}

      {/* ── Hero character ── */}
      <Hero 
        x={heroPos.x} 
        y={heroPos.y} 
        heroState={heroState} 
        heroDirection={heroDirection} 
      />

      {/* ── Feedback Flash Overlay ── */}
      {flashStatus && (
        <div
          style={{
            position:      'absolute',
            inset:         0,
            background:    flashStatus === 'correct' ? '#00ff9922' : '#ff330022',
            zIndex:        100,
            pointerEvents: 'none',
            animation:     'overlayFlash 1s ease-out forwards',
          }}
        />
      )}

      {/* ── Win screen ── */}
      {won && <WinScreen onReplay={onReplay} />}
    </div>
  );
}
