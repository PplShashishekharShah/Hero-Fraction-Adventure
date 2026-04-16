import { ASSETS } from '../constants/assets';

/**
 * Hero — Spider-Man character.
 *
 * - Bigger size: 110×140 px
 * - Shows shooting GIF during both 'shooting' AND 'climbing' states
 *   so the web-swing animation plays through the whole movement.
 */
export default function Hero({ x, y, heroState }) {
  // Show the action GIF while launching AND swinging toward anchor
  const isSwinging = heroState === 'shooting' || heroState === 'climbing';

  return (
    <img
      key={isSwinging ? 'swing' : 'idle'}
      src={isSwinging ? ASSETS.characterShoot : ASSETS.character}
      alt="Web Hero"
      style={{
        position:   'absolute',
        left:       x - 55,
        top:        y - 90,
        width:      110,
        height:     140,
        objectFit:  'contain',
        zIndex:     25,
        transition: 'left 0.7s cubic-bezier(0.4,0,0.2,1), top 0.7s cubic-bezier(0.4,0,0.2,1)',
        filter:
          heroState === 'celebrating'
            ? 'drop-shadow(0 0 14px #ffe740)'
            : heroState === 'falling'
            ? 'drop-shadow(0 0 10px #ff4444)'
            : 'drop-shadow(0 2px 8px #000b)',
        animation:
          heroState === 'celebrating'
            ? 'heroBounce 0.5s ease'
            : heroState === 'idle'
            ? 'heroFloat 3s ease-in-out infinite'
            : 'none',
      }}
    />
  );
}
