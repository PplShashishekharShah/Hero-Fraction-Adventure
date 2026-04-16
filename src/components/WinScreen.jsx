/**
 * WinScreen — overlay shown when the player completes all rounds.
 */
export default function WinScreen({ onReplay }) {
  return (
    <div
      style={{
        position:       'absolute',
        inset:          0,
        background:     'rgba(0,8,24,0.92)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         100,
        gap:            18,
        animation:      'winPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{ fontSize: 60 }}>🏆</div>

      <h2
        style={{
          color:      '#ffe740',
          fontSize:   32,
          fontWeight: 900,
          margin:     0,
          textShadow: '0 0 20px #ffe74088',
        }}
      >
        You Reached the Top!
      </h2>

      <p style={{ color: '#7ee8ff', fontSize: 16, margin: 0 }}>
        Amazing fraction work, hero!
      </p>

      <button
        onClick={onReplay}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={e   => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          marginTop:    12,
          padding:      '12px 36px',
          fontSize:     16,
          fontWeight:   800,
          background:   'linear-gradient(135deg, #1de9b6, #1a8fff)',
          color:        '#001020',
          border:       'none',
          borderRadius: 12,
          cursor:       'pointer',
          boxShadow:    '0 0 24px #1de9b655',
          transition:   'transform 0.1s',
        }}
      >
        Play Again
      </button>
    </div>
  );
}
