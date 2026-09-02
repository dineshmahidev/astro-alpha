import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { ChatChartPanel } from '@/components/chat-chart-panel';

import { isAstrologer, useAuth } from '@/contexts/auth-context';
import {
  getUserByEmail,
  listMessages,
  sendMessage,
  subscribeChat,
  startSession,
  closeSession,
  type Message,
} from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import { computeAstroReport } from '@/lib/pipeline';

const ACCENT = '#B09C66';
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

function chartFromRow(row: { dob?: string | null; tob?: string | null; tob_known?: boolean | null; place?: string | null } | null) {
  if (!row?.dob) return null;
  const [d, m, y] = row.dob.split('/').map(Number);
  let birthDate = new Date(y, m - 1, d);
  if (row.tob_known && row.tob) {
    const [hh, mm] = row.tob.split(':').map(Number);
    birthDate = new Date(y, m - 1, d, hh, mm);
  }
  return computeAstroReport({ birthDate, place: row.place ?? undefined });
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { role, language } = useAuth();
  const isAstro = isAstrologer(role);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const chatId = id ?? '';
  const [chartData, setChartData] = useState<ReturnType<typeof chartFromRow>>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [chatType, setChatType] = useState<string>('vedic');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if this is a palm reading chat
  useEffect(() => {
    if (!chatId) return;
    (async () => {
      try {
        const { data: chat } = await supabase
          .from('chats')
          .select('specialty')
          .eq('id', chatId)
          .maybeSingle();
        if (chat?.specialty) setChatType(chat.specialty.toLowerCase());
      } catch (e) {
        console.warn('[ChatRoom] failed to load chat type', e);
      }
    })();
  }, [chatId]);

  const isPalmReading = chatType.includes('palm');

  useEffect(() => {
    if (!isAstro || !chatId) return;
    (async () => {
      try {
        const { data: chat } = await supabase
          .from('chats')
          .select('user_email')
          .eq('id', chatId)
          .maybeSingle();
        const row = await getUserByEmail(chat?.user_email ?? '');
        const r = chartFromRow(row);
        if (r) setChartData(r);
      } catch (e) {
        console.warn('[ChatRoom] failed to load user chart', e);
      }
    })();
  }, [isAstro, chatId]);

  useEffect(() => {
    return () => {
      if (chatId) closeSession(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    let active = true;
    (async () => {
      const msgs = await listMessages(chatId);
      if (!active) return;
      setMessages(msgs);
      setLoaded(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 150);
    })();
    const sub = subscribeChat(chatId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => {
      active = false;
      sub.unsubscribe();
    };
  }, [chatId]);

  const handleSend = async () => {
    const t = text.trim();
    if ((!t && !selectedImage) || sending || !chatId) return;
    setSending(true);
    setText('');
    if (!sessionStarted) {
      await startSession(chatId);
      setSessionStarted(true);
    }
    const sender = isAstro ? 'astrologer' : 'user';

    // If image selected, send as text with image prefix
    let messageText = t;
    if (selectedImage) {
      messageText = t ? `[IMAGE: ${selectedImage}] ${t}` : `[IMAGE: ${selectedImage}]`;
      setSelectedImage(null);
    }

    const sent = await sendMessage(chatId, sender, messageText);
    if (sent) {
      setMessages((prev) => (prev.some((x) => x.id === sent.id) ? prev : [...prev, sent]));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setSending(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload palm images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>
                {isAstro ? 'Consultation' : 'Astrologer Chat'}
              </Text>
              <Text style={styles.headerSub}>
                {isPalmReading ? 'Palm Reading' : isAstro ? 'Live consultation' : 'Vedic guidance'}
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {isAstro && chartData && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="planet" size={16} color={ACCENT} />
                  <Text style={styles.chartTitle}>User Birth Chart</Text>
                </View>
                <ChatChartPanel report={chartData} language={language} />
              </View>
            )}
            {!isAstro && (
              <View style={styles.infoBanner}>
                <Ionicons name="shield-checkmark" size={16} color={ACCENT} />
                <Text style={styles.infoText}>
                  {isPalmReading
                    ? 'Upload a clear photo of your palm for reading.'
                    : 'Your birth details have been shared with the astrologer for an accurate reading.'}
                </Text>
              </View>
            )}

            {!loaded ? (
              <Text style={styles.loading}>Loading…</Text>
            ) : messages.length === 0 ? (
              <Text style={styles.loading}>
                {isAstro ? 'No messages yet. Say hello to start.' : 'Send a message to begin.'}
              </Text>
            ) : (
              messages.map((m) => {
                const mine = m.sender === (isAstro ? 'astrologer' : 'user');
                const hasImage = m.text.includes('[IMAGE:');
                const imageUri = hasImage ? m.text.match(/\[IMAGE: (.*?)\]/)?.[1] : null;
                const textOnly = hasImage ? m.text.replace(/\[IMAGE:.*?\]\s*/g, '') : m.text;
                return (
                  <View key={m.id} style={[styles.msgWrap, mine ? styles.msgWrapMine : styles.msgWrapTheirs]}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      {imageUri && (
                        <Image source={{ uri: imageUri }} style={styles.msgImage} resizeMode="cover" />
                      )}
                      {textOnly ? (
                        <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                          {textOnly}
                        </Text>
                      ) : null}
                      <Text style={styles.msgTime}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImg} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImg} onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={22} color="#EF5350" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBar}>
            {isPalmReading && !isAstro && (
              <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                <Ionicons name="camera" size={22} color={ACCENT} />
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={isAstro ? 'Reply to the user…' : isPalmReading ? 'Describe your question…' : 'Type a message…'}
              placeholderTextColor={TEXT_MID}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, ((!text.trim() && !selectedImage) || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={(!text.trim() && !selectedImage) || sending}>
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 8 },
  headerInfo: { flex: 1, marginLeft: 4 },
  headerName: { fontSize: 17, fontWeight: 'bold', color: TEXT_DARK },
  headerSub: { fontSize: 12, color: TEXT_MID, marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 10 },
  chartCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: TEXT_DARK },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoText: { flex: 1, fontSize: 13, color: TEXT_MID, lineHeight: 19 },
  loading: { color: TEXT_MID, textAlign: 'center', marginTop: 20 },
  msgWrap: { flexDirection: 'row', marginBottom: 2 },
  msgWrapMine: { justifyContent: 'flex-end' },
  msgWrapTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: ACCENT, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: CARD_BG, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: BORDER },
  bubbleTextMine: { color: '#ffffff', fontSize: 15, lineHeight: 21 },
  bubbleTextTheirs: { color: TEXT_DARK, fontSize: 15, lineHeight: 21 },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 4, alignSelf: 'flex-end' },
  msgImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  input: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: TEXT_DARK,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  imagePreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  previewImg: { width: 60, height: 60, borderRadius: 8 },
  removeImg: { marginLeft: 8 },
});