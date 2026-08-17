import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

const SIZE = 400;

const T = [200, 0];
const TR = [400, 0];
const R = [400, 200];
const BR = [400, 400];
const B = [200, 400];
const BL = [0, 400];
const L = [0, 200];
const TL = [0, 0];
const P1 = [100, 100];
const P2 = [300, 300];
const P3 = [300, 100];
const P4 = [100, 300];
const C = [200, 200];

const pt = (p: number[]) => p.join(',');

const HOUSES: { n: number; shape: string; center: number[] }[] = [
  { n: 1, shape: `${pt(T)} ${pt(P3)} ${pt(C)} ${pt(P1)}`, center: [200, 110] },
  { n: 2, shape: `${pt(TR)} ${pt(T)} ${pt(P3)}`, center: [300, 33] },
  { n: 3, shape: `${pt(TR)} ${pt(P3)} ${pt(R)}`, center: [355, 100] },
  { n: 4, shape: `${pt(R)} ${pt(P2)} ${pt(C)} ${pt(P3)}`, center: [300, 200] },
  { n: 5, shape: `${pt(BR)} ${pt(R)} ${pt(P2)}`, center: [355, 300] },
  { n: 6, shape: `${pt(BR)} ${pt(P2)} ${pt(B)}`, center: [300, 367] },
  { n: 7, shape: `${pt(B)} ${pt(P4)} ${pt(C)} ${pt(P2)}`, center: [200, 290] },
  { n: 8, shape: `${pt(BL)} ${pt(B)} ${pt(P4)}`, center: [100, 367] },
  { n: 9, shape: `${pt(BL)} ${pt(P4)} ${pt(L)}`, center: [45, 300] },
  { n: 10, shape: `${pt(L)} ${pt(P1)} ${pt(C)} ${pt(P4)}`, center: [100, 200] },
  { n: 11, shape: `${pt(TL)} ${pt(L)} ${pt(P1)}`, center: [45, 100] },
  { n: 12, shape: `${pt(TL)} ${pt(T)} ${pt(P1)}`, center: [100, 33] },
];

export type KundliChartData = {
  n: number;
  sign: string;
  planets: string[];
};

const structuralLines = [
  [TL, BR],
  [TR, BL],
  [T, R],
  [R, B],
  [B, L],
  [L, T],
];

export function KundliChart({ data }: { data: KundliChartData[] }) {
  const map = Object.fromEntries(data.map((d) => [d.n, d]));
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {structuralLines.map(([a, b], i) => (
          <Line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#B09C66" strokeWidth={1.5} />
        ))}
        {HOUSES.map((h) => {
          const d = map[h.n];
          return (
            <Path
              key={h.n}
              d={`M ${h.shape} Z`}
              fill="none"
              stroke="#B09C66"
              strokeWidth={1.5}
            />
          );
        })}
        {HOUSES.map((h) => {
          const d = map[h.n];
          if (!d) return null;
          const [cx, cy] = h.center;
          return (
            <SvgText
              key={`t-${h.n}`}
              x={cx}
              y={cy - 6}
              fontSize={11}
              fill="#000000"
              fontWeight="bold"
              textAnchor="middle">
              {h.n}
            </SvgText>
          );
        })}
        {HOUSES.map((h) => {
          const d = map[h.n];
          if (!d) return null;
          const [cx, cy] = h.center;
          const row1 = d.planets.slice(0, 2).join(' ');
          const row2 = d.planets.slice(2).join(' ');
          return (
            <SvgText
              key={`p-${h.n}`}
              x={cx}
              y={cy + 14}
              fontSize={11}
              fill={h.n === 1 ? '#C9BE98' : '#333333'}
              fontWeight="600"
              textAnchor="middle">
              {row1}
            </SvgText>
          );
        })}
        {HOUSES.map((h) => {
          const d = map[h.n];
          if (!d) return null;
          const [cx, cy] = h.center;
          const row2 = d.planets.slice(2).join(' ');
          if (!row2) return null;
          return (
            <SvgText
              key={`p2-${h.n}`}
              x={cx}
              y={cy + 28}
              fontSize={11}
              fill="#333333"
              fontWeight="600"
              textAnchor="middle">
              {row2}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
});
