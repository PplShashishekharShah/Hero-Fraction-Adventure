/**
 * DescentWinScreen — overlay shown when all descent drops are completed.
 *
 * Props:
 *   onPlayAgainDescent — restart descent mode from floor 1
 *   onClimbAgain       — reset entire game back to climb mode
 */
export default function DescentWinScreen({ onPlayAgainDescent, onClimbAgain }) {
  const btnBase = {
    padding:      '11px 28px',
    fontSize:     15,
    fontWeight:   800,
    border:       'none',
    borderRadius: 10,
    cursor:       'pointer',
    transition:   'transform 0.12s ease, box-shadow 0.12s ease',
  };

  const handleEnter = (e) => {
    e.currentTarget.style.transform  = 'scale(1.06)';
    e.currentTarget.style.boxShadow  = '0 0 24px currentColor';
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '';
  };
  const handleDown  = (e) => { e.currentTarget.style.transform = 'scale(0.96)'; };
  const handleUp    = (e) => { e.currentTarget.style.transform = 'scale(1.06)'; };

  return (
    <div
      style={{
        position:        'absolute',
        inset:           0,
        background:      'rgba(0, 8, 20, 0.93)',
        backdropFilter:  'blur(6px)',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          100,
        gap:             18,
        animation:       'winPop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Medal */}
      <div style={{ fontSize: 60 }}>🏅</div>

      {/* Headline */}
      <h2
        style={{
          color:      '#ffe740',
          fontSize:   26,
          fontWeight: 900,
          margin:     0,
          textAlign:  'center',
          textShadow: '0 0 20px #ffe74088',
          padding:    '0 24px',
        }}
      >
        You Made It to the Bottom!
      </h2>

      <p style={{ color: '#7ee8ff', fontSize: 15, margin: 0, textAlign: 'center', maxWidth: 360 }}>
        Amazing work! You chose the <strong style={{ color: '#1de9b6' }}>smaller</strong> fraction every time. 🎉
      </p>

      {/* Buttons */}
      <div
        style={{
          display:        'flex',
          gap:            14,
          flexWrap:       'wrap',
          justifyContent: 'center',
          marginTop:      8,
        }}
      >
        <button
          onClick={onPlayAgainDescent}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, #1de9b6, #1a8fff)',
            color:      '#001020',
            boxShadow:  '0 0 16px #1de9b655',
          }}
        >
          Play Descent Again
        </button>

        <button
          onClick={onClimbAgain}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, #ffe740, #ff9800)',
            color:      '#001020',
            boxShadow:  '0 0 16px #ffe74055',
          }}
        >
          🕷️ Climb Again
        </button>
      </div>
    </div>
  );
}
