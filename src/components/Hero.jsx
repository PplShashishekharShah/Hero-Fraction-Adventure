import { ASSETS } from '../constants/assets';

/**
 * Hero — Spider-Man character.
 *
 * - Bigger size: 110×140 px
 * - Shows specific shooting GIFs based on direction
 * - Shows falling GIF for incorrect choices
 */
export default function Hero({ x, y, heroState, heroDirection, scale = 1 }) {
  // Determine which image to show
  const getHeroImage = () => {
    const isShooting = heroState === 'shooting';
    const isClimbing = heroState === 'climbing';
    const isAction   = isShooting || isClimbing;
    const isFalling  = heroState === 'falling';

    if (heroState === 'backflip') return ASSETS.backflip;
    if (isFalling) return ASSETS.characterFall;
    if (heroState === 'victory_walk') return ASSETS.walking;
    
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
        left:       x - 70,       // Adjusted offset for larger size
        top:        y - 120,      // Adjusted offset for larger size
        width:      140,          // Enlarged width
        height:     180,          // Enlarged height
        objectFit:  'contain',
        zIndex:     25,
        // Transition becomes long (2.2s) only during the downward round shift ('idle')
        // to sync with buildings. During 'climbing', 'backflip', or 'falling', it stays fast (0.7s).
        transition: (['climbing', 'backflip', 'falling'].includes(heroState)
          ? 'left 0.7s cubic-bezier(0.4, 0, 0.2, 1), top 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s ease'
          : 'left 2.2s cubic-bezier(0.42, 0, 0.58, 1), top 2.2s cubic-bezier(0.42, 0, 0.58, 1), transform 2.2s ease') + ', filter 0.3s ease',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        filter:
          heroState === 'falling'
            ? 'drop-shadow(0 0 10px #ff4444)'
            : 'drop-shadow(0 2px 8px #000b)',
        animation:
          heroState === 'idle'
            ? 'heroFloat 3s ease-in-out infinite'
            : 'none',
      }}
    />
  );
}
