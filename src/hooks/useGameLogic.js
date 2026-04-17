import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUNDS, TOTAL_CLIMBS } from '../data/rounds';
import {
  ASSETS,
  VP_W,
  LEFT_X,
  RIGHT_X,
  LOWER_Y,
  UPPER_Y,
  HERO_START_Y,
} from '../constants/assets';

/**
 * useGameLogic — all game state + action handlers.
 * Returns everything the UI needs.
 */
export function useGameLogic() {
  const [roundIndex,     setRoundIndex]     = useState(0);
  const [progress,       setProgress]       = useState(0);
  const [heroState,      setHeroState]      = useState('idle');
  const [heroPos,        setHeroPos]        = useState({ x: VP_W / 2, y: HERO_START_Y });
  const [safePos,        setSafePos]        = useState({ x: VP_W / 2, y: HERO_START_Y });
  const [inputLocked,    setInputLocked]    = useState(false);
  const [weblineVisible, setWeblineVisible] = useState(false);
  const [weblineEnd,     setWeblineEnd]     = useState(null);
  const [feedback,       setFeedback]       = useState({ message: '', type: 'correct', visible: false });
  const [anchorStates,   setAnchorStates]   = useState({});
  const [won,            setWon]            = useState(false);
  const [scrollKey,      setScrollKey]      = useState(0); 
  const [flashStatus,    setFlashStatus]    = useState(null); // 'correct' | 'incorrect' | null
  const [heroDirection,  setHeroDirection]  = useState(null); // 'left' | 'right' | 'top' | null

  // ── Timeout registry ──────────────────────────────────────────────────────
  const timeouts = useRef([]);
  const delay = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
    return t;
  }, []);

  useEffect(() => () => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    timeouts.current.forEach(clearTimeout);
  }, []);

  // ── Feedback Utilities ────────────────────────────────────────────────────
  const triggerFeedback = useCallback((type) => {
    setFlashStatus(type);
    delay(() => setFlashStatus(null), 1000);

    // Audio
    const sfx = new Audio(type === 'correct' ? ASSETS.sfxCorrect : ASSETS.sfxIncorrect);
    sfx.volume = 0.5;
    sfx.play().catch(() => {}); // catch autoplay blocks

    // Haptics (Vibration)
    if ("vibrate" in navigator) {
      navigator.vibrate(type === 'correct' ? 100 : [100, 50, 200]);
    }
  }, [delay]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];

  const setAnchor = (id, st) =>
    setAnchorStates(prev => ({ ...prev, [id]: st }));

  // ── Anchor geometry ───────────────────────────────────────────────────────
  // We shuffle the options so the correct one isn't always in the same spot
  const getAnchors = useCallback(() => {
    if (round.mode === 'intro') {
      return [
        { id: 'left',  x: LEFT_X,  y: UPPER_Y, n: round.options[0].n, d: round.options[0].d, selectable: true,  role: 'upper' },
        { id: 'right', x: RIGHT_X, y: UPPER_Y, n: round.options[1].n, d: round.options[1].d, selectable: true,  role: 'upper' },
      ];
    }

    return [
      { id: 'll', x: LEFT_X,  y: LOWER_Y, n: round.lowerLeft.n,  d: round.lowerLeft.d,  selectable: false, role: 'lower' },
      { id: 'lr', x: RIGHT_X, y: LOWER_Y, n: round.lowerRight.n, d: round.lowerRight.d, selectable: false, role: 'lower' },
      { id: 'ul', x: LEFT_X,  y: UPPER_Y, n: round.upperLeft.n,  d: round.upperLeft.d,  selectable: true,  role: 'upper' },
      { id: 'ur', x: RIGHT_X, y: UPPER_Y, n: round.upperRight.n, d: round.upperRight.d, selectable: true,  role: 'upper' },
    ];
  }, [round]);

  const anchors = getAnchors();

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    setRoundIndex(0);
    setProgress(0);
    setHeroState('idle');
    setHeroDirection(null);
    setHeroPos({ x: VP_W / 2, y: HERO_START_Y });
    setSafePos({ x: VP_W / 2, y: HERO_START_Y });
    setInputLocked(false);
    setWeblineVisible(false);
    setWeblineEnd(null);
    setFeedback({ message: '', type: 'correct', visible: false });
    setAnchorStates({});
    setWon(false);
    setScrollKey(0);
    setFlashStatus(null);
  }, []);

  // ── Anchor click ──────────────────────────────────────────────────────────
  const handleAnchorClick = useCallback(
    (anchorId) => {
      if (inputLocked || won) return;
      const anchor = anchors.find(a => a.id === anchorId);
      if (!anchor?.selectable) return;

      setInputLocked(true);
      
      // Check correctness by values, not just IDs, due to shuffling
      const correctVal = round.mode === 'intro' 
        ? Math.max(round.options[0].n / round.options[0].d, round.options[1].n / round.options[1].d)
        : Math.max(round.upperLeft.n / round.upperLeft.d, round.upperRight.n / round.upperRight.d);
      
      const selectedVal = anchor.n / anchor.d;
      const isCorrect = Math.abs(selectedVal - correctVal) < 0.0001;

      // Determine shooting direction GIF
      if (Math.abs(anchor.x - heroPos.x) < 50) setHeroDirection('top');
      else if (anchor.x < heroPos.x)           setHeroDirection('left');
      else                                     setHeroDirection('right');

      const selFrac    = `${anchor.n}/${anchor.d}`;
      const allOptions = anchors.filter(a => a.selectable);
      const other      = allOptions.find(o => o.id !== anchorId);
      const otherFrac = other ? `${other.n}/${other.d}` : '';

      // Step 1 — shoot web
      setHeroState('shooting');
      setWeblineEnd({ x: anchor.x, y: anchor.y });
      setWeblineVisible(true);

      delay(() => {
        // Step 2 — swing/climb
        setHeroState('climbing');

        if (isCorrect) {
          triggerFeedback('correct');
          setAnchor(anchorId, 'correct');
          setHeroPos({ x: anchor.x, y: anchor.y });

          delay(() => {
            // Step 3 — backflip on landing
            setHeroState('backflip');
            setWeblineVisible(false);

            delay(() => {
              // Step 4 — celebrate
              setHeroState('celebrating');
              setFeedback({
                message: `Great! ${selFrac} is greater than ${otherFrac}.`,
                type:    'correct',
                visible: true,
              });

              delay(() => {
                setFeedback(f => ({ ...f, visible: false }));
                setScrollKey(k => k + 1);   
                const newProgress = progress + 1;
                setProgress(newProgress);

                if (newProgress >= TOTAL_CLIMBS) {
                  setWon(true);
                  setHeroState('idle');
                  setHeroDirection(null);
                  setInputLocked(false);
                  return;
                }

                const nextRound = ROUNDS[roundIndex + 1];
                setAnchorStates({});
                
                const landedX = anchor.x;
                if (nextRound?.mode === 'climb') {
                  setHeroPos({ x: landedX, y: LOWER_Y });
                  setSafePos({ x: landedX, y: LOWER_Y });
                } else {
                  setHeroPos({ x: landedX, y: LOWER_Y });
                  setSafePos({ x: landedX, y: LOWER_Y });
                }

                setRoundIndex(r => r + 1);
                setHeroState('idle');
                setHeroDirection(null);
                setInputLocked(false);
              }, 1000);
            }, 1500); // backflip duration
          }, 700); // climb duration

        } else {
          // Wrong
          triggerFeedback('incorrect');
          const midX = (heroPos.x + anchor.x) / 2;
          const midY = (heroPos.y + anchor.y) / 2;
          setAnchor(anchorId, 'wrong');
          setHeroPos({ x: midX, y: midY });

          delay(() => {
            setAnchor(anchorId, 'break');

            delay(() => {
              setHeroState('falling');
              setWeblineVisible(false);
              setHeroPos({ x: safePos.x, y: safePos.y });
              setFeedback({
                message: `Oops! ${selFrac} is smaller. Try again!`,
                type:    'wrong',
                visible: true,
              });

              delay(() => {
                setFeedback(f => ({ ...f, visible: false }));
                setAnchor(anchorId, 'idle');
                setHeroState('idle');
                setHeroDirection(null);
                setInputLocked(false);
              }, 1200);
            }, 500);
          }, 400);
        }
      }, 500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputLocked, won, anchors, round, progress, roundIndex, heroPos, safePos, triggerFeedback]
  );

  // ── Derived UI values ─────────────────────────────────────────────────────
  const modeLabel =
    round.mode === 'intro'
      ? 'Intro Round 1 of 1'
      : `Climb Round ${roundIndex} of ${TOTAL_CLIMBS - 1}`;

  const showRooftop = roundIndex === 0;

  return {
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
  };
}
