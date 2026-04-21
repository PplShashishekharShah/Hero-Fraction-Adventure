import { ASSETS, VP_W } from '../constants/assets';
import { DESCENT_LAYOUT } from '../constants/gameConfig';
import FractionFloorTile from './FractionFloorTile';

/**
 * FloorRow — renders one complete floor: railing + base + two fraction tiles.
 *
 * FIX: Instead of stretching one image to VP_W (which compresses it),
 * we place TWO copies side-by-side with a small overlap (~80px) so the
 * natural image proportions are preserved and the full width is covered.
 *
 * Layout:
 *   [ image 1 (left-anchored, 60% width) ][ image 2 (right-anchored, 60% width) ]
 *   The two copies overlap in the centre by 20% — this hides the seam and
 *   fills the viewport width perfectly.
 */
export default function FloorRow({ floor, isActive, onTileClick }) {
  const {
    railingHeight, baseHeight,
    leftTileX, rightTileX,
    tileWidth, tileHeight,
  } = DESCENT_LAYOUT;

  const rowHeight = railingHeight + baseHeight;

  // Each image piece is 58% of VP_W — two pieces overlap by 16% in the middle
  // covering 58+58-16 = 100% of the viewport width seamlessly.
  const pieceW = Math.round(VP_W * 0.58); // ≈ 522px for VP_W=900

  return (
    <div style={{ position: 'relative', width: VP_W, height: rowHeight }}>

      {/* ── Railing: two images side-by-side ── */}
      {/* Left piece */}
      <img
        src={ASSETS.floorRailing}
        alt=""
        draggable={false}
        style={{
          position:  'absolute',
          top:       25,
          left:      45,
          width:     pieceW,
          height:    railingHeight,
          objectFit: 'cover',
          objectPosition: 'left center',
          zIndex:    2,
          pointerEvents: 'none',
        }}
      />
      {/* Right piece (mirrored so seam blends) */}
      <img
        src={ASSETS.floorRailing}
        alt=""
        draggable={false}
        style={{
          position:       'absolute',
          top:            25,
          right:          39,
          width:          pieceW,
          height:         railingHeight,
          objectFit:      'cover',
          objectPosition: 'right center',
          transform:      'scaleX(-1)',   // mirror so both ends look natural
          zIndex:         2,
          pointerEvents:  'none',
        }}
      />

      {/* ── Base: two images side-by-side ── */}
      {/* Left piece */}
      <img
        src={ASSETS.floorBase}
        alt=""
        draggable={false}
        style={{
          position:       'absolute',
          top:            railingHeight,
          left:           45,
          width:          pieceW,
          height:         baseHeight *1.2,
          objectFit:      'cover',
          objectPosition: 'left center',
          zIndex:         1,
          pointerEvents:  'none',
        }}
      />
      {/* Right piece */}
      <img
        src={ASSETS.floorBase}
        alt=""
        draggable={false}
        style={{
          position:       'absolute',
          top:            railingHeight,
          right:          39,
          width:          pieceW,
          height:         baseHeight*1.2,
          objectFit:      'cover',
          objectPosition: 'right center',
          transform:      'scaleX(-1)',
          zIndex:         1,
          pointerEvents:  'none',
        }}
      />

      {/* ── Left fraction tile ── */}
      <div
        style={{
          position: 'absolute',
          top:      railingHeight - Math.round(tileHeight * 0.35),
          left:     leftTileX - Math.round(tileWidth / 2),
          zIndex:   4,
        }}
      >
        <FractionFloorTile
          fraction={floor.leftFraction}
          tileState={floor.leftState}
          disabled={!isActive}
          onClick={() => onTileClick('left', floor.id)}
        />
      </div>

      {/* ── Right fraction tile ── */}
      <div
        style={{
          position: 'absolute',
          top:      railingHeight - Math.round(tileHeight * 0.35),
          left:     rightTileX - Math.round(tileWidth / 2),
          zIndex:   4,
        }}
      >
        <FractionFloorTile
          fraction={floor.rightFraction}
          tileState={floor.rightState}
          disabled={!isActive}
          onClick={() => onTileClick('right', floor.id)}
        />
      </div>
    </div>
  );
}
