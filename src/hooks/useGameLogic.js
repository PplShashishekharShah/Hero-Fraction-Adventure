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
export function useGameLogic(isReady = true) {
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
  const [heroScale,      setHeroScale]      = useState(1);

  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

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

  // ── Voice Synthesis ───────────────────────────────────────────────────────
  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) {
       if (onEnd) onEnd();
       return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; 
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }, []);

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
    setFeedback({ message: '', type: 'incorrect', visible: false });
    setAnchorStates({});
    setWon(false);
    setScrollKey(0);
    setFlashStatus(null);
    setHeroScale(1);
    setIncorrectAttempts(0);

    // Tutorial: Highlight correct anchor immediately in Intro mode
    if (ROUNDS[roundIndex]?.mode === 'intro') {
      setAnchorStates({ [ROUNDS[roundIndex].correctId]: 'highlight' });
    }
  }, [roundIndex]);
  
  // ── Tutorial Logic for Intro Mode ───────────────────────────────────────
  useEffect(() => {
    // Only show guidance if ready, not in backflip/falling, and NOT currently showing a specific feedback (like Oops!)
    if (isReady && round.mode === 'intro' && !inputLocked && !won && !feedback.visible) {
      const sideText = round.correctId === 'left' ? 'LEFT' : 'RIGHT';
      const msg = `Tap the ${sideText} anchor to climb!`;
      setFeedback({
        message: msg,
        type:    'tutorial',
        visible: true,
      });
      speak(msg);
      // Tutorial message stays visible in intro round until transition
    }
  }, [roundIndex, won, inputLocked, round.mode, round.correctId, speak, isReady, feedback.visible]);

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

      const allOptions = anchors.filter(a => a.selectable);
      const other      = allOptions.find(o => o.id !== anchorId);

      // Step 1 — shoot web
      setHeroState('shooting');
      setWeblineEnd({ x: anchor.x, y: anchor.y });
      setWeblineVisible(true);

      delay(() => {
        // Step 2 — swing/climb
        setHeroState('climbing');

        if (isCorrect) {
          // Success! 
          triggerFeedback('correct');
          if (round.mode === 'intro') {
            const msg = `Great, now help hero to climb building!`;
            setFeedback({ message: msg, type: 'tutorial', visible: true });
            speak(msg, () => {
              delay(() => setFeedback(f => ({ ...f, visible: false })), 1000);
            });
            // Tutorial message stays visible in intro round until voice finishes
          } else {
            // No message logic for normal success as per previous requirement
            setFeedback(f => ({ ...f, visible: false }));
          }
          
          setAnchor(anchorId, 'correct');
          // setFeedback(f => ({ ...f, visible: false })); // Handled above now
          setHeroPos({ x: anchor.x, y: anchor.y });

          delay(() => {
            // Step 3 — Jump to backflip immediately on landing (no intermediate static state)
            setHeroState('backflip');
            setWeblineVisible(false);

            delay(() => {
              // Step 4 — End of backflip
              const newProgress = progress + 1;
              setProgress(newProgress);
              setAnchorStates({});
              setIncorrectAttempts(0);

              if (newProgress >= TOTAL_CLIMBS) {
                // FINAL Rooftop Climax: Automatically jump to right rooftop
                setFeedback({ message: "MISSION COMPLETE!", type: 'correct', visible: true });
                
                delay(() => {
                  setHeroState('shooting');
                  setHeroDirection('right');
                  setWeblineEnd({ x: VP_W - 40, y: 100 });
                  setWeblineVisible(true);

                  delay(() => {
                    setHeroState('climbing');
                    setHeroScale(0.8);
                    const rooftopPos = { x: VP_W - 100, y: 80 }; // Landing accurately on 67px terrace
                    setHeroPos(rooftopPos);

                    delay(() => {
                      setInputLocked(false);
                      setWon(true); 
                      // Removed: MISSION COMPLETE feedback

                      // NEW: Start victory walk off-screen
                      delay(() => {
                        setHeroState('victory_walk');
                        setHeroPos({ x: VP_W + 600, y: rooftopPos.y });
                      }, 400);
                    }, 700); // final climb duration
                  }, 600); // final shooting delay
                }, 1000); // pause after last anchor backflip
                return;
              }

              // Normal round transition — directly into stagnant idle/celebrate after backflip
              setHeroState('idle');
              // REMOVED: setFeedback({ message: `Correct!`, type: 'correct', visible: true });

              delay(() => {
                setFeedback(f => ({ ...f, visible: false }));
                setScrollKey(k => k + 1);   
                
                const nextRound = ROUNDS[roundIndex + 1];
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
            }, 800); // backflip duration (reduced further to restrict to 1 play)
          }, 700); // climb duration

        } else {
          // Wrong
          triggerFeedback('incorrect');
          const midX = (heroPos.x + anchor.x) / 2;
          const midY = (heroPos.y + anchor.y) / 2;
          setAnchor(anchorId, 'wrong');
          setHeroPos({ x: midX, y: midY });

          const newAttempts = incorrectAttempts + 1;
          setIncorrectAttempts(newAttempts);

          delay(() => {
            setAnchor(anchorId, 'break');

            delay(() => {
              setHeroState('falling');
              setWeblineVisible(false);
              setHeroPos({ x: safePos.x, y: safePos.y });
              const msg = `Oops! Pick the larger fraction!`;
              setFeedback({ message: msg, type: 'incorrect', visible: true });
              speak(msg, () => {
                delay(() => setFeedback(f => ({ ...f, visible: false })), 600);
              });

              const allOptions = anchors.filter(a => a.selectable);
              const other      = allOptions.find(o => o.id !== anchorId);
              if (newAttempts >= 2 && other) {
                setAnchor(other.id, 'highlight');
              }

              delay(() => {
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
    [inputLocked, won, anchors, round, progress, roundIndex, heroPos, safePos, triggerFeedback, incorrectAttempts]
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
    heroScale,
    handleAnchorClick,
    resetGame,
  };
}
