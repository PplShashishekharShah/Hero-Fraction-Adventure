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
          FRACTION CLIMBER <span style={{ color: '#1de9b6', margin: '0 8px' }}>•</span> GRADE 4 MATH <span style={{ color: '#1de9b6', margin: '0 8px' }}>•</span> UNLIKE FRACTIONS
        </p>
      </footer>
    </div>
  );
}
