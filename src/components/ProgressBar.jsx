/**
 * ProgressBar — shows climb count and a coloured fill strip.
 */
export default function ProgressBar({ progress, total }) {
  const pct = Math.round((progress / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          fontSize:   12,
          color:      '#7ee8ff',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        CLIMB {progress}/{total}
      </span>

      <div
        style={{
          flex:         1,
          height:       12,
          background:   '#0a1a2a',
          borderRadius: 8,
          border:       '1px solid #1a4a6a',
          overflow:     'hidden',
        }}
      >
        <div
          style={{
            height:       '100%',
            width:        `${pct}%`,
            background:   'linear-gradient(90deg, #1de9b6, #7ee8ff)',
            borderRadius: 8,
            transition:   'width 0.5s ease',
            boxShadow:    '0 0 8px #1de9b666',
          }}
        />
      </div>

      <span style={{ fontSize: 12, color: '#7ee8ff', fontWeight: 700 }}>
        {pct}%
      </span>
    </div>
  );
}
