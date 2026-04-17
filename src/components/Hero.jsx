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
      src={currentImg}
      alt="Web Hero"
      style={{
        position:   'absolute',
        // left:       x - 80,       // Adjusted offset for larger size
        // top:        y - 150,      // Adjusted offset for larger size
        // width:      160,          // Enlarged width
        // height:     220,          // Enlarged height
        left:       x - 70,       // Adjusted offset for larger size
        top:        y - 120,      // Adjusted offset for larger size
        width:      140,          // Enlarged width
        height:     180,          // Enlarged height
        objectFit:  'contain',
        zIndex:     25,
        // Transition becomes long (2.2s) only during the downward round shift ('idle')
        // to sync with buildings. During 'climbing' or 'falling', it stays fast (0.7s).
        transition: heroState === 'climbing' || heroState === 'falling'
          ? 'left 0.7s cubic-bezier(0.4, 0, 0.2, 1), top 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'left 2.2s cubic-bezier(0.42, 0, 0.58, 1), top 2.2s cubic-bezier(0.42, 0, 0.58, 1)',
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
