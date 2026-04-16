// ─── Fraction math utilities ──────────────────────────────────────────────────

/** Greatest common divisor (Euclidean) */
export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** Decimal value of a fraction */
export const fractionValue = (n, d) => n / d;

/** Returns true if fraction a > fraction b */
export const compareFractions = (a, b) =>
  fractionValue(a.n, a.d) > fractionValue(b.n, b.d);
