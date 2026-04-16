/**
 * ProgressBar — shows climb count and a coloured fill strip.
 */
export default function ProgressBar({ progress, total }) {
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
            height:       '100%',
            width:        `${pct}%`,
            background:   'linear-gradient(90deg, #1de9b6, #00b0ff, #1de9b6)',
            backgroundSize: '200% 100%',
            borderRadius: 12,
            transition:   'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow:    '0 0 15px rgba(29, 233, 182, 0.6)',
          }}
        />
      </div>

      <span style={{ fontSize: 16, color: '#1de9b6', fontWeight: 900, width: 45 }}>
        {pct}%
      </span>
    </div>
  );
}
