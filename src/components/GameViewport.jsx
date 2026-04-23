import { useState, useEffect, useRef } from 'react';
import { ASSETS, VP_W, VP_H } from '../constants/assets';
import AnchorPad     from './AnchorPad';
import Hero          from './Hero';
import WebLine       from './WebLine';
import WinScreen     from './WinScreen';

// ─── Building strip (scroll triggered per climb) ───────────────────────────
// Container is 2 × VP_H, initially rendered at translateY(-50%) (via keyframe
// `from`). On each mount (caused by scrollKey change), the animation plays
// once: translateY(-50%) → translateY(0), creating a downward scroll feel.
// `forwards` fill-mode keeps end state so buildings don't snap back.
function ScrollingBuilding({ src, side, isFinal }) {
  const sideStyle = side === 'left' ? { left: -90 } : { right: -90 };
  return (
    <div
      style={{
        position:       'absolute',
        ...sideStyle,
        top:            0,
        width:          260,
        height:         VP_H * 2,
        zIndex:         5,
        pointerEvents:  'none',
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'repeat-y',
        backgroundSize: '100% 560px',
        backgroundColor: 'transparent',
        animation:      isFinal ? 'none' : 'buildingClimbScroll 2.2s cubic-bezier(0.42, 0, 0.58, 1) forwards',
        willChange:     'transform',
      }}
    />
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
  heroScale,
  onAnchorClick,
  onReplay,
}) {
  // Snapshot mechanism for "continuous" transitions
  const [exitingAnchors, setExitingAnchors] = useState([]);
  const prevRoundIndex = useRef(roundIndex);
  const lastAnchors    = useRef(anchors);

  useEffect(() => {
    // When round advances, capture the PREVIOUS anchors to show them exiting
    if (roundIndex > prevRoundIndex.current) {
      const oldLower = lastAnchors.current.filter(a => a.role === 'lower');
      if (oldLower.length > 0) {
        setExitingAnchors(oldLower);
        setTimeout(() => setExitingAnchors([]), 2200);
      }
    }
    prevRoundIndex.current = roundIndex;
    lastAnchors.current    = anchors;
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
        isFinal={roundIndex === 5}
      />

      {/* ── Layer 3: Right building ── */}
      <ScrollingBuilding
        key={`right-${scrollKey}`}
        src={ASSETS.rightBuilding}
        side="right"
        isFinal={roundIndex === 5}
      />

      {/* ── Layer 3.5: Final Terraces (Last Round Only) ── */}
      {roundIndex === 5 && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
          <img
            src={ASSETS.leftTerrace}
            alt=""
            style={{
              position: 'absolute',
              top: 85,
              left: -130,
              width: 300,
              height: 'auto',
              animation: 'terraceSpawn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          />
          <img
            src={ASSETS.rightTerrace}
            alt=""
            style={{
              position: 'absolute',
              top: 85,
              right: -130,
              width: 300,
              height: 'auto',
              animation: 'terraceSpawn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          />
          
          {/* Overlay to clip buildings above rooftop via Sky images */}
          <img 
            src={ASSETS.leftSky} 
            alt="" 
            style={{ position: 'absolute', top: -9, left: 0, width: 155, height: 110, zIndex: 4,  objectFit: 'cover' }} 
          />
          <img 
            src={ASSETS.rightSky} 
            alt="" 
            style={{ position: 'absolute', top:-9, right: 0, width: 155, height: 110, zIndex: 4, objectFit: 'cover' }} 
          />
        </div>
      )}

      {/* ── Tutorial Spotlight Overlay ── */}
      {feedback.visible && feedback.type === 'tutorial' && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: -2000,
              zIndex: 80,
              background: 'radial-gradient(circle 200px at var(--spot-x, 50%) var(--spot-y, 50%), transparent 0%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
              transition: 'opacity 0.6s ease',
            }}
            ref={(el) => {
              if (el) {
                const correctAnchor = anchors.find(a => 
                  roundIndex === 0 ? (a.id === 'left') : false 
                );
                if (correctAnchor) {
                  el.style.setProperty('--spot-x', `${correctAnchor.x}px`);
                  el.style.setProperty('--spot-y', `${correctAnchor.y}px`);
                }
              }
            }}
          />
          
          {/* Moving Hand Tutorial Animation (☝️ with tilt) */}
          <div
            style={{
              position: 'absolute',
              zIndex: 100,
              fontSize: '80px',
              pointerEvents: 'none',
              animation: 'handGuide 3s ease-in-out forwards',
            }}
            ref={(el) => {
              if (el) {
                const correctAnchor = anchors.find(a => roundIndex === 0 ? a.id === 'left' : false);
                if (correctAnchor) {
                  el.style.left = `${correctAnchor.x - 30}px`;
                  el.style.top = `${correctAnchor.y + 70}px`;
                  
                  const heroHeadX = heroPos.x;
                  const heroHeadY = heroPos.y - 80;
                  const dx = heroHeadX - (correctAnchor.x - 30 + 40); 
                  const dy = heroHeadY - (correctAnchor.y + 70 + 40);
                  el.style.setProperty('--start-transform', `translate(${dx}px, ${dy}px)`);
                }
              }
            }}
          >
            ☝️
          </div>
        </>
      )}

      {/* ── Feedback message ── */}
      {feedback.visible && (
        <div
          style={{
            position:      'absolute',
            top:           20,
            left:          '50%',
            transform:     'translateX(-50%)',
            background:    feedback.type === 'tutorial' 
              ? 'rgba(0, 80, 120, 0.9)' 
              : feedback.type === 'correct' 
              ? 'rgba(0, 40, 30, 0.9)' 
              : 'rgba(40, 10, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border:        `2px solid ${feedback.type === 'tutorial' ? '#4cf4ff' : (feedback.type === 'correct' ? '#1de9b6' : '#ff4444')}`,
            borderRadius:  16,
            padding:       '12px 32px',
            fontSize:      18,
            fontWeight:    900,
            color:         feedback.type === 'tutorial' ? '#4cf4ff' : (feedback.type === 'correct' ? '#1de9b6' : '#ff8888'),
            zIndex:        100,
            boxShadow:     `0 0 30px ${feedback.type === 'tutorial' ? 'rgba(76, 244, 255, 0.3)' : (feedback.type === 'correct' ? 'rgba(29, 233, 182, 0.3)' : 'rgba(255, 68, 68, 0.3)')}`,
            animation:     'feedbackSlide 0.5s ease-out forwards',
            whiteSpace:    'nowrap',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ marginRight: 8 }}>
            {feedback.type === 'tutorial' ? '💡' : (feedback.type === 'correct' ? '🕸️' : '⚠️')}
          </span>
          {feedback.message}
        </div>
      )}

      {/* ── Web line ── */}
      <WebLine start={heroPos} end={weblineEnd} visible={weblineVisible} />

      {/* ── Transitioning Anchors (Exiting) ── */}
      {exitingAnchors.map(a => (
        <AnchorPad
          key={`exit-${roundIndex}-${a.id}`}
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
        scale={heroScale}
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

      {/* ── Win screen — Hidden per user request for smoother climax ── */}
      {/* {won && <WinScreen onReplay={onReplay} />} */}
    </div>
  );
}
