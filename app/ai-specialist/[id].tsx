import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAISpecialist, type AISpecialist } from '@/constants/ai-specialists';
import { useAuth } from '@/contexts/auth-context';

const ACCENT = '#B09C66';
const CARD_BG = '#F5F5F5';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_DIM = '#999999';
const GREEN = '#7BD88F';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
};

function generateAIResponse(spec: AISpecialist, userMsg: string): string {
  const lower = userMsg.toLowerCase();
  const r = spec.report;
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return `Namaste! I'm your ${spec.name}. Ask me anything about ${spec.tagline.toLowerCase()}.`;
  if (lower.includes('remedy') || lower.includes('remedies')) return r[3] ?? r[0];
  if (lower.includes('today') || lower.includes('now') || lower.includes('week')) return r[0] ?? r[1];
  if (lower.includes('love') || lower.includes('marriage') || lower.includes('partner')) return r[2] ?? r[1];
  if (lower.includes('career') || lower.includes('job') || lower.includes('work')) return r[1] ?? r[0];
  if (lower.includes('money') || lower.includes('wealth') || lower.includes('finance')) return r[0] ?? r[2];
  if (lower.includes('health')) return r[0] ?? r[3];
  if (lower.includes('thank')) return `You're welcome! May the stars guide you well.`;
  return r[Math.floor(Math.random() * r.length)] ?? `Based on your chart, focus on positive actions and stay mindful of planetary influences.`;
}

export default function AISpecialistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const spec = getAISpecialist(id ?? '');
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (spec && messages.length === 0) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: `Namaste ${user?.name ?? 'friend'}!\n\nI'm your ${spec.name}. ${spec.tagline}.\n\nHow can I guide you today?`,
        time: now,
      }]);
    }
  }, [spec?.id]);

  const send = () => {
    const txt = input.trim();
    if (!txt || !spec) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: txt, time: now }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: generateAIResponse(spec, txt), time: now }]);
      setTyping(false);
    }, 1200);
  };

  if (!spec) {
    return (
      <View style={s.screen}>
        <Text style={{ textAlign: 'center', marginTop: 60, color: TEXT_DIM }}>Not found</Text>
      </View>
    );
  }

  const data = typing
    ? [...messages, { id: '__typing', role: 'ai' as const, text: '', time: '' }]
    : messages;

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Image source={spec.avatar} style={s.headerAvatar} contentFit="cover" />
        <View style={s.headerInfo}>
          <Text style={s.headerName}>{spec.name}</Text>
          <Text style={s.headerStatus}>AI Astrologer</Text>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        style={s.list}
        contentContainerStyle={s.listContent}
        data={data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatRef.current?.scrollToEnd?.({ animated: false })}
        renderItem={({ item }) => {
          if (item.id === '__typing') {
            return (
              <View style={s.row}>
                <Image source={spec.avatar} style={s.avatar} contentFit="cover" />
                <View style={s.typingWrap}>
                  <View style={s.typingDot} />
                  <View style={[s.typingDot, s.typingMid]} />
                  <View style={s.typingDot} />
                </View>
              </View>
            );
          }
          const isUser = item.role === 'user';
          return (
            <View style={[s.row, isUser && s.rowRight]}>
              {!isUser && <Image source={spec.avatar} style={s.avatar} contentFit="cover" />}
              <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI]}>
                <Text style={[s.text, isUser && s.textUser]}>{item.text}</Text>
                <Text style={[s.time, isUser && s.timeUser]}>{item.time}</Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 6 }]}>
        <View style={s.inputWrap}>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#AAAAAA"
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity style={[s.sendBtn, !input.trim() && s.sendOff]} onPress={send} disabled={!input.trim()}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ECE5DD' },
  flex: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, backgroundColor: ACCENT },
  backBtn: { padding: 6 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  headerStatus: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // List
  list: { flex: 1 },
  listContent: { paddingVertical: 10, paddingHorizontal: 10 },

  // Rows
  row: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  rowRight: { justifyContent: 'flex-end' },

  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },

  // Bubbles
  bubble: { maxWidth: '78%', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  bubbleUser: { backgroundColor: '#DCF8C6', borderBottomRightRadius: 2 },
  bubbleAI: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 2 },

  text: { fontSize: 15, color: '#303030', lineHeight: 20 },
  textUser: { color: '#303030' },
  time: { fontSize: 11, color: '#8696A0', marginTop: 2, alignSelf: 'flex-end' },
  timeUser: { color: '#66BB6A' },

  // Typing
  typingWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 4, borderBottomLeftRadius: 2 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8696A0' },
  typingMid: { height: 7 },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10, paddingTop: 8, backgroundColor: '#F0F0F0', borderTopWidth: 0.3, borderTopColor: '#D0D0D0', gap: 6 },
  inputWrap: { flex: 1, backgroundColor: '#fff', borderRadius: 22, borderWidth: 0.5, borderColor: '#D0D0D0', paddingHorizontal: 14, minHeight: 42, justifyContent: 'center' },
  textInput: { fontSize: 15, color: TEXT_DARK, maxHeight: 100, padding: 0, textAlignVertical: 'center' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
});
