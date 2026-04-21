import { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

/**
 * ModeTransitionOverlay — full-screen black fade between game modes.
 *
 * ROOT BUG THAT WAS FIXED:
 *   When onTransitionComplete() fires it changes `gamePhase` → 'descent',
 *   which makes the `active` prop flip false → the useEffect cleanup was
 *   cancelling t3/t4 (the fade-out timers) mid-flight, leaving a permanent
 *   black screen.
 *
 * Fix strategy:
 *   • `callbackRef` keeps the latest onTransitionComplete without listing it
 *     as a dep (prevents stale closure AND prevents effect restarts).
 *   • `hasStarted` guards against re-running when active briefly changes.
 *   • The cleanup is intentionally a no-op so in-flight timers complete.
 *
 * Props:
 *   active              — boolean: set true once to start the sequence
 *   onTransitionComplete — fired at the mid-point (while still fully black)
 *                          Parent should swap game state here.
 */
export default function ModeTransitionOverlay({ active, onTransitionComplete }) {
  const [opacity, setOpacity] = useState(0);
  const [visible, setVisible] = useState(false);

  // Keep callback ref always fresh — never listed in deps
  const callbackRef = useRef(onTransitionComplete);
  useEffect(() => { callbackRef.current = onTransitionComplete; });

  // Guard: only start the sequence once per active=true edge
  const hasStarted = useRef(false);

  useEffect(() => {
    // Only fire when active transitions true AND not already running
    if (!active || hasStarted.current) return;
    hasStarted.current = true;

    const {
      levelTransitionFadeOutMs:   fo,
      levelTransitionBlackHoldMs: hold,
      levelTransitionFadeInMs:    fi,
    } = GAME_CONFIG;

    setVisible(true);

    // 1. Fade to black
    const t1 = setTimeout(() => setOpacity(1), 30);

    // 2. Midpoint — notify parent to swap game state (still under black)
    const t2 = setTimeout(() => callbackRef.current?.(), 30 + fo + hold);

    // 3. Begin fade-back-in (reveal new mode underneath)
    const t3 = setTimeout(() => setOpacity(0), 30 + fo + hold + 60);

    // 4. Remove overlay from DOM once fully transparent
    const t4 = setTimeout(() => {
      setVisible(false);
      hasStarted.current = false; // allow future replays
    }, 30 + fo + hold + 60 + fi + 100);

    // ── INTENTIONALLY empty cleanup ───────────────────────────────────────
    // Do NOT cancel t1–t4 here. When `active` goes false (because the parent
    // swapped game state), React would otherwise kill t3/t4 before they fire,
    // leaving the overlay permanently black.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {};
  }, [active]); // only `active` in deps — callback handled via ref above

  if (!visible) return null;

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        background:    '#000',
        opacity,
        // Use levelTransitionFadeOutMs for both directions (same value, simpler)
        transition:    `opacity ${GAME_CONFIG.levelTransitionFadeOutMs}ms ease`,
        zIndex:        9999,
        pointerEvents: 'all', // block clicks during full transition
      }}
    />
  );
}
