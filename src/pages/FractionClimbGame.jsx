import { useGameLogic }  from '../hooks/useGameLogic';
import GameHUD           from '../components/GameHUD';
import GameViewport      from '../components/GameViewport';

/**
 * FractionClimbGame — top-level page.
 * Bridges useGameLogic (state/actions) ↔ GameHUD + GameViewport (rendering).
 */
export default function FractionClimbGame() {
  const {
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
    progress,
    modeLabel,
    showRooftop,
    scrollKey,
    handleAnchorClick,
    resetGame,
  } = useGameLogic();

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
