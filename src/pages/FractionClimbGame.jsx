import { useState, useEffect }  from 'react';
import { useGameLogic }         from '../hooks/useGameLogic';
import { ASSETS, VP_W }         from '../constants/assets';
import { TOTAL_CLIMBS }         from '../data/rounds';
import GameHUD                  from '../components/GameHUD';
import GameViewport             from '../components/GameViewport';
import ModeTransitionOverlay    from '../components/ModeTransitionOverlay';
import DescentModeGame          from '../components/DescentModeGame';

/**
 * FractionClimbGame — top-level page / game orchestrator.
 *
 * Game phase state machine:
 *   'loading'      → asset preload
 *   'climb'        → Mode 1: climb mode (existing, unchanged)
 *   'transitioning'→ black overlay plays; descent mode mounts underneath
 *   'descent'      → Mode 2: descent mode
 *
 * The ModeTransitionOverlay is `position:fixed` so it covers everything
 * regardless of which mode content is mounted.
 */
export default function FractionClimbGame() {
  // ── Asset loading ──────────────────────────────────────────────────────────
  const [isLoaded,     setIsLoaded]     = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // ── Top-level game phase ───────────────────────────────────────────────────
  const [gamePhase, setGamePhase] = useState('climb');
  // 'climb' | 'transitioning' | 'descent'

  // ── Climb mode logic (always mounted so state survives transition) ─────────
  const climbLogic = useGameLogic();

  const {
    round, roundIndex, anchors, anchorStates,
    heroPos, heroState, heroDirection, heroScale,
    flashStatus, weblineVisible, weblineEnd,
    feedback, inputLocked, won, progress,
    modeLabel, showRooftop, scrollKey,
    handleAnchorClick, resetGame,
  } = climbLogic;

  // ── Watch for climb-mode win → start transition ────────────────────────────
  useEffect(() => {
    if (won && gamePhase === 'climb' && heroPos.x > VP_W + 180) {
      setGamePhase('transitioning');
    }
  }, [won, gamePhase, heroPos.x]);

  // Called by ModeTransitionOverlay at the midpoint of the black hold phase.
  // Parent switches to 'descent' here — the overlay then fades out revealing it.
  const handleTransitionComplete = () => setGamePhase('descent');

  // Called from DescentWinScreen "Climb Again" button
  const handleClimbAgain = () => {
    resetGame();
    setGamePhase('climb');
  };

  // ── Asset preloading ───────────────────────────────────────────────────────
  useEffect(() => {
    const assetEntries = Object.values(ASSETS);
    let loadedCount = 0;

    const tick = () => {
      loadedCount++;
      setLoadProgress(Math.floor((loadedCount / assetEntries.length) * 100));
      if (loadedCount >= assetEntries.length) {
        setTimeout(() => setIsLoaded(true), 500);
      }
    };

    assetEntries.forEach(src => {
      if (src.endsWith('.wav') || src.endsWith('.mp3')) {
        const a = new Audio();
        a.src = src;
        a.oncanplaythrough = tick;
        a.onerror = tick;
      } else {
        const img = new Image();
        img.src = src;
        img.onload  = tick;
        img.onerror = tick;
      }
    });
  }, []);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading...</div>
        <div className="loading-bar-container">
          <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }} />
        </div>
        <div style={{ marginTop: 12, fontSize: 10, opacity: 0.5, letterSpacing: 1 }}>
          PREPARING SPIDEY SENSES... {loadProgress}%
        </div>
      </div>
    );
  }

  // ── Rendered game ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Mode transition overlay (fixed, on top of everything) ─────────── */}
      <ModeTransitionOverlay
        active={gamePhase === 'transitioning'}
        onTransitionComplete={handleTransitionComplete}
      />

      {/* ── DESCENT MODE ───────────────────────────────────────────────────── */}
      {gamePhase === 'descent' && (
        <DescentModeGame onClimbAgain={handleClimbAgain} />
      )}

      {/* ── CLIMB MODE (visible when phase is 'climb' or 'transitioning') ─── */}
      {gamePhase !== 'descent' && (
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
          <GameHUD
            progress={progress}
            total={TOTAL_CLIMBS}
            modeLabel={modeLabel}
            gameMode="climb"
          />

          <GameViewport
            round={round}
            roundIndex={roundIndex}
            anchors={anchors}
            anchorStates={anchorStates}
            heroPos={heroPos}
            heroState={heroState}
            heroDirection={heroDirection}
            heroScale={heroScale}
            flashStatus={flashStatus}
            weblineVisible={weblineVisible}
            weblineEnd={weblineEnd}
            feedback={feedback}
            inputLocked={inputLocked}
            won={won}
            showRooftop={showRooftop}
            scrollKey={scrollKey}
            onAnchorClick={handleAnchorClick}
            onReplay={resetGame}
          />

          <footer
            style={{
              marginTop:      24,
              padding:        '12px 24px',
              background:     'rgba(0, 20, 40, 0.4)',
              backdropFilter: 'blur(8px)',
              borderRadius:   30,
              border:         '1px solid rgba(26, 74, 106, 0.3)',
              boxShadow:      '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <p
              style={{
                fontSize:      13,
                color:         '#4a6a8a',
                letterSpacing: 2,
                fontWeight:    800,
                textTransform: 'uppercase',
                margin:        0,
                textAlign:     'center',
                textShadow:    '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              FRACTION CLIMBER
              <span style={{ color: '#1de9b6', margin: '0 8px' }}>•</span>
              GRADE 4 MATH
              <span style={{ color: '#1de9b6', margin: '0 8px' }}>•</span>
              UNLIKE FRACTIONS
            </p>
          </footer>
        </div>
      )}
    </>
  );
}
