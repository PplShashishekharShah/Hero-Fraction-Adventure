/**
 * ROUNDS data — 1 intro round, then 5 climb rounds.
 *
 * intro  → options[2] with ids "left" | "right"  (only 2 anchor pads)
 * climb  → lowerLeft / lowerRight (display only) + upperLeft / upperRight (selectable)
 *
 * correctId always points to the greater fraction.
 */
export const ROUNDS = [
  // ── SINGLE INTRO ROUND ───────────────────────────────────────────────────
  {
    mode: 'intro',
    options: [
      { id: 'left',  n: 1, d: 2 },
      { id: 'right', n: 1, d: 3 },
    ],
    correctId: 'left',
  },

  // ── CLIMB ROUNDS ──────────────────────────────────────────────────────────
  {
    mode: 'climb',
    lowerLeft:  { n: 1, d: 2 },
    lowerRight: { n: 3, d: 5 },
    upperLeft:  { id: 'ul', n: 3, d: 4 },
    upperRight: { id: 'ur', n: 5, d: 8 },
    correctId: 'ul',
  },
  {
    mode: 'climb',
    lowerLeft:  { n: 3, d: 4 },
    lowerRight: { n: 5, d: 8 },
    upperLeft:  { id: 'ul', n: 2, d: 3 },
    upperRight: { id: 'ur', n: 3, d: 5 },
    correctId: 'ul',
  },
  {
    mode: 'climb',
    lowerLeft:  { n: 2, d: 3 },
    lowerRight: { n: 3, d: 5 },
    upperLeft:  { id: 'ul', n: 5, d: 6 },
    upperRight: { id: 'ur', n: 7, d: 9 },
    correctId: 'ul',
  },
  {
    mode: 'climb',
    lowerLeft:  { n: 5, d: 6 },
    lowerRight: { n: 7, d: 9 },
    upperLeft:  { id: 'ul', n: 5, d: 12 },
    upperRight: { id: 'ur', n: 3, d: 8 },
    correctId: 'ur',
  },
  {
    mode: 'climb',
    lowerLeft:  { n: 3, d: 8 },
    lowerRight: { n: 5, d: 12 },
    upperLeft:  { id: 'ul', n: 7, d: 10 },
    upperRight: { id: 'ur', n: 9, d: 10 },
    correctId: 'ur',
  },
];

export const TOTAL_CLIMBS = ROUNDS.length; // 6
