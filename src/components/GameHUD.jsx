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
            borderRadius: 8,
            padding:      '4px 12px',
            fontSize:     12,
            color:        '#7ee8ff',
            fontWeight:   700,
            cursor:       'default',
            whiteSpace:   'nowrap',
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
            background:   '#0a2a40',
            border:       '1px solid #1a6a8a',
            borderRadius: 8,
            padding:      '4px 10px',
            fontSize:     11,
            color:        '#aaddff',
            fontWeight:   600,
            whiteSpace:   'nowrap',
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
          padding:     '5px 18px',
          textAlign:   'center',
        }}
      >
        <span style={{ fontSize: 13, color: '#aaddff', fontWeight: 600 }}>
          🕸️ Tap the anchor with the{' '}
          <strong style={{ color: '#ffe740' }}>GREATER</strong> fraction to climb!
        </span>
      </div>
    </>
  );
}
