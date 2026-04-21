/**
 * GAME_CONFIG — centralized timing constants for the whole game.
 * Tune these values to adjust the feel without touching logic files.
 */
export const GAME_CONFIG = {
  // ── Mode transition (climb → descent) ────────────────────────────────────
  levelTransitionFadeOutMs:   900,
  levelTransitionBlackHoldMs: 1200,
  levelTransitionFadeInMs:    900,

  // ── Descent: tile break sequence ─────────────────────────────────────────
  correctStateMs: 300,   // idle  → correct (glow)
  crackStateMs:   300,   // correct → crack
  // broken state is set immediately after crackStateMs

  // ── Descent: hero alignment + fall ───────────────────────────────────────
  alignMs:        220,   // pause after X-align before fall starts
  fallDurationMs: 620,   // hero falls to lower floor (CSS transition)
  landingPauseMs: 300,   // landing hold before scroll triggers

  // ── Descent: world scroll ────────────────────────────────────────────────
  scrollDurationMs: 700, // floor layers slide up together

  // ── Descent: wrong answer ────────────────────────────────────────────────
  wrongStateMs: 750,     // wrong tile shown before resetting to idle

  // ── Descent: drilling animation ──────────────────────────────────────────
  drillDurationMs: 1200, // time Spiderman spends drilling before outcome

  // ── Descent: hero patrol ─────────────────────────────────────────────────
  patrolSpeedPxPerSecond: 110,
};

/**
 * DESCENT_LAYOUT — pixel positions for descent mode viewport.
 * Adjust these after first render to align floors with interior_building_bg.png.
 *
 * The coordinate system: all worldY values are in "world space" (Y grows downward).
 * screenY = worldY - worldOffset  (applied via CSS `top` on each element)
 *
 * VP_W = 900, VP_H = 560
 */
export const DESCENT_LAYOUT = {
  // ── Floor positions ───────────────────────────────────────────────────────
  upperRailingY:  145,   // screen Y of upper floor railing-top when worldOffset=0
  floorStep:      270,   // distance (px) between consecutive floor railing-tops
  //   → lower railing Y = 145 + 280 = 425
  //   → 3rd floor (hidden) = 145 + 436 = 581  (just below 560px viewport)

  // ── Floor image sizes ─────────────────────────────────────────────────────
  railingHeight:  68,    // floor_railing.png rendered height
  baseHeight:     52,    // floor_base.png rendered height

  // ── Hero feet position relative to floor ─────────────────────────────────
  // heroWorldY (feet) = floor.worldY + heroFeetFromRailingY
  // heroFeetFromRailingY ≈ railingHeight (hero stands on the base surface behind railing)
  heroFeetFromRailingY: 72,

  // ── Fraction tile positions (center X) ───────────────────────────────────
  leftTileX:  238,       // left tile center X
  rightTileX: 580,       // right tile center X — moved left to align with right door
  tileWidth:  160,       // width of each fraction tile (idle_floor.png, etc.)
  tileHeight: 58,        // height of each fraction tile

  // ── Hero patrol bounds (hero center X) ───────────────────────────────────
  patrolLeftX:  100,
  patrolRightX: 800,

  // ── Hero image dimensions + feet offset ──────────────────────────────────
  heroImgWidth:  110,    // rendered hero width
  heroImgHeight: 140,    // rendered hero height
  // image top = screenY - heroFeetOffset  (screenY = hero feet in screen space)
  heroFeetOffset: 112,
};
