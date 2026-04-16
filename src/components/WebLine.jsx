import { ASSETS } from '../constants/assets';

/**
 * WebLine — stretched image drawn from hero to anchor using CSS transform.
 */
export default function WebLine({ start, end, visible }) {
  if (!visible || !start || !end) return null;

  const dx   = end.x - start.x;
  const dy   = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <img
      src={ASSETS.webline}
      alt=""
      style={{
        position:        'absolute',
        left:            start.x,
        top:             start.y,
        width:           dist,
        height:          48,
        objectFit:       'fill',
        transformOrigin: '0 50%',
        transform:       `rotate(${angle}deg)`,
        opacity:         visible ? 1 : 0,
        transition:      'opacity 0.2s',
        pointerEvents:   'none',
        zIndex:          40,
        mixBlendMode:    'screen',
      }}
    />
  );
}
