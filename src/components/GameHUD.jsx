import ProgressBar from './ProgressBar';
import { TOTAL_CLIMBS } from '../data/rounds';
import { VP_W } from '../constants/assets';

/**
 * GameHUD — top bar with back-label, progress bar, and mode label.
 */
export default function GameHUD({ progress, modeLabel }) {
  return (
    <>
      {/* ── Top bar ── */}
      <div
        style={{
          width:        VP_W,
          maxWidth:     '100%',
          background:   '#001428',
          border:       '1px solid #1a4a6a',
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
            background:   '#0a2a40',
            border:       '1px solid #1a6a8a',
            borderRadius: 10,
            padding:      '6px 16px',
            fontSize:     14,
            color:        '#b2f2ff',
            fontWeight:   900,
            cursor:       'default',
            whiteSpace:   'nowrap',
            boxShadow:    '0 0 10px rgba(126, 232, 255, 0.2)',
          }}
        >
          ← GRADE 4
        </div>

        <div style={{ flex: 1 }}>
          <ProgressBar progress={progress} total={TOTAL_CLIMBS} />
        </div>

        {/* Mode label */}
        <div
          style={{
            background:   'rgba(10, 42, 64, 0.8)',
            border:       '1px solid #1de9b6',
            borderRadius: 10,
            padding:      '6px 14px',
            fontSize:     13,
            color:        '#1de9b6',
            fontWeight:   800,
            whiteSpace:   'nowrap',
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
          background:  '#001a30',
          borderLeft:  '1px solid #1a4a6a',
          borderRight: '1px solid #1a4a6a',
          padding:     '10px 18px',
          textAlign:   'center',
          boxShadow:   'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: 16, color: '#e0f4ff', fontWeight: 700, letterSpacing: 0.5 }}>
          🕸️ Tap the anchor with the{' '}
          <strong style={{ color: '#ffe740', fontSize: 18, textShadow: '0 0 8px #ffe74088' }}>GREATER</strong> fraction to climb!
        </span>
      </div>
    </>
  );
}
