export const DEG = Math.PI / 180;

export function normalize360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function normalize180(deg: number): number {
  return normalize360(deg + 180) - 180;
}

export function sinD(deg: number): number {
  return Math.sin(deg * DEG);
}

export function cosD(deg: number): number {
  return Math.cos(deg * DEG);
}

export function atan2D(y: number, x: number): number {
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function tanD(deg: number): number {
  return Math.tan(deg * DEG);
}

export function asinD(v: number): number {
  return (Math.asin(Math.min(1, Math.max(-1, v))) * 180) / Math.PI;
}

export function acosD(v: number): number {
  return (Math.acos(Math.min(1, Math.max(-1, v))) * 180) / Math.PI;
}