import { ASSETS, VP_W, VP_H } from '../constants/assets';
import { DESCENT_LAYOUT, GAME_CONFIG } from '../constants/gameConfig';
import { TOTAL_DESCENT_DROPS } from '../data/descentRounds';
import { useDescentLogic }     from '../hooks/useDescentLogic';
import FloorRow          from './FloorRow';
import HeroRunner        from './HeroRunner';
import FeedbackToast     from './FeedbackToast';
import DescentWinScreen  from './DescentWinScreen';

/**
 * DescentModeGame — complete descent mode scene.
 *
 * Rendering architecture (synchronized floor scroll)
 * ──────────────────────────────────────────────────
 * Every floor div has:
 *   top:        screenY  (= floor.worldY - worldOffset — recomputed on each render)
 *   transition: top 700ms cubic-bezier(...)
 *   opacity:    0 if fully off-screen, else 1
 *   transition: opacity 700ms ease
 *
 * When `worldOffset` increments in one React render, React re-renders ALL floor
 * divs with their new `top` values simultaneously.  The browser fires all `top`
 * CSS transitions in the same frame → perfect synchronized scroll. ✓
 *
 * The background `backgroundPositionY` also changes in the same render with the
 * same transition duration → parallax in sync. ✓
 *
 * Props:
 *   onClimbAgain — callback: user wants to restart from climb mode
 */
