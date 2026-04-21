// ─── Asset paths served from /public/assets/ ────────────────────────────────
export const ASSETS = {
  bg:              '/assets/newyork_main_bg.png',
  rooftop:         '/assets/rooftop_start.png',
  leftBuilding:    '/assets/left_building2.png',
  rightBuilding:   '/assets/right_building2.png',
  character:       '/assets/character.png',
  characterShoot:  '/assets/character_shooting_web.gif', // fallback
  shootLeft:       '/assets/shooting_left.gif',
  shootRight:      '/assets/shooting_right.gif',
  shootTop:        '/assets/shooting_top.gif',
  characterFall:   '/assets/fallen_character.gif',
  anchorIdle:      '/assets/anchor_pads_idle.png',
  anchorCorrect:   '/assets/anchor_pads_idle.png',
  anchorWrong:     '/assets/anchor_pads_wrong.png',
  anchorBreak:     '/assets/anchor_pads_break.png',
  plate:           '/assets/fraction_display_plate.png',
  webline:         '/assets/webline.png',
  backflip:        '/assets/backflip2.gif',
  leftTerrace:     '/assets/left_terrace_top.png',
  rightTerrace:    '/assets/right_terrace_top.png',
  leftSky:         '/assets/left_sky.png',
  rightSky:        '/assets/right_sky.png',
  sfxCorrect:      '/assets/correct.wav',
  sfxIncorrect:    '/assets/incorrect.wav',

  // ── Descent Mode (Mode 2) ──────────────────────────────────────────────
  interiorBg:      '/assets/interior_building_bg2.png',
  floorBase:       '/assets/floor_base.png',
  floorRailing:    '/assets/floor_railing.png',
  floorIdle:       '/assets/idle_floor.png',
  floorCorrect:    '/assets/correct_floor.png',
  floorWrong:      '/assets/wrong_floor.png',
  floorCrack:      '/assets/crack_floor.png',
  floorBroken:     '/assets/broken_floor.png',
  walking:         '/assets/walking.gif',
  tunnel:          '/assets/tunnel3.png',
  drill:           '/assets/drill2.gif',
};

// ─── Viewport constants ───────────────────────────────────────────────────────
export const VP_W = 900;
export const VP_H = 560;

// Anchor lane x positions
export const LEFT_X  = 255;
export const RIGHT_X = 645;

// Row y positions — wider gap so upper/lower pads feel far apart
export const LOWER_Y = 435;   // lower pads close to bottom
export const UPPER_Y = 140;   // upper pads near top → 295px gap between rows

// Hero starting y (intro round — standing on rooftop)
export const HERO_START_Y = 455;
