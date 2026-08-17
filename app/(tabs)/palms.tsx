import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { HandDetectionResult } from 'expo-vision-camera-v4-mediapipe';

declare global {
  function detectHandLandmarks(frame: unknown): HandDetectionResult | null;
}

const ACCENT = '#B09C66';
const DARK = '#2b2b2b';
const TRACE = '#C9BE98';

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

type Point = { x: number; y: number };

type Scan = {
  id: string;
  date: string;
  lines: string[];
};

const OCR_RESULTS = [
  ['Life line: strong and steady', 'Heart line: deep, emotional balance', 'Fate line: clear career path'],
  ['Life line: long with energy', 'Head line: sharp intellect', 'Sun line: creative success ahead'],
  ['Life line: short, adventurous', 'Heart line: warm relationships', 'Fate line: rising fortune'],
];

export default function PalmReadingScreen() {
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [scanIndex, setScanIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [handFound, setHandFound] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [preview, setPreview] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const cameraRef = useRef<Camera>(null);
  const stableRef = useRef(0);
  const lockedRef = useRef(false);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const addScan = () => {
    const lines = OCR_RESULTS[scanIndex % OCR_RESULTS.length];
    setResult(lines);
    setScanning(false);
    lockedRef.current = false;
    const now = new Date();
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    setScans((prev) => [{ id: String(Date.now()), date, lines }, ...prev]);
    setScanIndex((i) => i + 1);
  };

  const onFrame = Worklets.createRunOnJS((res: HandDetectionResult) => {
    const hands = res?.hands ?? [];
    if (hands.length > 0) {
      const hand = hands[0];
      setHandFound(true);
      setPoints(
        hand.map((lm) => ({ x: lm.x, y: lm.y })),
      );
      stableRef.current += 1;
      if (stableRef.current > 4 && autoMode && !lockedRef.current && !scanning) {
        lockedRef.current = true;
        stableRef.current = 0;
        capture();
      }
    } else {
      setHandFound(false);
      setPoints([]);
      stableRef.current = 0;
    }
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const result = detectHandLandmarks(frame);
      if (result) {
        onFrame(result);
      }
    },
    [onFrame],
  );

  const capture = async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    setResult(null);
    try {
      await cameraRef.current.takePhoto({ flash: flash ? 'on' : 'off' });
      setTimeout(addScan, 900);
    } catch {
      setScanning(false);
      lockedRef.current = false;
    }
  };

  const toggleAuto = () => {
    const next = !autoMode;
    setAutoMode(next);
    if (next) capture();
  };

  const renderTrace = () => {
    if (points.length !== 21 || preview.w === 0) return null;
    const joints = points.map((p) => ({ x: p.x * preview.w, y: p.y * preview.h }));
    return (
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
        {HAND_CONNECTIONS.map(([a, b], i) => (
          <Line
            key={`l${i}`}
            x1={joints[a].x}
            y1={joints[a].y}
            x2={joints[b].x}
            y2={joints[b].y}
            stroke={TRACE}
            strokeWidth={2.5}
            strokeOpacity={0.9}
          />
        ))}
        {joints.map((j, i) => (
          <Circle key={`p${i}`} cx={j.x} cy={j.y} r={3.5} fill={ACCENT} />
        ))}
      </Svg>
    );
  };

  useEffect(() => {
    if (device && !hasPermission) {
      requestPermission();
    }
  }, [device, hasPermission, requestPermission]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.title}>Palm Reading</ThemedText>
            <ThemedText style={styles.subtitle}>Uncover your destiny in your palm</ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.historyBtn, tab === 'history' && styles.historyBtnActive]}
            onPress={() => setTab(tab === 'scan' ? 'history' : 'scan')}>
            <Ionicons name={tab === 'history' ? 'camera-outline' : 'time-outline'} size={18} color="#ffffff" />
            <ThemedText style={styles.historyBtnText}>
              {tab === 'history' ? 'Scan' : 'History'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {tab === 'scan' ? (
          <View style={styles.scanner}>
            {hasPermission && device ? (
              <View
                style={styles.cameraWrap}
                onLayout={(e) => setPreview({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive
                  pixelFormat="rgb"
                  photo
                  torch={flash ? 'on' : 'off'}
                  frameProcessor={frameProcessor}
                />
                {renderTrace()}
              </View>
            ) : (
              <View style={styles.permissionBox}>
                <View style={styles.permissionIcon}>
                  <Ionicons name="hand-left" size={46} color="#ffffff" />
                </View>
                <ThemedText style={styles.permissionTitle}>Camera Access Needed</ThemedText>
                <ThemedText style={styles.permissionText}>
                  Allow camera access to scan your palm and reveal your reading
                </ThemedText>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Ionicons name="camera" size={18} color="#ffffff" />
                  <ThemedText style={styles.permissionBtnText}>Allow Camera</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.flashBtn, flash && styles.flashBtnActive]}
              onPress={() => setFlash((f) => !f)}>
              <Ionicons name={flash ? 'flash' : 'flash-off'} size={20} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.guideCard}>
              <View style={styles.guideFrame}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
                <View
                  style={[
                    styles.guideCircle,
                    handFound && styles.guideCircleActive,
                  ]}>
                  <Ionicons
                    name={handFound ? 'hand-left' : 'hand-left-outline'}
                    size={54}
                    color={handFound ? TRACE : 'rgba(255,255,255,0.95)'}
                  />
                </View>
              </View>
              <ThemedText style={styles.guideText}>
                {scanning
                  ? 'Analyzing your palm...'
                  : handFound
                    ? 'Palm detected — tracing lines'
                    : 'Place your palm inside the frame'}
              </ThemedText>
              {autoMode && !scanning && (
                <ThemedText style={styles.guideHint}>
                  {handFound ? 'Auto-capturing now...' : 'Auto-scan is on — keep palm steady'}
                </ThemedText>
              )}
            </View>

            {result && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="sparkles" size={16} color={ACCENT} />
                  <ThemedText style={styles.resultTitle}>Your Palm Analysis</ThemedText>
                </View>
                {result.map((line, i) => (
                  <View key={i} style={styles.resultRow}>
                    <View style={styles.checkDot}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                    <ThemedText style={styles.resultText}>{line}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.bottom}>
              <TouchableOpacity
                style={[styles.scanBtn, scanning && styles.scanBtnBusy]}
                onPress={toggleAuto}>
                <Ionicons
                  name={autoMode ? 'pause' : 'play'}
                  size={22}
                  color="#ffffff"
                />
                <ThemedText style={styles.scanBtnText}>
                  {autoMode ? 'Auto Scan ON' : 'Start Scan'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyContent}>
            {scans.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="time-outline" size={38} color={ACCENT} />
                </View>
                <ThemedText style={styles.emptyText}>No scans yet</ThemedText>
                <ThemedText style={styles.emptySub}>
                  Scan your palm to build your reading history
                </ThemedText>
              </View>
            ) : (
              scans.map((s) => (
                <View key={s.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="hand-left" size={16} color="#ffffff" />
                    </View>
                    <ThemedText style={styles.historyDate}>{s.date}</ThemedText>
                  </View>
                  {s.lines.map((line, i) => (
                    <View key={i} style={styles.historyLineRow}>
                      <View style={styles.historyDot} />
                      <ThemedText style={styles.historyLine}>{line}</ThemedText>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#EEEDE0' },
  subtitle: { fontSize: 12, color: '#7E7E78', marginTop: 2 },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  historyBtnActive: { backgroundColor: '#97743B' },
  historyBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  scanner: { flex: 1, backgroundColor: DARK, overflow: 'hidden' },
  cameraWrap: { flex: 1 },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  permissionIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  permissionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  permissionText: {
    fontSize: 13,
    color: '#7E7E78',
    textAlign: 'center',
    lineHeight: 19,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  permissionBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  flashBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    zIndex: 5,
  },
  flashBtnActive: { backgroundColor: ACCENT },
  guideCard: {
    position: 'absolute',
    top: '26%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  guideFrame: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#97743B',
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  guideCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCircleActive: {
    borderColor: TRACE,
    borderWidth: 2,
    backgroundColor: 'rgba(201,190,152,0.18)',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 18,
  },
  guideHint: { color: '#97743B', fontSize: 12, marginTop: 6 },
  resultCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 180,
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    padding: 16,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  resultTitle: { fontSize: 15, fontWeight: 'bold', color: '#EEEDE0' },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { flex: 1, fontSize: 13, color: '#7E7E78', lineHeight: 18 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  scanBtnBusy: { opacity: 0.85 },
  scanBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  historyContent: { padding: 16, paddingBottom: 130 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1D1D1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#EEEDE0' },
  emptySub: { fontSize: 13, color: '#7E7E78' },
  historyCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: { fontSize: 14, fontWeight: '600', color: '#EEEDE0' },
  historyLineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  historyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },
  historyLine: { flex: 1, fontSize: 14, color: '#7E7E78' },
});