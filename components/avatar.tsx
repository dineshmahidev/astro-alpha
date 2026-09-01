/**
 * AVATAR COMPONENT
 * ----------------
 * Shows image with automatic fallback to initials-based vector avatar.
 * No external dependencies needed.
 */

import React, { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = {
  uri?: string;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

function getInitials(name: string): string {
  const parts = name.replace(/^(Pt\.|Astro|Guru|Pandit)\s*/i, '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

const PALETTE = [
  '#6C5CE7', '#E84393', '#00B894', '#FDCB6E', '#0984E3',
  '#D63031', '#A29BFE', '#55A3E8', '#FF7675', '#74B9FF',
];

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function Avatar({ uri, name, size = 44, color, style }: Props) {
  const [failed, setFailed] = useState(false);
  const bg = color ?? hashColor(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  if (uri && !failed) {
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: bg }, style]}>
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <ThemedText style={{ color: '#fff', fontSize, fontWeight: 'bold' }}>{initials}</ThemedText>
    </View>
  );
}
