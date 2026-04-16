import { useState, useEffect } from 'react';
import { useGameLogic }      from '../hooks/useGameLogic';
import { ASSETS }            from '../constants/assets';
import GameHUD               from '../components/GameHUD';
import GameViewport          from '../components/GameViewport';

/**
 * FractionClimbGame — top-level page.
 * Bridges useGameLogic (state/actions) ↔ GameHUD + GameViewport (rendering).
 */
export default function FractionClimbGame() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const {
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
    progress,
    modeLabel,
    showRooftop,
    scrollKey,
    handleAnchorClick,
    resetGame,
  } = useGameLogic();

  // ── Asset Preloading ──────────────────────────────────────────────────────
  useEffect(() => {
    const assetEntries = Object.values(ASSETS);
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      setLoadProgress(Math.floor((loadedCount / assetEntries.length) * 100));
      if (loadedCount >= assetEntries.length) {
        // Slight delay for smooth transition
        setTimeout(() => setIsLoaded(true), 500);
      }
    };

    assetEntries.forEach(src => {
      if (src.endsWith('.wav') || src.endsWith('.mp3')) {
        const audio = new Audio();
        audio.src = src;
        audio.oncanplaythrough = updateProgress;
        audio.onerror = updateProgress; // Don't block on error
      } else {
        const img = new Image();
        img.src = src;
        img.onload = updateProgress;
        img.onerror = updateProgress;
      }
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading...</div>
        <div className="loading-bar-container">
          <div 
            className="loading-bar-fill" 
            style={{ width: `${loadProgress}%` }} 
          />
        </div>
        <div style={{ marginTop: 12, fontSize: 10, opacity: 0.5, letterSpacing: 1 }}>
          PREPARING SPIDEY SENSES... {loadProgress}%
        </div>
      </div>
    );
  }

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
      <GameHUD progress={progress} modeLabel={modeLabel} />

      <GameViewport
        round={round}
        roundIndex={roundIndex}
        anchors={anchors}
        anchorStates={anchorStates}
        heroPos={heroPos}
        heroState={heroState}
        heroDirection={heroDirection}
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

      <p style={{ marginTop: 10, fontSize: 11, color: '#334455', letterSpacing: 1 }}>
        FRACTION CLIMBER · GRADE 4 MATH · UNLIKE FRACTIONS
      </p>
    </div>
  );
}