export default function DescentModeGame({ onClimbAgain }) {
  const {
    worldOffset,
    floors,
    activeFloorId,
    dropCount,
    descentComplete,
    showResults,
    heroWorldX,
    heroWorldY,
    heroPhase,
    heroFaceDir,
    inputLocked,
    feedback,
    flashStatus,
    descentProgress,
    modeLabel,
    handleTileClick,
    resetDescent,
  } = useDescentLogic();

  // Hero screen-space Y (recomputed every render; used by HeroRunner)
  const heroScreenY = heroWorldY - worldOffset;

  // Scroll duration for consistent timing reference in this component
  const SCROLL_MS = GAME_CONFIG.scrollDurationMs;
  const SCROLL_EASE = `cubic-bezier(0.42, 0, 0.58, 1)`;

  return (
    <div
      style={{
        minHeight:      '100vh',
        background:     '#000c1a',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '16px 8px',
      }}
    >
      {/* ── HUD ── */}
      <DescentHUD
        dropCount={dropCount}
        total={TOTAL_DESCENT_DROPS}
        modeLabel={modeLabel}
      />

      {/* ── Main viewport ── */}
      <div
        style={{
          position:     'relative',
          width:        VP_W,
          maxWidth:     '100%',
          height:       VP_H,
          overflow:     'hidden',
          border:       '2px solid #2a1a4a',
          borderTop:    'none',
          borderRadius: '0 0 14px 14px',
          boxShadow:    '0 8px 40px #0008',
        }}
      >
        {/* ── Layer 0: Interior building background (full 1:1 sync scroll) ────
             The background tiles vertically at 2×floorStep height so one full
             tile = exactly 2 floors → the doors repeat in perfect alignment.
             backgroundPositionY = -worldOffset means: as worldOffset increases
             (floors slide UP on screen, camera descends) the background also
             shifts UP at the same rate → floors always appear just below a door.
             No parallax factor — 1:1 gives the "linearity" the user requested. */}
        <div
          style={{
            position:            'absolute',
            inset:               0,
            backgroundImage:     `url(${ASSETS.interiorBg})`,
            backgroundRepeat:    'repeat-y',
            backgroundSize:      `${VP_W}px ${VP_H}px`,  // 1 tile = VP_H = 2 floors
            backgroundPositionY: `${-worldOffset}px`,    // 1:1 upward scroll
            transition:          `background-position-y ${SCROLL_MS}ms ${SCROLL_EASE}`,
            zIndex:              0,
          }}
        />

        {/* ── Mode badge ── */}
        <div
          style={{
            position:      'absolute',
            top:           12,
            left:          '50%',
            transform:     'translateX(-50%)',
            background:    'linear-gradient(135deg, #3d0d3a, #1a0030)',
            border:        '1px solid #e040fb88',
            borderRadius:  20,
            padding:       '3px 16px',
            fontSize:      11,
            fontWeight:    800,
            color:         '#f48fb1',
            zIndex:        40,
            letterSpacing: 1,
            textTransform: 'uppercase',
            boxShadow:     '0 0 12px #e040fb44',
          }}
        >
          ⬇️ DESCENT MODE
        </div>

        {/* ── Floor layers ─────────────────────────────────────────────────
             Each floor div is independently positioned using:
               top = floor.worldY - worldOffset
             All divs share the same `transition: top Xms` duration.
             When worldOffset changes in one render, every floor animates
             upward simultaneously → synchronized scroll illusion.          */}
        {floors.map(floor => {
          const screenY    = floor.worldY - worldOffset;
          // Fade out floors leaving top; fade in floors entering from bottom
          const isExiting  = screenY < -DESCENT_LAYOUT.railingHeight - 20;
          const isEntering = screenY > VP_H + 10;
          const opacity    = (isExiting || isEntering) ? 0 : 1;
          const isActive   = floor.id === activeFloorId && !inputLocked;

          return (
            <div
              key={floor.id}
              style={{
                position:      'absolute',
                top:           screenY,
                left:          0,
                right:         0,
                opacity,
                transition:    `top ${SCROLL_MS}ms ${SCROLL_EASE}, opacity ${SCROLL_MS}ms ease`,
                zIndex:        3,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <FloorRow
                floor={floor}
                isActive={isActive}
                onTileClick={handleTileClick}
              />
            </div>
          );
        })}

        {/* ── Hero ─────────────────────────────────────────────────────────
             screenX = heroWorldX (no horizontal world offset)
             screenY = heroWorldY - worldOffset (recomputed each render)
             HeroRunner manages its own CSS transitions per phase.           */}
        <HeroRunner
          screenX={heroWorldX}
          screenY={heroScreenY}
          heroPhase={heroPhase}
          faceDir={heroFaceDir}
        />

        {/* ── Feedback toast ── */}
        <FeedbackToast
          message={feedback.message}
          type="wrong"
          visible={feedback.visible}
        />

        {/* ── Correct / wrong flash overlay ── */}
        {flashStatus && (
          <div
            style={{
              position:      'absolute',
              inset:         0,
              background:    flashStatus === 'correct'
                ? 'rgba(29, 233, 182, 0.13)'
                : 'rgba(255, 51, 0, 0.13)',
              zIndex:        100,
              pointerEvents: 'none',
              animation:     'overlayFlash 0.9s ease-out forwards',
            }}
          />
        )}

        {/* ── Final Blackout Overlay (covers everything) ── */}
        {descentComplete && (
           <div 
             style={{ 
               position:      'fixed', 
               inset:         0, 
               background:    '#000', 
               zIndex:        2000, 
               animation:     'fadeIn 0.6s ease-in forwards',
               pointerEvents: 'all',
             }} 
           />
        )}

        {/* ── Descent complete overlay (Win Screen) ── */}
        {/* We keep it at z-index 2001 so it pops up ABOVE the pure black overlay */}
        {showResults && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DescentWinScreen
              onPlayAgainDescent={resetDescent}
              onClimbAgain={onClimbAgain}
            />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          marginTop:      24,
          padding:        '12px 24px',
          background:     'rgba(0, 20, 40, 0.4)',
          backdropFilter: 'blur(8px)',
          borderRadius:   30,
          border:         '1px solid rgba(42, 26, 74, 0.5)',
          boxShadow:      '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        <p
          style={{
            fontSize:      13,
            color:         '#5a4a8a',
            letterSpacing: 2,
            fontWeight:    800,
            textTransform: 'uppercase',
            margin:        0,
            textAlign:     'center',
          }}
        >
          FRACTION DESCENDER
          <span style={{ color: '#e040fb', margin: '0 8px' }}>•</span>
          GRADE 4 MATH
          <span style={{ color: '#e040fb', margin: '0 8px' }}>•</span>
          UNLIKE FRACTIONS
        </p>
      </footer>
    </div>
  );
}


// ─── Inline HUD for descent mode ──────────────────────────────────────────────
function DescentHUD({ dropCount, total, modeLabel }) {
  const pct = Math.round((dropCount / total) * 100);

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          width:        VP_W,
          maxWidth:     '100%',
          background:   '#0d0120',
          border:       '1px solid #2a1a4a',
          borderBottom: 'none',
          borderRadius: '14px 14px 0 0',
          padding:      '10px 18px',
          display:      'flex',
          alignItems:   'center',
          gap:          16,
        }}
      >
        {/* Grade tag */}
        <div
          style={{
            background:   '#1a0a30',
            border:       '1px solid #4a2a6a',
            borderRadius: 10,
            padding:      '6px 16px',
            fontSize:     14,
            color:        '#d0b0ff',
            fontWeight:   900,
            cursor:       'default',
            whiteSpace:   'nowrap',
            boxShadow:    '0 0 10px rgba(180, 130, 255, 0.2)',
          }}
        >
          ← GRADE 4
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#d0b0ff', fontWeight: 900, whiteSpace: 'nowrap' }}>
            DROP {dropCount}/{total}
          </span>
          <div
            style={{
              flex:         1,
              height:       24,
              background:   'rgba(0,0,0,0.4)',
              borderRadius: 12,
              border:       '2px solid #2a1a4a',
              overflow:     'hidden',
              boxShadow:    'inset 0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                height:         '100%',
                width:          `${pct}%`,
                background:     'linear-gradient(90deg, #e040fb, #aa00ff, #e040fb)',
                backgroundSize: '200% 100%',
                borderRadius:   12,
                transition:     'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow:      '0 0 14px rgba(224, 64, 251, 0.6)',
              }}
            />
          </div>
          <span style={{ fontSize: 15, color: '#e040fb', fontWeight: 900, width: 45 }}>
            {pct}%
          </span>
        </div>

        {/* Mode label */}
        <div
          style={{
            background:    'rgba(26, 0, 48, 0.8)',
            border:        '1px solid #e040fb',
            borderRadius:  10,
            padding:       '6px 14px',
            fontSize:      13,
            color:         '#e040fb',
            fontWeight:    800,
            whiteSpace:    'nowrap',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {modeLabel}
        </div>
      </div>

      {/* Instruction strip */}
      <div
        style={{
          width:       VP_W,
          maxWidth:    '100%',
          background:  '#0a0118',
          borderLeft:  '1px solid #2a1a4a',
          borderRight: '1px solid #2a1a4a',
          padding:     '10px 18px',
          textAlign:   'center',
          boxShadow:   'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: 16, color: '#e0d4ff', fontWeight: 700, letterSpacing: 0.5 }}>
          🏗️ Tap the{' '}
          <strong style={{ color: '#ffe740', fontSize: 18, textShadow: '0 0 8px #ffe74088' }}>
            SMALLER
          </strong>
          {' '}fraction to break the floor and drop down!
        </span>
      </div>
    </>
  );
}
