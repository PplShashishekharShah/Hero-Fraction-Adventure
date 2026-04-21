// ─── Fraction math utilities ──────────────────────────────────────────────────

/** Greatest common divisor (Euclidean) */
export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** Decimal value of a fraction */
export const fractionValue = (n, d) => n / d;

/** Returns true if fraction a > fraction b */
export const compareFractions = (a, b) =>
  fractionValue(a.n, a.d) > fractionValue(b.n, b.d);

// ─── Descent mode helpers ─────────────────────────────────────────────────────────
// Fractions in descent mode use { numerator, denominator } shape.

/** Returns true if fraction a < fraction b (uses numerator/denominator keys) */
export const isSmallerFraction = (a, b) =>
  fractionValue(a.numerator, a.denominator) < fractionValue(b.numerator, b.denominator);

/** Returns 'left' | 'right' — which side holds the smaller fraction */
export const getSmallerSide = (left, right) =>
  fractionValue(left.numerator, left.denominator) <= fractionValue(right.numerator, right.denominator)
    ? 'left'
    : 'right';
