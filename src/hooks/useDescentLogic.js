import { useState, useEffect, useRef, useCallback } from 'react';
import { DESCENT_ROUNDS, TOTAL_DESCENT_DROPS } from '../data/descentRounds';
import { ASSETS, VP_W } from '../constants/assets';
import { GAME_CONFIG, DESCENT_LAYOUT } from '../constants/gameConfig';

const {
  upperRailingY,
  floorStep,
  heroFeetFromRailingY,
  leftTileX,
  rightTileX,
  patrolLeftX,
  patrolRightX,
} = DESCENT_LAYOUT;

// ── Floor factory ──────────────────────────────────────────────────────────────
// Creates a floor state object from a DESCENT_ROUNDS index.
// worldY = the "world" Y of the railing top (absolute; never changes once created).
function makeFloor(roundIndex) {
  const round = DESCENT_ROUNDS[roundIndex];
  if (!round) return null;
  return {
    ...round,
    worldY:     upperRailingY + roundIndex * floorStep,
    leftState:  'idle',
    rightState: 'idle',
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────────
/**
 * useDescentLogic — all state and action handlers for descent mode.
 *
 * World / scroll system
 * ─────────────────────
 * Each floor has a fixed `worldY` (never mutates).
 * screenY = floor.worldY - worldOffset
 *
 * When `worldOffset` increases by `floorStep` (on a successful drop):
 *   • Every floor's CSS `top` changes simultaneously → all animate in sync.
 *   • The upper floor exits (screenY < 0, opacity → 0).
 *   • The lower floor slides to the upper position (screenY: lowerRailingY → upperRailingY).
 *   • The pre-spawned hidden floor slides into the lower position.
 *
 * Hero position
 * ─────────────
 * heroWorldY  — hero feet Y in world coordinates.
 * heroScreenY — heroWorldY - worldOffset  (computed by consumer).
 *
 *   Fall:   heroWorldY += floorStep  (CSS transition on `top` → visually falls down)
 *   Scroll: worldOffset += floorStep (all tops animate up, including hero's screenY)
 *           Net hero screen Y restores to upper floor position. ✓
 */
export function useDescentLogic() {
  // ── World scroll ─────────────────────────────────────────────────────────
  const [worldOffset, setWorldOffset] = useState(0);

  // floors: ordered array of floor state objects in world space.
  // Start with 3 floors: [0]=upper visible, [1]=lower visible, [2]=just below viewport.
  const [floors, setFloors] = useState(() =>
    [makeFloor(0), makeFloor(1), makeFloor(2)].filter(Boolean)
  );

  // ── Progress ─────────────────────────────────────────────────────────────
  // dropCount = number of successful drops = DESCENT_ROUNDS index of active floor.
  const [dropCount,       setDropCount]       = useState(0);
  const [descentComplete, setDescentComplete] = useState(false); // Triggers blackout
  const [showResults,     setShowResults]     = useState(false); // Triggers WinScreen

  // ── Hero state ───────────────────────────────────────────────────────────
  const [heroWorldY,  setHeroWorldY]  = useState(upperRailingY + heroFeetFromRailingY);
  const [heroWorldX,  setHeroWorldX]  = useState(patrolLeftX + 60);
  const [heroPhase,   setHeroPhase]   = useState('walking'); // 'walking'|'paused'|'falling'|'landing'
  const [heroFaceDir, setHeroFaceDir] = useState('right');
  const [walkDuration, setWalkDuration] = useState(450); // ms
  const heroDirRef = useRef(1); // 1 = right, -1 = left (mutable ref avoids rAF restarts)

  // ── UI ───────────────────────────────────────────────────────────────────
  const [inputLocked, setInputLocked] = useState(false);
  const [feedback,    setFeedback]    = useState({ message: '', visible: false });
  const [flashStatus, setFlashStatus] = useState(null); // 'correct'|'incorrect'|null

  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  // ── Timeout registry (clean up all on unmount) ───────────────────────────
  const timeouts = useRef([]);
  const delay = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
    return t;
  }, []);
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  // ── Hero patrol loop ─────────────────────────────────────────────────────
  // Runs only when heroPhase === 'walking' AND input is not locked.
  // Uses a mutable heroDirRef so direction flips don't restart the effect.
  useEffect(() => {
    if (heroPhase !== 'walking' || inputLocked) return;

    let lastTime = null;
    let rafId;

    const loop = (now) => {
      if (lastTime !== null) {
        const dt = (now - lastTime) / 1000; // seconds
        setHeroWorldX(x => {
          let nx = x + heroDirRef.current * GAME_CONFIG.patrolSpeedPxPerSecond * dt;
          if (nx >= patrolRightX) {
            heroDirRef.current = -1;
            setHeroFaceDir('left');
            nx = patrolRightX;
          } else if (nx <= patrolLeftX) {
            heroDirRef.current = 1;
            setHeroFaceDir('right');
            nx = patrolLeftX;
          }
          return nx;
        });
      }
      lastTime = now;
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [heroPhase, inputLocked]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  /** Update left or right tile state on a specific floor. */
  const updateTile = useCallback((floorId, side, newState) => {
    setFloors(prev =>
      prev.map(f =>
        f.id !== floorId ? f : {
          ...f,
          leftState:  side === 'left'  ? newState : f.leftState,
          rightState: side === 'right' ? newState : f.rightState,
        }
      )
    );
  }, []);

  /** Play SFX and set the flash overlay. */
  const triggerFeedback = useCallback((type) => {
    const sfx = new Audio(type === 'correct' ? ASSETS.sfxCorrect : ASSETS.sfxIncorrect);
    sfx.volume = 0.5;
    sfx.play().catch(() => {});
    if ('vibrate' in navigator) navigator.vibrate(type === 'correct' ? 80 : [80, 40, 160]);
    setFlashStatus(type);
    delay(() => setFlashStatus(null), 900);
  }, [delay]);

  // ── Voice Synthesis ───────────────────────────────────────────────────────
  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) {
       if (onEnd) onEnd();
       return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0; 
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }, []);

  /** Append a new floor to the floors array (idempotent — skips if already there). */
  const spawnFloor = useCallback((roundIndex) => {
    // If roundIndex is TOTAL_DESCENT_DROPS, it's the blank final landing floor
    const isBlank = roundIndex >= TOTAL_DESCENT_DROPS;
    
    let newFloor;
    if (isBlank) {
       newFloor = {
         id: `final-floor-${roundIndex}`,
         worldY: upperRailingY + roundIndex * floorStep,
         isBlank: true,
         leftState: 'idle',
         rightState: 'idle',
       };
    } else {
       newFloor = makeFloor(roundIndex);
     }

    if (!newFloor) return;
    setFloors(prev =>
      prev.some(f => f.id === newFloor.id) ? prev : [...prev, newFloor]
    );
  }, []);

  // ── Active floor id ───────────────────────────────────────────────────────
  // dropCount tracks which DESCENT_ROUNDS index is the current active floor.
  // The active floor's id = DESCENT_ROUNDS[dropCount].id
  const activeFloorId = DESCENT_ROUNDS[dropCount]?.id ?? null;

  // ── Tile click handler ────────────────────────────────────────────────────
  const handleTileClick = useCallback((side, floorId) => {
    if (inputLocked || descentComplete) return;
    if (floorId !== activeFloorId)      return;

    const activeFloor = floors.find(f => f.id === floorId);
    if (!activeFloor) return;

    const isCorrect = side === activeFloor.correctSide;
    const nextDrop  = dropCount + 1;
    const tileX     = (side === 'left' ? leftTileX : rightTileX) + 35;

    // 1. Lock input and start walking to the tile
    // Calculate walking time based on patrol speed (110 px/s)
    const distanceToTile = Math.abs(heroWorldX - tileX);
    const calculatedDuration = Math.max(200, (distanceToTile / GAME_CONFIG.patrolSpeedPxPerSecond) * 1000);
    
    setInputLocked(true);
    const targetDir = heroWorldX > tileX ? 'left' : 'right';
    setHeroFaceDir(targetDir);
    heroDirRef.current = targetDir === 'right' ? 1 : -1; // Sync patrol direction
    setWalkDuration(calculatedDuration);
    setHeroPhase('moving_to_tile');
    setHeroWorldX(tileX);
    
    // Highlight the chosen tile immediately
    updateTile(floorId, side, 'selected');

    // 2. After walking transition, start drilling
    delay(() => {
      setHeroPhase('drilling');
      
      // Play drilling audio
      const sfx = new Audio(ASSETS.drillSfx);
      sfx.volume = 0.4;
      sfx.play().catch(() => {});

      // 3. After drilling duration, apply result
      delay(() => {
        if (isCorrect) {
          // ── CORRECT SEQUENCE ─────────────────────────────────────────────
          triggerFeedback('correct');
          
          updateTile(floorId, side, 'correct');
          setIncorrectAttempts(0);

          // Crack the floor
          delay(() => updateTile(floorId, side, 'crack'), GAME_CONFIG.correctStateMs);

          // Break the floor and fall
          delay(() => {
            updateTile(floorId, side, 'broken');
            spawnFloor(nextDrop + 2);
            
            setHeroPhase('falling');
            const nextHeroWorldY = upperRailingY + nextDrop * floorStep + heroFeetFromRailingY;
            setHeroWorldY(nextHeroWorldY);

            // Land
            delay(() => {
              setHeroPhase('landing');

              // Scroll or End
              delay(() => {
                const isLastDrop = nextDrop >= TOTAL_DESCENT_DROPS;
                if (isLastDrop) {
                  // End sequence
                  setDropCount(nextDrop);
                  setHeroPhase('exiting');
                  
                  const winSfx = new Audio(ASSETS.sfxWin);
                  winSfx.volume = 0.6;
                  winSfx.play().catch(() => {});

                  setHeroFaceDir('right');
                  setHeroWorldX(VP_W + 200);
                  delay(() => setHeroPhase('vanished'), 1200);
                  delay(() => setDescentComplete(true), 2200);
                  delay(() => { setShowResults(true); setInputLocked(false); }, 3000);
                } else {
                  // World scroll
                  setWorldOffset(prev => prev + floorStep);
                  setDropCount(nextDrop);
                  delay(() => {
                    setHeroPhase('walking');
                    heroDirRef.current = 1;
                    setHeroFaceDir('right');
                    setInputLocked(false);
                  }, GAME_CONFIG.scrollDurationMs + 120);
                }
              }, GAME_CONFIG.landingPauseMs);
            }, GAME_CONFIG.fallDurationMs);

          }, GAME_CONFIG.correctStateMs + GAME_CONFIG.crackStateMs);

        } else {
          // ── WRONG SEQUENCE ───────────────────────────────────────────────
          triggerFeedback('incorrect');
          updateTile(floorId, side, 'wrong');
          
          const newAttempts = incorrectAttempts + 1;
          setIncorrectAttempts(newAttempts);

          const msg = `Oops! Pick the smaller fraction!`;
          setFeedback({ message: msg, type: 'incorrect', visible: true });
          speak(msg, () => {
            delay(() => setFeedback(f => ({ ...f, visible: false })), 600);
          });

          if (newAttempts >= 2) {
            const activeFloor = floors.find(f => f.id === floorId);
            const correctSide = activeFloor.correctSide;
            updateTile(floorId, correctSide, 'highlight');
          }


          // Resume after a delay
          delay(() => {
            updateTile(floorId, side, 'idle');
            setHeroPhase('walking');
            setInputLocked(false);
          }, GAME_CONFIG.wrongStateMs);
        }
      }, GAME_CONFIG.drillDurationMs);

    }, calculatedDuration);

  }, [
    inputLocked, descentComplete, activeFloorId, floors, dropCount, heroWorldX,
    updateTile, triggerFeedback, spawnFloor, delay, incorrectAttempts
  ]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetDescent = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setWorldOffset(0);
    setFloors([makeFloor(0), makeFloor(1), makeFloor(2)].filter(Boolean));
    setDropCount(0);
    setDescentComplete(false);
    setHeroWorldY(upperRailingY + heroFeetFromRailingY);
    setHeroWorldX(patrolLeftX + 60);
    setHeroPhase('walking');
    setHeroFaceDir('right');
    heroDirRef.current = 1;
    setInputLocked(false);
    setDescentComplete(false);
    setShowResults(false);
    setFeedback({ message: '', visible: false });
    setFlashStatus(null);
  }, []);

  // ── Derived values for HUD ────────────────────────────────────────────────
  const descentProgress = dropCount;
  const modeLabel = descentComplete
    ? 'LEVEL 2 COMPLETE! 🏅'
    : `Descent: Floor ${dropCount + 1} of ${TOTAL_DESCENT_DROPS}`;

  return {
    // World
    worldOffset,
    floors,
    activeFloorId,
    // Progress
    dropCount,
    descentComplete,
    showResults,
    // Hero
    heroWorldX,
    heroWorldY,
    heroPhase,
    heroFaceDir,
    walkDuration,
    // UI
    inputLocked,
    feedback,
    flashStatus,
    // HUD
    descentProgress,
    modeLabel,
    // Actions
    handleTileClick,
    resetDescent,
  };
}
