/**
 * FeedbackToast — slides in/out to show correct / wrong messages.
 *
 * Props:
 *   message — string
 *   type    — 'correct' | 'wrong'
 *   visible — boolean
 */
export default function FeedbackToast({ message, type, visible }) {
  const isCorrect = type === 'correct';

  return (
    <div
      style={{
        position:   'absolute',
        top:        60,
        left:       '50%',
        transform:  `translateX(-50%) translateY(${visible ? 0 : -20}px)`,
        opacity:    visible ? 1 : 0,
        transition: 'all 0.3s ease',
        background: isCorrect ? '#0d3d2a' : '#3d0d0d',
        border:     `2px solid ${isCorrect ? '#1de9b6' : '#ff4444'}`,
        borderRadius: 12,
        padding:    '8px 20px',
        zIndex:     50,
        pointerEvents: 'none',
        textAlign:  'center',
        maxWidth:   320,
        boxShadow:  isCorrect ? '0 0 20px #1de9b644' : '0 0 20px #ff444444',
      }}
    >
      <span
        style={{
          fontSize:   14,
          fontWeight: 700,
          color:      isCorrect ? '#1de9b6' : '#ff7777',
        }}
      >
        {isCorrect ? '✓ ' : '✗ '}
        {message}
      </span>
    </div>
  );
}
