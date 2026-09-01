/**
 * VECTOR AVATAR GENERATOR
 * -----------------------
 * Generates unique deterministic vector face avatars from a name.
 * Pure React Native — no SVG dependency needed.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';

type Props = {
  name: string;
  size?: number;
  style?: ViewStyle;
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const BG = ['#6C5CE7','#E84393','#00B894','#FDCB6E','#0984E3','#D63031','#A29BFE','#55E6C1','#FF7979','#7ED6DF'];
const SKIN = ['#F5CBA7','#FAD7A0','#EDBB99','#E0C8A8','#D5C4A1'];
const HAIR_COLORS = ['#2C3E50','#6B4226','#1B1464','#8B4513','#4A235A','#784212'];
const HAIR_STYLES = ['short','long','bald','spiky'];

export function VectorAvatar({ name, size = 44, style }: Props) {
  const h = hashStr(name);
  const bg = BG[h % BG.length];
  const skin = SKIN[h >> 3 % SKIN.length];
  const hairColor = HAIR_COLORS[h >> 6 % HAIR_COLORS.length];
  const hairStyle = HAIR_STYLES[h >> 9 % HAIR_STYLES.length];
  const hasGlasses = h % 5 === 0;
  const hasBeard = h % 7 === 0;
  const eyeType = h % 3; // 0=round, 1=almond, 2=wide
  const mouthType = h % 4; // 0=smile, 1=neutral, 2=open, 3=grin

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const faceR = s * 0.42;
  const eyeR = s * 0.055;
  const eyeY = cy - s * 0.04;
  const eyeSpacing = s * 0.14;
  const mouthY = cy + s * 0.14;

  return (
    <View style={[{ width: s, height: s, borderRadius: s / 2, backgroundColor: bg, overflow: 'hidden' }, style]}>
      {/* Face */}
      <View
        style={{
          position: 'absolute',
          left: cx - faceR,
          top: cy - faceR + s * 0.02,
          width: faceR * 2,
          height: faceR * 2,
          borderRadius: faceR,
          backgroundColor: skin,
        }}
      />
      {/* Hair */}
      {hairStyle === 'short' && (
        <View
          style={{
            position: 'absolute',
            left: cx - faceR - s * 0.01,
            top: cy - faceR - s * 0.08,
            width: faceR * 2 + s * 0.02,
            height: faceR * 1.2,
            borderRadius: faceR,
            backgroundColor: hairColor,
          }}
        />
      )}
      {hairStyle === 'long' && (
        <>
          <View
            style={{
              position: 'absolute',
              left: cx - faceR - s * 0.03,
              top: cy - faceR - s * 0.08,
              width: faceR * 2 + s * 0.06,
              height: faceR * 1.3,
              borderRadius: faceR,
              backgroundColor: hairColor,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: cx - faceR - s * 0.08,
              top: cy - s * 0.06,
              width: s * 0.12,
              height: s * 0.36,
              borderRadius: s * 0.06,
              backgroundColor: hairColor,
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: cx - faceR - s * 0.08,
              top: cy - s * 0.06,
              width: s * 0.12,
              height: s * 0.36,
              borderRadius: s * 0.06,
              backgroundColor: hairColor,
            }}
          />
        </>
      )}
      {hairStyle === 'spiky' && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: cx - faceR + (i * faceR * 2) / 4 - s * 0.04,
                top: cy - faceR - s * 0.14 - (i % 2) * s * 0.05,
                width: s * 0.1,
                height: s * 0.18,
                borderRadius: s * 0.05,
                backgroundColor: hairColor,
                transform: [{ rotate: `${-20 + i * 10}deg` }],
              }}
            />
          ))}
        </>
      )}
      {/* Eyes */}
      {eyeType === 0 && (
        <>
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR, top: eyeY - eyeR, width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 0.5, top: eyeY - eyeR * 0.5, width: eyeR, height: eyeR, borderRadius: eyeR * 0.5, backgroundColor: '#2C3E50' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR, top: eyeY - eyeR, width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 0.5, top: eyeY - eyeR * 0.5, width: eyeR, height: eyeR, borderRadius: eyeR * 0.5, backgroundColor: '#2C3E50' }} />
        </>
      )}
      {eyeType === 1 && (
        <>
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 1.5, top: eyeY - eyeR * 0.8, width: eyeR * 3, height: eyeR * 1.6, borderRadius: eyeR, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 0.5, top: eyeY - eyeR * 0.5, width: eyeR, height: eyeR, borderRadius: eyeR * 0.5, backgroundColor: '#2C3E50' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 1.5, top: eyeY - eyeR * 0.8, width: eyeR * 3, height: eyeR * 1.6, borderRadius: eyeR, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 0.5, top: eyeY - eyeR * 0.5, width: eyeR, height: eyeR, borderRadius: eyeR * 0.5, backgroundColor: '#2C3E50' }} />
        </>
      )}
      {eyeType === 2 && (
        <>
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 2, top: eyeY - eyeR * 1.5, width: eyeR * 4, height: eyeR * 3, borderRadius: eyeR * 1.5, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 0.6, top: eyeY - eyeR * 0.6, width: eyeR * 1.2, height: eyeR * 1.2, borderRadius: eyeR * 0.6, backgroundColor: '#2C3E50' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 2, top: eyeY - eyeR * 1.5, width: eyeR * 4, height: eyeR * 3, borderRadius: eyeR * 1.5, backgroundColor: '#fff' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 0.6, top: eyeY - eyeR * 0.6, width: eyeR * 1.2, height: eyeR * 1.2, borderRadius: eyeR * 0.6, backgroundColor: '#2C3E50' }} />
        </>
      )}
      {/* Glasses */}
      {hasGlasses && (
        <>
          <View style={{ position: 'absolute', left: cx - eyeSpacing - eyeR * 2.5, top: eyeY - eyeR * 2, width: eyeR * 5, height: eyeR * 4, borderRadius: eyeR * 2, borderWidth: s * 0.02, borderColor: '#2C3E50', backgroundColor: 'transparent' }} />
          <View style={{ position: 'absolute', left: cx + eyeSpacing - eyeR * 2.5, top: eyeY - eyeR * 2, width: eyeR * 5, height: eyeR * 4, borderRadius: eyeR * 2, borderWidth: s * 0.02, borderColor: '#2C3E50', backgroundColor: 'transparent' }} />
        </>
      )}
      {/* Nose */}
      <View style={{ position: 'absolute', left: cx - s * 0.02, top: cy + s * 0.02, width: s * 0.04, height: s * 0.06, borderRadius: s * 0.02, backgroundColor: `${skin}cc` }} />
      {/* Mouth */}
      {mouthType === 0 && (
        <View style={{ position: 'absolute', left: cx - s * 0.1, top: mouthY, width: s * 0.2, height: s * 0.08, borderBottomLeftRadius: s * 0.1, borderBottomRightRadius: s * 0.1, backgroundColor: '#C0392B' }} />
      )}
      {mouthType === 1 && (
        <View style={{ position: 'absolute', left: cx - s * 0.07, top: mouthY + s * 0.02, width: s * 0.14, height: s * 0.025, borderRadius: s * 0.012, backgroundColor: '#C0392B' }} />
      )}
      {mouthType === 2 && (
        <View style={{ position: 'absolute', left: cx - s * 0.06, top: mouthY, width: s * 0.12, height: s * 0.1, borderRadius: s * 0.06, backgroundColor: '#C0392B' }} />
      )}
      {mouthType === 3 && (
        <View style={{ position: 'absolute', left: cx - s * 0.11, top: mouthY, width: s * 0.22, height: s * 0.09, borderBottomLeftRadius: s * 0.11, borderBottomRightRadius: s * 0.11, borderTopLeftRadius: s * 0.04, borderTopRightRadius: s * 0.04, backgroundColor: '#C0392B' }} />
      )}
      {/* Beard */}
      {hasBeard && (
        <View
          style={{
            position: 'absolute',
            left: cx - faceR * 0.8,
            top: cy + s * 0.08,
            width: faceR * 1.6,
            height: faceR * 1.2,
            borderBottomLeftRadius: faceR,
            borderBottomRightRadius: faceR,
            backgroundColor: hairColor,
            opacity: 0.7,
          }}
        />
      )}
    </View>
  );
}
