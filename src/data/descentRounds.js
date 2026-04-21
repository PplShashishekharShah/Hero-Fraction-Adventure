/**
 * DESCENT_ROUNDS — hardcoded floor data for descent mode (Mode 2).
 *
 * Fractions use { numerator, denominator } shape.
 * correctSide: 'left' | 'right' — which side holds the SMALLER fraction.
 *
 * Validation (all correctSide values verified):
 *   dr-1:  2/9  ≈ 0.222 < 5/3  ≈ 1.667  → right ✓
 *   dr-2:  2/5  = 0.400 < 4/7  ≈ 0.571  → left  ✓
 *   dr-3:  5/12 ≈ 0.417 < 3/4  = 0.750  → right ✓
 *   dr-4:  2/3  ≈ 0.667 < 7/8  = 0.875  → right ✓
 *   dr-5:  1/4  = 0.250 < 3/8  = 0.375  → left  ✓
 *   dr-6:  4/9  ≈ 0.444 < 5/6  ≈ 0.833  → right ✓
 */
export const DESCENT_ROUNDS = [
  {
    id: 'dr-1',
    leftFraction:  { numerator: 5, denominator: 3 },
    rightFraction: { numerator: 2, denominator: 9 },
    correctSide:   'right',
  },
  {
    id: 'dr-2',
    leftFraction:  { numerator: 2, denominator: 5 },
    rightFraction: { numerator: 4, denominator: 7 },
    correctSide:   'left',
  },
  {
    id: 'dr-3',
    leftFraction:  { numerator: 3, denominator: 4 },
    rightFraction: { numerator: 5, denominator: 12 },
    correctSide:   'right',
  },
  {
    id: 'dr-4',
    leftFraction:  { numerator: 7, denominator: 8 },
    rightFraction: { numerator: 2, denominator: 3 },
    correctSide:   'right',
  },
  {
    id: 'dr-5',
    leftFraction:  { numerator: 1, denominator: 4 },
    rightFraction: { numerator: 3, denominator: 8 },
    correctSide:   'left',
  },
  {
    id: 'dr-6',
    leftFraction:  { numerator: 5, denominator: 6 },
    rightFraction: { numerator: 4, denominator: 9 },
    correctSide:   'right',
  },
];

export const TOTAL_DESCENT_DROPS = DESCENT_ROUNDS.length; // 6
