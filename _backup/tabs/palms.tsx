import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/auth-context';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  VisionCameraProxy,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { HandDetectionResult } from 'expo-vision-camera-v4-mediapipe';
import { uiStrings } from '@/constants/ui-strings';
import { callAIWithFallback, type ChatMessage } from '@/lib/ai/providers';
import { palmChatResponse } from '@/lib/palm/chat';
import {
  generatePalmReading,
  type PalmPoint,
  type PalmReading,
} from '@/lib/palm/reading';
import { fs, lh } from '@/lib/utils/text-size';

const handLandmarker = VisionCameraProxy.initFrameProcessorPlugin('handLandmarker', {});

const ACCENT = '#B09C66';
const BACKGROUND_IMAGE = require('@/assets/images/background.png');
const STORE_KEY = 'palm:history';
const ONBOARD_KEY = 'palm:onboarding_done';
const CHAT_STORE_KEY = 'palm:chat-history';

type Point = PalmPoint;
type Scan = {
  id: string;
  date: string;
  time: string;
  reading: PalmReading;
  imageUri?: string;
  hand?: 'left' | 'right' | 'both';
  rightReading?: PalmReading;
  leftReading?: PalmReading;
};
type ChatMsg = { role: 'user' | 'assistant'; text: string };

/** State machine for two-hand capture flow */
type CapturePhase =
  | 'onboarding'    // first-time tutorial overlay
  | 'idle'          // ready to start
  | 'capture_right' // camera active, capturing right hand
  | 'capture_left'  // camera active, capturing left hand
  | 'analyzing'     // both captured, building AI analysis
  | 'result';       // results ready, chat mode

const SUGGESTIONS: Record<string, string[]> = {
  en: [
    'What does my life line mean?',
    'Tell me about my career prospects',
    'How is my love life?',
    'What are my strengths and weaknesses?',
    'Will I have good health this year?',
    'What does my fate line indicate?',
  ],
  ta: [
    'என் உயிர்க் கோடு என்ன சொல்கிறது?',
    'என் தொழில் வாய்ப்புகள் பற்றி சொல்லுங்கள்',
    'என் காதல் வாழ்வு எப்படி?',
    'என் பலங்கள் மற்றும் பலவீனங்கள் என்ன?',
    'இந்த ஆண்டு நல்ல ஆரோக்கியம் இருக்குமா?',
    'என் விதி கோடு என்ன காட்டுகிறது?',
  ],
  hi: [
    'मेरी जीवन रेखा का क्या मतलब है?',
    'मेरे करियर के अवसरों के बारे में बताएं',
    'मेरी प्रेम जीवन कैसा है?',
    'मेरी ताकतें और कमजोरियाँ क्या हैं?',
    'क्या इस साल मेरा स्वास्थ्य अच्छा रहेगा?',
    'मेरी भाग्य रेखा क्या दर्शाती है?',
  ],
};

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function syntheticLandmarks(uri: string): PalmPoint[] {
  const seed = hashString(uri);
  const s = (n: number) => ((seed * 2654435761 + n * 3266489917) >>> 0) / 4294967296;
  return [
    { x: 0.50, y: 0.95 }, { x: 0.38 + s(1) * 0.04, y: 0.85 + s(2) * 0.03 },
    { x: 0.32 + s(3) * 0.03, y: 0.75 + s(4) * 0.03 }, { x: 0.30 + s(5) * 0.03, y: 0.65 + s(6) * 0.03 },
    { x: 0.28 + s(7) * 0.03, y: 0.55 + s(8) * 0.03 }, { x: 0.55 + s(9) * 0.04, y: 0.60 + s(10) * 0.02 },
    { x: 0.58 + s(11) * 0.03, y: 0.48 + s(12) * 0.02 }, { x: 0.60 + s(13) * 0.03, y: 0.38 + s(14) * 0.02 },
    { x: 0.61 + s(15) * 0.03, y: 0.28 + s(16) * 0.02 }, { x: 0.50, y: 0.58 + s(17) * 0.02 },
    { x: 0.50 + s(18) * 0.02, y: 0.45 + s(19) * 0.02 }, { x: 0.50 + s(20) * 0.02, y: 0.34 + s(21) * 0.02 },
    { x: 0.50 + s(22) * 0.02, y: 0.24 + s(23) * 0.02 }, { x: 0.62 + s(24) * 0.04, y: 0.60 + s(25) * 0.02 },
    { x: 0.66 + s(26) * 0.03, y: 0.48 + s(27) * 0.02 }, { x: 0.68 + s(28) * 0.03, y: 0.38 + s(29) * 0.02 },
    { x: 0.70 + s(30) * 0.03, y: 0.28 + s(31) * 0.02 }, { x: 0.70 + s(32) * 0.04, y: 0.58 + s(33) * 0.03 },
    { x: 0.76 + s(34) * 0.03, y: 0.48 + s(35) * 0.02 }, { x: 0.79 + s(36) * 0.03, y: 0.40 + s(37) * 0.02 },
    { x: 0.81 + s(38) * 0.03, y: 0.32 + s(39) * 0.02 },
  ];
}

