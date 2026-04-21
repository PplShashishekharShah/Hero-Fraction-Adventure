import ProgressBar from './ProgressBar';
import { TOTAL_CLIMBS } from '../data/rounds';
import { VP_W } from '../constants/assets';

/**
 * GameHUD — top bar with back-label, progress bar, and mode label.
 *
 * Props:
 *   progress  — current step count
 *   total     — total steps (defaults to TOTAL_CLIMBS for backward-compat)
 *   modeLabel — text shown in the right badge
 *   gameMode  — 'climb' (default) | 'descent'  — controls theme colour + instruction text
 */
export default function GameHUD({ progress, total = TOTAL_CLIMBS, modeLabel, gameMode = 'climb' }) {
  const isClimb = gameMode !== 'descent';

  const accentColor   = isClimb ? '#1de9b6' : '#e040fb';
  const borderColor   = isClimb ? '#1a4a6a' : '#2a1a4a';
  const bgColor       = isClimb ? '#001428' : '#0d0120';
  const instrBg       = isClimb ? '#001a30' : '#0a0118';
  const gradeBg       = isClimb ? '#0a2a40' : '#1a0a30';
  const gradeBorder   = isClimb ? '#1a6a8a' : '#4a2a6a';
  const gradeColor    = isClimb ? '#b2f2ff' : '#d0b0ff';
  const gradeShadow   = isClimb
    ? '0 0 10px rgba(126, 232, 255, 0.2)'
    : '0 0 10px rgba(180, 130, 255, 0.2)';

  const instructionKeyword = isClimb ? 'GREATER' : 'SMALLER';
  const instructionEmoji   = isClimb ? '🕸️' : '🏗️';
  const instructionVerb    = isClimb
    ? 'Tap the anchor with the'
    : 'Tap the floor tile with the';
  const instructionEnd     = isClimb
    ? 'fraction to climb!'
    : 'fraction to break through!';

  return (
    <>
      {/* ── Top bar ── */}
      <div
        style={{
          width:        VP_W,
          maxWidth:     '100%',
          background:   bgColor,
          border:       `1px solid ${borderColor}`,
          borderBottom: 'none',
          borderRadius: '14px 14px 0 0',
          padding:      '10px 18px',
          display:      'flex',
          alignItems:   'center',
          gap:          16,
        }}
      >
        {/* Grade tag */}
        <div
          style={{
            background:   gradeBg,
            border:       `1px solid ${gradeBorder}`,
            borderRadius: 10,
            padding:      '6px 16px',
            fontSize:     14,
            color:        gradeColor,
            fontWeight:   900,
            cursor:       'default',
            whiteSpace:   'nowrap',
            boxShadow:    gradeShadow,
          }}
        >
          ← GRADE 4
        </div>

        <div style={{ flex: 1 }}>
          <ProgressBar progress={progress} total={total} accentColor={accentColor} />
        </div>

        {/* Mode label */}
        <div
          style={{
            background:    `rgba(${isClimb ? '10, 42, 64' : '26, 0, 48'}, 0.8)`,
            border:        `1px solid ${accentColor}`,
            borderRadius:  10,
            padding:       '6px 14px',
            fontSize:      13,
            color:         accentColor,
            fontWeight:    800,
            whiteSpace:    'nowrap',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {modeLabel}
        </div>
      </div>

      {/* ── Instruction strip ── */}
      <div
        style={{
          width:       VP_W,
          maxWidth:    '100%',
          background:  instrBg,
          borderLeft:  `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          padding:     '10px 18px',
          textAlign:   'center',
          boxShadow:   'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: 16, color: '#e0f4ff', fontWeight: 700, letterSpacing: 0.5 }}>
          {instructionEmoji} {instructionVerb}{' '}
          <strong
            style={{
              color:      '#ffe740',
              fontSize:   18,
              textShadow: '0 0 8px #ffe74088',
            }}
          >
            {instructionKeyword}
          </strong>
          {' '}{instructionEnd}
        </span>
      </div>
    </>
  );
}
