import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const GREEN = '#7BD88F';
const STORE_KEY = 'palm:history';

type Tab = 'scan' | 'history';
type Scan = {
  id: string;
  date: string;
  time: string;
  summary: string;
  traits: string[];
  lines: string[];
};
type ChatMsg = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = [
  'What does my life line mean?',
  'Tell me about my career prospects',
  'How is my love life?',
  'What are my strengths and weaknesses?',
  'Will I have good health this year?',
  'What does my fate line indicate?',
];

export default function PalmReadingScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('scan');
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeScan, setActiveScan] = useState<Scan | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((raw) => {
      if (raw) setScans(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(scans));
  }, [scans]);

  const getAIResponse = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('life line')) return 'Your life line is deep and curved, indicating strong vitality and a long life. Mars mount is well-developed, showing courage.';
    if (lower.includes('heart line')) return 'Your heart line curves toward Jupiter, suggesting you are idealistic in love. The slight fork indicates emotional depth.';
    if (lower.includes('head line')) return 'Your head line is long and straight, showing analytical thinking and strong communication skills. Mercury mount is active.';
    if (lower.includes('marriage')) return 'The marriage line shows 2-3 branches, indicating multiple strong relationships. Venus mount is prominent.';
    if (lower.includes('career') || lower.includes('job')) return 'Your fate line starts from the base of the palm, indicating self-made success. Saturn mount is well-developed for career growth.';
    if (lower.includes('money') || lower.includes('wealth')) return 'The money line is visible. Jupiter mount activity suggests gains through business or investments.';
    if (lower.includes('health')) return 'Your health line is clear and unbroken. A good sign for overall vitality this year.';
    if (lower.includes('strength') || lower.includes('weakness')) return 'Strengths: Strong Sun line (leadership), developed Mercury mount (communication). Weaknesses: Slightly chained Heart line can indicate indecision in love.';
    if (lower.includes('fate')) return 'Your fate line is deep and starts from the base, indicating a self-made path. Saturn rewards your patience and discipline.';
    return 'Based on traditional Vedic palmistry, your palm shows a balanced Mount of Venus and a strong Sun line. This indicates leadership qualities and creative expression.';
  };

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { role: 'user', text: text.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setTyping(true);
    setTimeout(() => {
      const aiMsg: ChatMsg = { role: 'assistant', text: getAIResponse(text.trim()) };
      setChatMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 800);
  };

  const deleteScan = (id: string) => {
    Alert.alert('Delete', 'Remove this reading?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setScans((prev) => prev.filter((s) => s.id !== id)) },
    ]);
  };

  const openScan = (scan: Scan) => {
    setActiveScan(scan);
    setChatMessages([]);
    setTab('scan');
  };

  const startNewScan = () => {
    const now = new Date();
    const newScan: Scan = {
      id: String(Date.now()),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      summary: 'Right hand shows strong life line with Mars influence. Left hand indicates Saturn dominance in career house. Combined analysis suggests a self-made path with strong determination.',
      traits: ['Determined', 'Creative', 'Strong-willed', 'Visionary', 'Loyal'],
      lines: ['Life line: Deep and curved', 'Head line: Long and straight', 'Heart line: Curves to Jupiter', 'Fate line: Starts from base'],
    };
    setScans((prev) => [newScan, ...prev]);
    setActiveScan(newScan);
    setChatMessages([]);
    setTab('scan');
  };

  const showingResult = activeScan && tab === 'scan';

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Palm Reading</Text>
          <View style={s.headerRight}>
            {showingResult && (
              <TouchableOpacity style={s.headerBtn} onPress={startNewScan}>
                <Ionicons name="camera" size={14} color="#fff" />
                <Text style={s.headerBtnTxt}>New</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.headerBtn} onPress={() => { setTab(tab === 'scan' ? 'history' : 'scan'); }}>
              <Ionicons name={tab === 'history' ? 'camera-outline' : 'time-outline'} size={16} color="#fff" />
              <Text style={s.headerBtnTxt}>{tab === 'history' ? 'Scan' : `History (${scans.length})`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Tab */}
        {tab === 'scan' && !showingResult && (
          <View style={s.idleContainer}>
            <View style={s.idleCard}>
              <View style={s.idleIconWrap}>
                <Ionicons name="sparkles" size={44} color={ACCENT} />
              </View>
              <Text style={s.idleTitle}>Ready for Your Reading?</Text>
              <Text style={s.idleDesc}>We'll scan both hands, starting with your right hand.</Text>
              <TouchableOpacity style={s.startBtn} onPress={startNewScan}>
                <Text style={s.startBtnTxt}>Start Scanning</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.uploadCard}>
              <Ionicons name="image" size={22} color={ACCENT} />
              <Text style={s.uploadTxt}>Or upload from gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result / Chat */}
        {showingResult && (
          <View style={s.resultContainer}>
            {/* Summary */}
            <View style={s.summaryMini}>
              <Ionicons name="sparkles" size={14} color={ACCENT} />
              <Text style={s.summaryMiniTxt} numberOfLines={3}>{activeScan.summary}</Text>
            </View>

            {/* Traits */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.traitsRow}>
              {activeScan.traits.map((tr, i) => (
                <View key={i} style={s.pill}><Text style={s.pillTxt}>{tr}</Text></View>
              ))}
            </ScrollView>

            {/* Lines */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.linesRow}>
              {activeScan.lines.map((ln, i) => (
                <View key={i} style={s.lineCard}><Text style={s.lineTxt}>{ln}</Text></View>
              ))}
            </ScrollView>

            {/* Chat */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <ScrollView style={s.chatMsgs} contentContainerStyle={s.chatMsgsContent}>
                {chatMessages.map((m, i) => (
                  <View key={i} style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
                    {m.role === 'assistant' && <View style={s.aiDot}><Ionicons name="sparkles" size={10} color={ACCENT} /></View>}
                    <Text style={[s.bubbleTxt, m.role === 'assistant' && s.bubbleTxtAI]}>{m.text}</Text>
                  </View>
                ))}
                {typing && (
                  <View style={[s.bubble, s.bubbleBot]}>
                    <Text style={[s.bubbleTxt, s.bubbleTxtAI]}>...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Suggestions */}
              {chatMessages.length === 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sugsRow}>
                  {SUGGESTIONS.map((sg, i) => (
                    <TouchableOpacity key={i} style={s.sugPill} onPress={() => sendChat(sg)}>
                      <Text style={s.sugTxt}>{sg}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Input */}
              <View style={s.inputRow}>
                <TextInput
                  style={s.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Ask about your palm..."
                  placeholderTextColor="#AAAAAA"
                  onSubmitEditing={() => sendChat(chatInput)}
                  returnKeyType="send"
                />
                <TouchableOpacity style={s.sendBtn} onPress={() => sendChat(chatInput)}>
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.historyContent}>
            {scans.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="time-outline" size={36} color={ACCENT} />
                <Text style={s.emptyTxt}>No readings yet</Text>
              </View>
            ) : scans.map((sc) => (
              <TouchableOpacity key={sc.id} style={s.historyCard} onPress={() => openScan(sc)}>
                <View style={s.historyTop}>
                  <View style={s.historyIcon}><Ionicons name="hand-left" size={14} color="#fff" /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyDate}>{sc.date}  {sc.time}</Text>
                    <Text style={s.historyTraits} numberOfLines={1}>{sc.traits.join(' · ')}</Text>
                  </View>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => deleteScan(sc.id)}>
                    <Ionicons name="trash-outline" size={16} color="#7E7E78" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
  },
  headerBtnTxt: { fontSize: 12, fontWeight: '600', color: '#fff' },

  /* Idle */
  idleContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  idleCard: {
    backgroundColor: CARD_BG, borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: BORDER,
  },
  idleIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(176,156,102,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  idleTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  idleDesc: { fontSize: 13, color: TEXT_MID, textAlign: 'center', lineHeight: 18 },
  startBtn: {
    backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 10,
  },
  startBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  uploadCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, backgroundColor: CARD_BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER,
  },
  uploadTxt: { fontSize: 13, fontWeight: '500', color: TEXT_MID },

  /* Result */
  resultContainer: { flex: 1, paddingHorizontal: 16 },
  summaryMini: {
    flexDirection: 'row', gap: 8, backgroundColor: CARD_BG, borderRadius: 12,
    padding: 12, marginTop: 8, borderWidth: 1, borderColor: BORDER,
  },
  summaryMiniTxt: { flex: 1, fontSize: 12, color: TEXT_DARK, lineHeight: 17 },
  traitsRow: { gap: 8, paddingVertical: 10 },
  pill: {
    backgroundColor: 'rgba(176,156,102,0.1)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: BORDER,
  },
  pillTxt: { fontSize: 12, fontWeight: '500', color: ACCENT },
  linesRow: { gap: 8, paddingBottom: 10 },
  lineCard: {
    backgroundColor: CARD_BG, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER,
  },
  lineTxt: { fontSize: 11, color: TEXT_MID },

  chatMsgs: { flex: 1 },
  chatMsgsContent: { paddingVertical: 10, gap: 10 },
  bubble: { flexDirection: 'row', maxWidth: '82%', gap: 6 },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleBot: { alignSelf: 'flex-start' },
  aiDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(176,156,102,0.15)', alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  bubbleTxt: {
    fontSize: 13, color: '#FFFFFF', backgroundColor: ACCENT,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, lineHeight: 18,
  },
  bubbleTxtAI: { color: TEXT_DARK, backgroundColor: CARD_BG },
  sugsRow: { gap: 8, paddingVertical: 8 },
  sugPill: {
    backgroundColor: CARD_BG, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: BORDER,
  },
  sugTxt: { fontSize: 11, color: ACCENT },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE',
  },
  chatInput: {
    flex: 1, fontSize: 14, color: TEXT_DARK, backgroundColor: CARD_BG,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },

  /* History */
  historyContent: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt: { fontSize: 14, color: TEXT_MID },
  historyCard: {
    backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  historyTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  historyDate: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  historyTraits: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
});
