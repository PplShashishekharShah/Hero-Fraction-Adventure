import { ASSETS } from '../constants/assets';

/**
 * FractionPlate — bigger plate sprite with fraction overlay.
 */
export default function FractionPlate({ n, d }) {
  return (
    <div style={{ position: 'relative', width: 144, height: 94, flexShrink: 0 }}>
      <img
        src={ASSETS.plate}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
      />
      <div
        style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          lineHeight:     1,
        }}
      >
        <span
          style={{
            fontSize:   17,
            fontWeight: 800,
            color:      '#e0f4ff',
            textShadow: '0 1px 4px #000c',
          }}
        >
          {n}
        </span>
        <div
          style={{
            width:      26,
            height:     2,
            background: '#7ee8ff',
            margin:     '0',
          }}
        />
        <span
          style={{
            fontSize:   17,
            fontWeight: 800,
            color:      '#e0f4ff',
            textShadow: '0 1px 4px #000c',
          }}
        >
          {d}
        </span>
      </div>
    </div>
  );
}
