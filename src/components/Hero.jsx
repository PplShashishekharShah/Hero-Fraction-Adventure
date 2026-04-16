import { ASSETS } from '../constants/assets';

/**
 * Hero — Spider-Man character.
 *
 * - Bigger size: 110×140 px
 * - Shows specific shooting GIFs based on direction
 * - Shows falling GIF for incorrect choices
 */
export default function Hero({ x, y, heroState, heroDirection }) {
  // Determine which image to show
  const getHeroImage = () => {
    const isShooting = heroState === 'shooting';
    const isClimbing = heroState === 'climbing';
    const isAction   = isShooting || isClimbing;
    const isFalling  = heroState === 'falling';

    if (isFalling) return ASSETS.characterFall;
    
    if (isAction) {
      if (heroDirection === 'left')  return ASSETS.shootLeft;
      if (heroDirection === 'right') return ASSETS.shootRight;
      if (heroDirection === 'top')   return ASSETS.shootTop;
      return ASSETS.characterShoot; // fallback if no direction
    }

    return ASSETS.character;
  };

  const currentImg = getHeroImage();

  return (
    <img
      // Stability fix: the key remains the same for the entire jump/fall action
      // so the GIF doesn't restart or flicker when state moves from 'shooting' to 'climbing'
      key={heroState === 'idle' ? 'idle' : 'action-running'}
      src={currentImg}
      alt="Web Hero"
      style={{
        position:   'absolute',
        left:       x - 55,
        top:        y - 90,
        width:      110,
        height:     140, // consistent size
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