/** Build combined reading text for AI system prompt */
function buildCombinedReadingText(
  right: PalmReading | null,
  left: PalmReading | null,
  lang: string,
): string {
  const parts: string[] = [];
  if (right) {
    const handLabel = lang === 'ta' ? 'வலது கை (முயற்சி)' : lang === 'hi' ? 'दाहिना हाथ (प्रयास)' : 'Right Hand (Effort / Karma)';
    parts.push(`[${handLabel}]\nSummary: ${right.summary}\nLines: ${right.lines.join('; ')}\nTraits: ${right.traits.join(', ')}`);
  }
  if (left) {
    const handLabel = lang === 'ta' ? 'இடது கை (விதி)' : lang === 'hi' ? 'बायां हाथ (भाग्य)' : 'Left Hand (Destiny / Sanchita)';
    parts.push(`[${handLabel}]\nSummary: ${left.summary}\nLines: ${left.lines.join('; ')}\nTraits: ${left.traits.join(', ')}`);
  }
  return parts.join('\n\n');
}

export default function PalmReadingScreen() {
  const { language } = useAuth();
  const t = uiStrings(language);

  /* ── Core state ── */
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const [phase, setPhase] = useState<CapturePhase>('idle');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  /* ── Two-hand readings ── */
  const [rightReading, setRightReading] = useState<PalmReading | null>(null);
  const [leftReading, setLeftReading] = useState<PalmReading | null>(null);
  const [rightImageUri, setRightImageUri] = useState<string | undefined>();
  const [leftImageUri, setLeftImageUri] = useState<string | undefined>();

  /* ── Combined result ── */
  const [reading, setReading] = useState<PalmReading | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);

  /* ── AI chat ── */
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(() => String(Date.now()));

  /* ── Camera refs ── */
  const cameraRef = useRef<Camera>(null);
  const pointsRef = useRef<Point[]>([]);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  /* ── Load persisted data ── */
  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((raw) => { if (raw) setScans(JSON.parse(raw)); });
    AsyncStorage.getItem(ONBOARD_KEY).then((done) => {
      if (!done) setPhase('onboarding');
    });
    AsyncStorage.getItem(`${CHAT_STORE_KEY}:${sessionId}`).then((raw) => {
      if (raw) setChatMessages(JSON.parse(raw));
    });
  }, []);

  useEffect(() => { AsyncStorage.setItem(STORE_KEY, JSON.stringify(scans)); }, [scans]);
  useEffect(() => {
    if (chatMessages.length > 0) {
      AsyncStorage.setItem(`${CHAT_STORE_KEY}:${sessionId}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, sessionId]);

  /* ── Camera frame processor ── */
  const onFrame = Worklets.createRunOnJS((res: HandDetectionResult) => {
    const hands = res?.hands ?? [];
    if (hands.length > 0) {
      pointsRef.current = hands[0].map((lm) => ({ x: lm.x, y: lm.y }));
    } else {
      pointsRef.current = [];
    }
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const result = handLandmarker?.call(frame, {});
    if (result) onFrame(result as unknown as HandDetectionResult);
  }, [onFrame]);

  /* ── Capture right hand ── */
  const captureRightHand = useCallback(async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    try {
      await cameraRef.current.takePhoto({ flash: flash ? 'on' : 'off' });
      setTimeout(() => {
        if (pointsRef.current.length === 21) {
          const result = generatePalmReading(pointsRef.current, language);
          if (result) {
            setRightReading(result);
            setScanning(false);
            // Move to left hand
            Alert.alert(
              language === 'ta' ? 'வலது கை பிடிக்கப்பட்டது' : language === 'hi' ? 'दाहिना हाथ कैप्चर हो गया' : 'Right Hand Captured',
              language === 'ta' ? 'இப்போது இடது கையை காட்டுங்கள்' : language === 'hi' ? 'अब बायां हाथ दिखाएं' : 'Now show your left hand',
              [{ text: 'OK', onPress: () => setPhase('capture_left') }],
            );
          } else {
            Alert.alert(t['palm.noHand'], '');
            setScanning(false);
          }
        } else {
          Alert.alert(t['palm.noHand'], '');
          setScanning(false);
        }
      }, 500);
    } catch { setScanning(false); }
  }, [scanning, flash, language, t]);

  /* ── Capture left hand ── */
  const captureLeftHand = useCallback(async () => {
    if (scanning || !cameraRef.current) return;
    setScanning(true);
    try {
      await cameraRef.current.takePhoto({ flash: flash ? 'on' : 'off' });
      setTimeout(() => {
        if (pointsRef.current.length === 21) {
          const result = generatePalmReading(pointsRef.current, language);
          if (result) {
            setLeftReading(result);
            setScanning(false);
            setPhase('analyzing');
          } else {
            Alert.alert(t['palm.noHand'], '');
            setScanning(false);
          }
        } else {
          Alert.alert(t['palm.noHand'], '');
          setScanning(false);
        }
      }, 500);
    } catch { setScanning(false); }
  }, [scanning, flash, language, t]);

  /* ── Save combined scan ── */
  useEffect(() => {
    if (phase !== 'analyzing') return;
    if (!rightReading) return;

    const now = new Date();
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Build combined reading (use right as primary, merge left traits)
    const combined: PalmReading = {
      summary: rightReading.summary + (leftReading ? `\n\n${leftReading.summary}` : ''),
      lines: [...rightReading.lines, ...(leftReading?.lines ?? [])],
      traits: [...new Set([...rightReading.traits, ...(leftReading?.traits ?? [])])],
      metrics: rightReading.metrics,
      lang: language,
    };

    setReading(combined);
    setScans((prev) => [{
      id: String(Date.now()),
      date,
      time,
      reading: combined,
      rightReading,
      leftReading: leftReading ?? undefined,
      hand: 'both',
    }, ...prev]);

    // Build AI system context and send initial analysis
    const combinedText = buildCombinedReadingText(rightReading, leftReading, language);
    const langInstruction = language === 'ta'
      ? 'தமிழில் பதிலளிக்கவும்.'
      : language === 'hi'
        ? 'हिंदी में उत्तर दें।'
        : 'Reply in English.';

    const systemPrompt = [
      `You are an expert Vedic palmist analyzing both hands of a person.`,
      `The RIGHT hand represents effort/karma (what the person actively does).`,
      `The LEFT hand represents destiny/sanchita (what is inherited/destined).`,
      `Analyze both hands together and provide holistic insights.`,
      langInstruction,
      `Here is the palm reading data:\n\n${combinedText}`,
      `Keep answers concise (3-5 sentences). Ask one follow-up question when relevant.`,
      `Use warm, mystical, spiritual tone. Reference Vedic concepts.`,
    ].join(' ');

    const welcomeMsg: ChatMsg = {
      role: 'assistant',
      text: language === 'ta'
        ? `🙏 வணக்கம்! நான் உங்கள் கைரேகை நிபுணர். உங்கள் வலது மற்றும் இடது கை இரண்டையும் பகுப்பாய்வு செய்துள்ளேன். உங்கள் வாழ்வு, தொழில், காதல், ஆரோக்கியம் பற்றி எதுவும் கேளுங்கள்!`
        : language === 'hi'
          ? `🙏 नमस्ते! मैं आपका हस्तरेखा विशेषज्ञ हूँ। मैंने आपके दाहिने और बाएँ दोनों हाथों का विश्लेषण किया है। अपने जीवन, करियर, प्रेम, स्वास्थ्य के बारे में कुछ भी पूछें!`
          : `🙏 Hello! I'm your palm reading expert. I've analyzed both your right and left hands. Ask me anything about your life, career, love, health!`,
    };

    setChatMessages([welcomeMsg]);
    setPhase('result');
  }, [phase, rightReading, leftReading, language]);

  /* ── AI chat send ── */
  const sendChat = useCallback(async (text: string) => {
    if (!text.trim() || !rightReading) {
      console.log('[PalmChat] sendChat blocked:', { text: text.trim(), hasReading: !!rightReading });
      return;
    }
    const question = text.trim();
    const userMsg: ChatMsg = { role: 'user', text: question };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setTyping(true);

    const langInstruction = language === 'ta'
      ? 'தமிழில் பதிலளிக்கவும்.'
      : language === 'hi'
        ? 'हिंदी में उत्तर दें।'
        : 'Reply in English.';

    const combinedText = buildCombinedReadingText(rightReading, leftReading, language);
    const systemPrompt = [
      `You are an expert Vedic palmist analyzing both hands of a person.`,
      `RIGHT hand = effort/karma. LEFT hand = destiny/sanchita.`,
      langInstruction,
      `Palm data:\n${combinedText}`,
      `Keep answers concise (3-5 sentences). Warm, mystical, spiritual tone.`,
    ].join(' ');

    try {
      const history = chatMessages
        .filter((m) => !m.text.includes("I'm your palm"))
        .map((m): ChatMessage => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: question },
      ];

      console.log('[PalmChat] Trying free AI providers...');
      const result = await callAIWithFallback(messages);

      if (result) {
        console.log(`[PalmChat] Reply from ${result.provider}:`, result.content.slice(0, 100));
        setChatMessages((prev) => [...prev, { role: 'assistant', text: result.content }]);
      } else {
        // Fallback to local engine
        const localReply = palmChatResponse([...chatMessages, userMsg], {
          summary: rightReading.summary + (leftReading ? `\n\n${leftReading.summary}` : ''),
          lines: [...rightReading.lines, ...(leftReading?.lines ?? [])],
          traits: [...new Set([...rightReading.traits, ...(leftReading?.traits ?? [])])],
          metrics: rightReading.metrics,
          lang: language,
        }, language);
        setChatMessages((prev) => [...prev, { role: 'assistant', text: localReply }]);
      }
    } catch (e) {
      console.log('[PalmChat] Error:', e);
      // Fallback to local engine on error
      const localReply = palmChatResponse([...chatMessages, userMsg], {
        summary: rightReading.summary + (leftReading ? `\n\n${leftReading.summary}` : ''),
        lines: [...rightReading.lines, ...(leftReading?.lines ?? [])],
        traits: [...new Set([...rightReading.traits, ...(leftReading?.traits ?? [])])],
        metrics: rightReading.metrics,
        lang: language,
      }, language);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: localReply }]);
    } finally {
      setTyping(false);
    }
  }, [chatMessages, rightReading, leftReading, language]);

  /* ── Pick image (gallery) ── */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled || !res.assets?.[0]) return;
    setScanning(true);
    setTimeout(() => {
      const pts = syntheticLandmarks(res.assets![0].uri);
      const result = generatePalmReading(pts, language);
      if (result) {
        if (phase === 'capture_right' || (!rightReading && !leftReading)) {
          setRightReading(result);
          setRightImageUri(res.assets![0].uri);
          Alert.alert(
            language === 'ta' ? 'வலது கை பிடிக்கப்பட்டது' : language === 'hi' ? 'दाहिना हाथ कैप्चर हो गया' : 'Right Hand Captured',
            language === 'ta' ? 'இப்போது இடது கையை காட்டுங்கள்' : language === 'hi' ? 'अब बायां हाथ दिखाएं' : 'Now show your left hand',
            [{ text: 'OK', onPress: () => setPhase('capture_left') }],
          );
        } else {
          setLeftReading(result);
          setLeftImageUri(res.assets![0].uri);
          setPhase('analyzing');
        }
      } else {
        Alert.alert(t['palm.noHand'], '');
      }
      setScanning(false);
    }, 300);
  };

  /* ── Delete scan ── */
  const deleteScan = useCallback((id: string) => {
    Alert.alert('Delete', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setScans((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  }, []);

  /* ── Start capture flow ── */
  const startCapture = () => {
    setRightReading(null);
    setLeftReading(null);
    setRightImageUri(undefined);
    setLeftImageUri(undefined);
    setChatMessages([]);
    setPhase('capture_right');
  };

  useEffect(() => { if (device && !hasPermission) requestPermission(); }, [device, hasPermission, requestPermission]);

  const isActive = phase === 'capture_right' || phase === 'capture_left';

  return (
    <ThemedView style={styles.screen}>
      <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} imageStyle={styles.bgImg} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <ThemedText style={[styles.title, { fontSize: fs(language, 22) }]}>{t['palm.title']}</ThemedText>
          <View style={styles.headerBtns}>
            {phase === 'result' && (
              <TouchableOpacity style={styles.newScanBtn} onPress={startCapture}>
                <Ionicons name="camera" size={14} color="#fff" />
                <ThemedText style={styles.newScanBtnTxt}>New</ThemedText>
              </TouchableOpacity>
            )}
            {!isActive && (
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => setTab(tab === 'scan' ? 'history' : 'scan')}>
                <Ionicons name={tab === 'history' ? 'camera-outline' : 'time-outline'} size={16} color="#fff" />
                <ThemedText style={styles.historyBtnTxt}>{tab === 'history' ? 'Scan' : `${t['match.history']} (${scans.length})`}</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Phase: Onboarding ── */}
        {phase === 'onboarding' && (
          <View style={styles.onboardContainer}>
            <View style={styles.onboardCard}>
              <Ionicons name="hand-left" size={56} color={ACCENT} />
              <ThemedText style={[styles.onboardTitle, { fontSize: fs(language, 20) }]}>
                {language === 'ta' ? 'கைரேகை பகுப்பாய்வு' : language === 'hi' ? 'हस्तरेखा विश्लेषण' : 'Palm Reading Analysis'}
              </ThemedText>
              <ThemedText style={[styles.onboardDesc, { fontSize: fs(language, 13) }]}>
                {language === 'ta'
                  ? 'உங்கள் வலது மற்றும் இடது கை இரண்டையும் ஸ்கேன் செய்து, ஆழமான பகுப்பாய்வைப் பெறுங்கள்.'
                  : language === 'hi'
                    ? 'अपने दाहिने और बाएँ दोनों हाथों को स्कैन करें और गहन विश्लेषण प्राप्त करें।'
                    : 'Scan both your right and left hands to get a deep, personalized analysis.'}
              </ThemedText>

              <View style={styles.onboardSteps}>
                <View style={styles.onboardStep}>
                  <View style={styles.onboardStepNum}><ThemedText style={styles.onboardStepNumTxt}>1</ThemedText></View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.onboardStepTitle, { fontSize: fs(language, 14) }]}>
                      {language === 'ta' ? 'வலது கை' : language === 'hi' ? 'दाहिना हाथ' : 'Right Hand'}
                    </ThemedText>
                    <ThemedText style={[styles.onboardStepDesc, { fontSize: fs(language, 11) }]}>
                      {language === 'ta' ? 'உங்கள் முயற்சி & செயல்கள்' : language === 'hi' ? 'आपके प्रयास और कर्म' : 'Your effort & karma'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.onboardHandEmoji}>🖐️</ThemedText>
                </View>

                <View style={styles.onboardArrow}>
                  <Ionicons name="arrow-down" size={18} color={ACCENT} />
                </View>

                <View style={styles.onboardStep}>
                  <View style={styles.onboardStepNum}><ThemedText style={styles.onboardStepNumTxt}>2</ThemedText></View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.onboardStepTitle, { fontSize: fs(language, 14) }]}>
                      {language === 'ta' ? 'இடது கை' : language === 'hi' ? 'बायां हाथ' : 'Left Hand'}
                    </ThemedText>
                    <ThemedText style={[styles.onboardStepDesc, { fontSize: fs(language, 11) }]}>
                      {language === 'ta' ? 'உங்கள் விதி & பாரம்பரியம்' : language === 'hi' ? 'आपका भाग्य और विरासत' : 'Your destiny & inheritance'}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.onboardHandEmoji}>✋</ThemedText>
                </View>
              </View>

              <TouchableOpacity style={styles.onboardBtn} onPress={() => {
                AsyncStorage.setItem(ONBOARD_KEY, 'done');
                setPhase('idle');
              }}>
                <ThemedText style={styles.onboardBtnTxt}>
                  {language === 'ta' ? 'தொடங்குங்கள்' : language === 'hi' ? 'शुरू करें' : 'Get Started'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Phase: Idle (ready to start) ── */}
        {phase === 'idle' && (
          <View style={styles.idleContainer}>
            <View style={styles.idleCard}>
              <Ionicons name="sparkles" size={44} color={ACCENT} />
              <ThemedText style={[styles.idleTitle, { fontSize: fs(language, 18) }]}>
                {language === 'ta' ? 'கைரேகை பலன் பெறுங்கள்' : language === 'hi' ? 'हस्तरेखा पढ़ें' : 'Ready for Your Reading?'}
              </ThemedText>
              <ThemedText style={[styles.idleDesc, { fontSize: fs(language, 12) }]}>
                {language === 'ta'
                  ? 'வலது கையில் இருந்து தொடங்கி, இரண்டு கைகளையும் ஸ்கேன் செய்வோம்.'
                  : language === 'hi'
                    ? 'दाहिने हाथ से शुरू करके दोनों हाथों को स्कैन करेंगे।'
                    : "We'll scan both hands, starting with your right hand."}
              </ThemedText>
              <TouchableOpacity style={styles.startBtn} onPress={startCapture}>
                <Ionicons name="camera" size={20} color="#fff" />
                <ThemedText style={styles.startBtnTxt}>
                  {language === 'ta' ? 'ஸ்கேன் தொடங்கு' : language === 'hi' ? 'स्कैन शुरू करें' : 'Start Scanning'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Phase: Capture (camera active) ── */}
        {isActive && (
          <ScrollView style={styles.captureScroll} contentContainerStyle={styles.captureScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.instructionBanner}>
              <View style={styles.instructionDot} />
              <ThemedText style={[styles.instructionText, { fontSize: fs(language, 13) }]} numberOfLines={1}>
                {phase === 'capture_right'
                  ? (language === 'ta' ? 'வலது கையை கேமராவில் காட்டுங்கள்' : language === 'hi' ? 'दाहिना हाथ कैमरे में दिखाएं' : 'Show your RIGHT hand to the camera')
                  : (language === 'ta' ? 'இடது கையை கேமராவில் காட்டுங்கள்' : language === 'hi' ? 'बायां हाथ कैमरे में दिखाएं' : 'Show your LEFT hand to the camera')}
              </ThemedText>
              <View style={styles.phaseIndicator}>
                <View style={[styles.phaseDot, phase === 'capture_right' && styles.phaseDotActive]} />
                <View style={[styles.phaseDot, phase === 'capture_left' && styles.phaseDotActive]} />
              </View>
            </View>

            {hasPermission && device && !cameraError ? (
              <View style={styles.cameraWrap}>
                <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive pixelFormat="rgb" photo torch={flash ? 'on' : 'off'} frameProcessor={frameProcessor} onError={(e) => setCameraError(e.message)} />
                {/* Info button — top right */}
                <TouchableOpacity style={styles.infoBtn} onPress={() => setShowGuide(true)}>
                  <Ionicons name="information-circle" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.bottomRow}>
                  <TouchableOpacity style={styles.sideBtn} onPress={() => setFlash((f) => !f)}>
                    <Ionicons name={flash ? 'flash' : 'flash-off'} size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.shutterOuter}
                    onPress={phase === 'capture_right' ? captureRightHand : captureLeftHand}
                    disabled={scanning}>
                    <View style={[styles.shutterInner, scanning && { opacity: 0.4 }]} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sideBtn} onPress={pickImage} disabled={scanning}>
                    <Ionicons name="images-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.permBox}>
                <Ionicons name="hand-left" size={44} color={ACCENT} />
                <ThemedText style={styles.permTitle}>{cameraError ? t['palm.camUnavailable'] : t['palm.permNeeded']}</ThemedText>
                <ThemedText style={styles.permDesc}>{cameraError ? t['palm.camDesc'] : t['palm.permDesc']}</ThemedText>
                <TouchableOpacity style={styles.permBtn} onPress={cameraError ? () => setCameraError(null) : requestPermission}>
                  <Ionicons name={cameraError ? 'refresh' : 'camera'} size={16} color="#fff" />
                  <ThemedText style={styles.permBtnTxt}>{cameraError ? t['palm.retry'] : t['palm.allow']}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Phase: Analyzing ── */}
        {phase === 'analyzing' && (
          <View style={styles.analyzingContainer}>
            <Ionicons name="sparkles" size={48} color={ACCENT} />
            <ThemedText style={[styles.analyzingText, { fontSize: fs(language, 16) }]}>
              {language === 'ta' ? 'பகுப்பாய்வு செய்கிறது...' : language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing your palms...'}
            </ThemedText>
            <ThemedText style={[styles.analyzingSub, { fontSize: fs(language, 12) }]}>
              {language === 'ta' ? 'இரண்டு கைகளையும் ஒப்பிட்டு பகுப்பாய்வு செய்கிறோம்' : language === 'hi' ? 'दोनों हाथों की तुलना कर रहे हैं' : 'Comparing both hands for insights'}
            </ThemedText>
          </View>
        )}

        {/* ── Phase: Result (AI Chat) ── */}
        {phase === 'result' && (
          <View style={styles.resultContainer}>
            {/* Reading summary — compact */}
            {reading?.summary && (
              <View style={styles.summaryMini}>
                <Ionicons name="sparkles" size={14} color={ACCENT} />
                <ThemedText style={[styles.summaryMiniTxt, { fontSize: fs(language, 11), lineHeight: lh(language, 11) }]} numberOfLines={3}>
                  {reading.summary}
                </ThemedText>
              </View>
            )}

            {/* Traits chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.traitsScroll} contentContainerStyle={styles.traitsRow}>
              {reading?.traits.map((tr, i) => (
                <View key={i} style={styles.pill}><ThemedText style={[styles.pillTxt, { fontSize: fs(language, 11) }]}>{tr}</ThemedText></View>
              ))}
            </ScrollView>

            {/* AI Chat — like ChatGPT */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatContainer}>
              <ScrollView
                style={styles.chatMsgs}
                contentContainerStyle={styles.chatMsgsContent}
                showsVerticalScrollIndicator={false}>
                {chatMessages.map((m, i) => (
                  <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                    {m.role === 'assistant' && <Ionicons name="sparkles" size={12} color={ACCENT} style={{ marginRight: 5, marginTop: 2 }} />}
                    <ThemedText style={[styles.bubbleTxt, { fontSize: fs(language, 13), lineHeight: lh(language, 13) }, m.role === 'assistant' && { color: '#C5C0B0' }]}>
                      {m.text}
                    </ThemedText>
                  </View>
                ))}
                {typing && (
                  <View style={[styles.bubble, styles.bubbleBot]}>
                    <ThemedText style={[styles.bubbleTxt, { color: '#C5C0B0' }]}>...</ThemedText>
                  </View>
                )}
              </ScrollView>

              {/* Suggestions */}
              {chatMessages.length <= 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sugsScroll} contentContainerStyle={styles.sugsRow}>
                  {(SUGGESTIONS[language] || SUGGESTIONS.en).map((s, i) => (
                    <TouchableOpacity key={i} style={styles.sugPill} onPress={() => sendChat(s)}>
                      <ThemedText style={[styles.sugTxt, { fontSize: fs(language, 11) }]}>{s}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Input */}
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.chatInput, { fontSize: fs(language, 13) }]}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder={t['palm.askHint']}
                  placeholderTextColor="#555"
                  onSubmitEditing={() => sendChat(chatInput)}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendBtn} onPress={() => sendChat(chatInput)}>
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyContent}>
            {scans.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="time-outline" size={36} color={ACCENT} />
                <ThemedText style={styles.emptyTxt}>No readings yet</ThemedText>
              </View>
            ) : scans.map((s) => (
              <TouchableOpacity key={s.id} style={styles.historyCard} onPress={() => {
                setRightReading(s.rightReading ?? s.reading);
                setLeftReading(s.leftReading ?? null);
                setReading(s.reading);
                setTab('scan');
                setPhase('result');
              }}>
                <View style={styles.historyTop}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyIcon}><Ionicons name="hand-left" size={14} color="#fff" /></View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.historyDate}>{s.date}  {s.time}</ThemedText>
                      <ThemedText style={styles.historyTraits} numberOfLines={1}>{s.reading.traits.join(' · ')}</ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => deleteScan(s.id)}>
                    <Ionicons name="trash-outline" size={16} color="#7E7E78" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Guide Popup ── */}
      <Modal visible={showGuide} transparent animationType="fade">
        <TouchableOpacity style={styles.guideModalBg} activeOpacity={1} onPress={() => setShowGuide(false)}>
          <View style={styles.guideModalCard}>
            <View style={styles.guideModalHandle} />
            <ThemedText style={[styles.guideModalTitle, { fontSize: fs(language, 16) }]}>
              {t['palm.guideTitle']}
            </ThemedText>
            {[t['palm.guide1'], t['palm.guide2'], t['palm.guide3'], t['palm.guide4']].map((step, i) => (
              <View key={i} style={styles.guideModalRow}>
                <View style={styles.guideModalNum}><ThemedText style={styles.guideModalNumTxt}>{i + 1}</ThemedText></View>
                <ThemedText style={[styles.guideModalTxt, { fontSize: fs(language, 13) }]}>{step}</ThemedText>
              </View>
            ))}
            <TouchableOpacity style={styles.guideModalBtn} onPress={() => setShowGuide(false)}>
              <ThemedText style={styles.guideModalBtnTxt}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const A = ACCENT;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  bgImg: { resizeMode: 'cover', opacity: 0.5 },

  /* header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  title: { fontWeight: 'bold', color: '#EEEDE0' },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newScanBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#262523', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)' },
  newScanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: A, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  historyBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },

  /* onboarding — fixed, not scrollable */
  onboardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  onboardCard: { backgroundColor: 'rgba(29,29,28,0.92)', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)', width: '100%' },
  onboardTitle: { fontWeight: 'bold', color: '#EEEDE0', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  onboardDesc: { color: '#7E7E78', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  onboardSteps: { width: '100%', marginBottom: 24 },
  onboardStep: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#262523', borderRadius: 12, padding: 14 },
  onboardStepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: A, alignItems: 'center', justifyContent: 'center' },
  onboardStepNumTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  onboardStepTitle: { fontWeight: '700', color: '#EEEDE0' },
  onboardStepDesc: { color: '#7E7E78', marginTop: 2 },
  onboardHandEmoji: { fontSize: 28 },
  onboardArrow: { alignItems: 'center', paddingVertical: 6 },
  onboardBtn: { backgroundColor: A, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, width: '100%' },
  onboardBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  /* idle */
  idleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  idleCard: { backgroundColor: 'rgba(29,29,28,0.92)', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)', width: '100%' },
  idleTitle: { fontWeight: 'bold', color: '#EEEDE0', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  idleDesc: { color: '#7E7E78', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: A, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%' },
  startBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* capture — fixed layout, not scrollable */
  captureScroll: { flex: 1 },
  captureScrollContent: { paddingBottom: 20 },
  instructionBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(29,29,28,0.9)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)', flexShrink: 0 },
  instructionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71' },
  instructionText: { flex: 1, color: '#EEEDE0', fontWeight: '600' },
  phaseIndicator: { flexDirection: 'row', gap: 5 },
  phaseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#444' },
  phaseDotActive: { backgroundColor: A },

  /* camera */
  cameraWrap: { height: 490, marginHorizontal: 16, marginTop: 16, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(176,156,102,0.4)', backgroundColor: '#000', position: 'relative', flexShrink: 0 },
  infoBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', zIndex: 10 },
  bottomRow: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32 },
  sideBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  shutterOuter: { width: 68, height: 68, borderRadius: 34, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },

  /* perm */
  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  permTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  permDesc: { fontSize: 12.5, color: '#7E7E78', textAlign: 'center', lineHeight: 18 },
  permBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: A, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 22, marginTop: 6 },
  permBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },

  /* analyzing */
  analyzingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  analyzingText: { fontWeight: 'bold', color: '#EEEDE0' },
  analyzingSub: { color: '#7E7E78' },

  /* result — fixed chat layout */
  resultContainer: { flex: 1, paddingBottom: 80 },
  summaryMini: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(29,29,28,0.85)', borderRadius: 12, padding: 10 },
  summaryMiniTxt: { flex: 1, color: '#C5C0B0' },
  traitsScroll: { maxHeight: 36, marginTop: 8, marginHorizontal: 16 },
  traitsRow: { gap: 6, paddingHorizontal: 16 },
  pill: { backgroundColor: '#262523', borderRadius: 14, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)' },
  pillTxt: { color: '#C5C0B0', fontWeight: '600' },

  /* chat */
  chatContainer: { flex: 1, marginHorizontal: 16, marginTop: 8 },
  chatMsgs: { flex: 1 },
  chatMsgsContent: { gap: 8, paddingBottom: 8 },
  bubble: { maxWidth: '88%', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: A },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: '#1D1D1C', borderWidth: 1, borderColor: 'rgba(176,156,102,0.15)' },
  bubbleTxt: { flex: 1, color: '#fff', lineHeight: 19 },
  sugsScroll: { maxHeight: 40, marginTop: 4 },
  sugsRow: { gap: 6, paddingVertical: 4 },
  sugPill: { backgroundColor: '#1D1D1C', borderRadius: 14, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(176,156,102,0.2)' },
  sugTxt: { color: '#C5C0B0' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 8 },
  chatInput: { flex: 1, backgroundColor: '#1D1D1C', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, color: '#EEEDE0', borderWidth: 1, borderColor: 'rgba(176,156,102,0.2)' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: A, alignItems: 'center', justifyContent: 'center' },

  /* history */
  historyContent: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 70, gap: 8 },
  emptyTxt: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  historyCard: { backgroundColor: '#1D1D1C', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(176,156,102,0.15)' },
  historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  historyIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: A, alignItems: 'center', justifyContent: 'center' },
  historyDate: { fontSize: 13, fontWeight: '600', color: '#EEEDE0' },
  historyTraits: { fontSize: 11, color: '#7E7E78', marginTop: 1 },

  /* guide popup modal */
  guideModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  guideModalCard: { backgroundColor: '#1A1A19', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(176,156,102,0.3)' },
  guideModalHandle: { width: 32, height: 3.5, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginBottom: 16 },
  guideModalTitle: { fontWeight: 'bold', color: A, marginBottom: 16, textAlign: 'center' },
  guideModalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  guideModalNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: A, alignItems: 'center', justifyContent: 'center' },
  guideModalNumTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  guideModalTxt: { flex: 1, color: '#C5C0B0', lineHeight: 20 },
  guideModalBtn: { backgroundColor: A, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  guideModalBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
