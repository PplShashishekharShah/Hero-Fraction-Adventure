import { useState, useEffect, useRef, useCallback } from 'react';
import { ROUNDS, TOTAL_CLIMBS } from '../data/rounds';
import {
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

  // ── Timeout registry ──────────────────────────────────────────────────────
  const timeouts = useRef([]);
  const delay = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
    return t;
  };
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];

  const setAnchor = (id, st) =>
    setAnchorStates(prev => ({ ...prev, [id]: st }));

  // ── Anchor geometry ───────────────────────────────────────────────────────
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
    setHeroPos({ x: VP_W / 2, y: HERO_START_Y });
    setSafePos({ x: VP_W / 2, y: HERO_START_Y });
    setInputLocked(false);
    setWeblineVisible(false);
    setWeblineEnd(null);
    setFeedback({ message: '', type: 'correct', visible: false });
    setAnchorStates({});
    setWon(false);
  }, []);

  // ── Anchor click ──────────────────────────────────────────────────────────
  const handleAnchorClick = useCallback(
    (anchorId) => {
      if (inputLocked || won) return;
      const anchor = anchors.find(a => a.id === anchorId);
      if (!anchor?.selectable) return;

      setInputLocked(true);
      const isCorrect = anchorId === round.correctId;

      const selFrac    = `${anchor.n}/${anchor.d}`;
      const allOptions =
        round.mode === 'intro'
          ? round.options
          : [round.upperLeft, round.upperRight].map((o, i) => ({ ...o, id: i === 0 ? 'ul' : 'ur' }));
      const other     = allOptions.find(o => o.id !== anchorId);
      const otherFrac = other ? `${other.n}/${other.d}` : '';

      // Step 1 — shoot web (GIF starts here)
      setHeroState('shooting');
      setWeblineEnd({ x: anchor.x, y: anchor.y });
      setWeblineVisible(true);

      delay(() => {
        // Step 2 — swing/climb (GIF stays on — same key 'swing' in Hero)
        setHeroState('climbing');

        if (isCorrect) {
          setAnchor(anchorId, 'correct');
          setHeroPos({ x: anchor.x, y: anchor.y });

          delay(() => {
            // Step 3 — celebrate (switch back to idle character img)
            setHeroState('celebrating');
            setWeblineVisible(false);
            setFeedback({
              message: `Great! ${selFrac} is greater than ${otherFrac}.`,
              type:    'correct',
              visible: true,
            });

            delay(() => {
              setFeedback(f => ({ ...f, visible: false }));
              const newProgress = progress + 1;
              setProgress(newProgress);

              if (newProgress >= TOTAL_CLIMBS) {
                setWon(true);
                setHeroState('idle');
                setInputLocked(false);
                return;
              }

              const nextRound = ROUNDS[roundIndex + 1];
              setAnchorStates({});

              if (nextRound?.mode === 'climb') {
                setHeroPos({ x: LEFT_X, y: LOWER_Y });
                setSafePos({ x: LEFT_X, y: LOWER_Y });
              } else {
                setHeroPos({ x: VP_W / 2, y: HERO_START_Y });
                setSafePos({ x: VP_W / 2, y: HERO_START_Y });
              }

              setRoundIndex(r => r + 1);
              setHeroState('idle');
              setInputLocked(false);
            }, 1000);
          }, 700);

        } else {
          // Wrong — swing halfway, break, fall back
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
                setInputLocked(false);
              }, 1200);
            }, 500);
          }, 400);
        }
      }, 500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputLocked, won, anchors, round, progress, roundIndex, heroPos, safePos]
  );

  // ── Derived UI values ─────────────────────────────────────────────────────
  // With 1 intro round (index 0) + 5 climb rounds (indices 1-5)
  const modeLabel =
    round.mode === 'intro'
      ? 'Intro Round 1 of 1'
      : `Climb Round ${roundIndex} of ${TOTAL_CLIMBS - 1}`;

  // Show rooftop only on the single intro round
  const showRooftop = roundIndex === 0;

  return {
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
    handleAnchorClick,
    resetGame,
  };
}
