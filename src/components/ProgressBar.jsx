/**
 * ProgressBar — shows step count and a coloured fill strip.
 * accentColor defaults to climb-mode teal; descent mode passes purple.
 */
export default function ProgressBar({ progress, total, accentColor = '#1de9b6' }) {
  const pct = Math.round((progress / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          fontSize:   15,
          color:      '#7ee8ff',
          fontWeight: 900,
          whiteSpace: 'nowrap',
          letterSpacing: 1,
        }}
      >
        CLIMB {progress}/{total}
      </span>

      <div
        style={{
          flex:         1,
          height:       24,
          background:   'rgba(0,0,0,0.4)',
          borderRadius: 12,
          border:       '2px solid #1a4a6a',
          overflow:     'hidden',
          boxShadow:    'inset 0 2px 10px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            height:         '100%',
            width:          `${pct}%`,
            background:     `linear-gradient(90deg, ${accentColor}, ${accentColor}bb, ${accentColor})`,
            backgroundSize: '200% 100%',
            borderRadius:   12,
            transition:     'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow:      `0 0 15px ${accentColor}99`,
          }}
        />
      </div>

      <span style={{ fontSize: 16, color: accentColor, fontWeight: 900, width: 45 }}>
        {pct}%
      </span>
    </div>
  );
}
